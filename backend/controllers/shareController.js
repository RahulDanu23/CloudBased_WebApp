const supabase = require('../config/supabase');
const { randomUUID } = require('crypto');

// ==========================================
// INTERNAL USER-TO-USER SHARING
// ==========================================

// 1. Share an item with another user
const shareItem = async (req, res) => {
  try {
    const { resourceType, resourceId, granteeEmail, role } = req.body;
    const user_id = req.user.id;

    if (!['file', 'folder'].includes(resourceType)) {
      return res.status(400).json({ message: "Invalid resource type" });
    }
    if (!['viewer', 'editor'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Lookup grantee user ID by email
    const { data: grantee, error: granteeErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', granteeEmail)
      .single();

    if (granteeErr || !grantee) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    if (grantee.id === user_id) {
      return res.status(400).json({ message: "You cannot share an item with yourself" });
    }

    // Insert into shares table
    const { data: shareData, error: shareErr } = await supabase
      .from('shares')
      .insert([
        {
          resource_type: resourceType,
          resource_id: resourceId,
          grantee_user_id: grantee.id,
          role: role,
          created_by: user_id
        }
      ])
      .select()
      .single();

    if (shareErr) {
      if (shareErr.code === '23505') {
        return res.status(400).json({ message: "Item is already shared with this user" });
      }
      return res.status(400).json({ message: shareErr.message });
    }

    return res.status(201).json({ message: "Item shared successfully", share: shareData });
  } catch (err) {
    console.error("Share error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Get items shared with me
const getSharedWithMe = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Fetch shares where user is grantee
    const { data: shares, error } = await supabase
      .from('shares')
      .select(`
        *,
        creator:users!created_by(id, name, email)
      `)
      .eq('grantee_user_id', user_id);

    if (error) return res.status(400).json({ message: error.message });

    // Note: To make this robust, we would ideally do a join with files/folders. 
    // Since Supabase JS joins can be tricky with polymorphic relations (resource_type), 
    // we fetch them cleanly here.
    const fileIds = shares.filter(s => s.resource_type === 'file').map(s => s.resource_id);
    const folderIds = shares.filter(s => s.resource_type === 'folder').map(s => s.resource_id);

    let filesData = [];
    let foldersData = [];

    if (fileIds.length > 0) {
      const { data } = await supabase.from('files').select('*').in('id', fileIds).eq('is_deleted', false);
      filesData = data || [];
    }
    
    if (folderIds.length > 0) {
      const { data } = await supabase.from('folders').select('*').in('id', folderIds).eq('is_deleted', false);
      foldersData = data || [];
    }

    // Attach metadata back to shares
    const enrichedShares = shares.map(share => {
      let resourceDetails = null;
      if (share.resource_type === 'file') {
        resourceDetails = filesData.find(f => f.id === share.resource_id);
      } else {
        resourceDetails = foldersData.find(f => f.id === share.resource_id);
      }
      return {
        ...share,
        resource: resourceDetails || { message: "Resource no longer available" }
      };
    }).filter(share => !share.resource.message); // Filter out deleted items

    return res.status(200).json({ shares: enrichedShares });
  } catch (err) {
    console.error("Get shared error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Revoke a share
const revokeShare = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Only the creator of the share can revoke it
    const { error } = await supabase
      .from('shares')
      .delete()
      .eq('id', id)
      .eq('created_by', user_id);

    if (error) return res.status(400).json({ message: error.message });

    return res.status(200).json({ message: "Share revoked" });
  } catch (err) {
    console.error("Revoke share error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// PUBLIC LINK SHARING
// ==========================================

// 4. Create a public share link
const createPublicLink = async (req, res) => {
  try {
    const { resourceType, resourceId, expiresAt } = req.body;
    const user_id = req.user.id;

    if (!['file', 'folder'].includes(resourceType)) {
      return res.status(400).json({ message: "Invalid resource type" });
    }

    const token = randomUUID();

    const { data: linkShare, error } = await supabase
      .from('link_shares')
      .insert([
        {
          resource_type: resourceType,
          resource_id: resourceId,
          token: token,
          role: 'viewer', // Links are viewer only in this schema
          expires_at: expiresAt || null,
          created_by: user_id
        }
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    // The frontend can construct the full URL: https://yourapp.com/share/{token}
    return res.status(201).json({ message: "Public link created", link: linkShare });
  } catch (err) {
    console.error("Create link error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 5. Access a public share link (NO AUTH REQUIRED)
const getPublicLinkItem = async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Validate token
    const { data: linkData, error: linkErr } = await supabase
      .from('link_shares')
      .select('*')
      .eq('token', token)
      .single();

    if (linkErr || !linkData) {
      return res.status(404).json({ message: "Invalid or expired share link" });
    }

    // 2. Check expiration
    if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
      return res.status(410).json({ message: "This share link has expired" });
    }

    // 3. Fetch resource details
    if (linkData.resource_type === 'file') {
      const { data: fileData } = await supabase
        .from('files')
        .select('*')
        .eq('id', linkData.resource_id)
        .eq('is_deleted', false)
        .single();

      if (!fileData) return res.status(404).json({ message: "File not found or deleted" });

      // Generate a signed URL for download
      const { data: signedData } = await supabase.storage
        .from('media-files')
        .createSignedUrl(fileData.storage_key, 3600);

      return res.status(200).json({ 
        type: 'file', 
        resource: fileData, 
        signedUrl: signedData?.signedUrl 
      });

    } else if (linkData.resource_type === 'folder') {
      const { data: folderData } = await supabase
        .from('folders')
        .select('*')
        .eq('id', linkData.resource_id)
        .eq('is_deleted', false)
        .single();
      
      if (!folderData) return res.status(404).json({ message: "Folder not found or deleted" });

      // Get immediate children of the shared folder
      const { data: childFolders } = await supabase.from('folders').select('*').eq('parent_id', folderData.id).eq('is_deleted', false);
      const { data: childFiles } = await supabase.from('files').select('*').eq('folder_id', folderData.id).eq('is_deleted', false);

      return res.status(200).json({ 
        type: 'folder', 
        resource: folderData,
        children: {
          folders: childFolders || [],
          files: childFiles || []
        }
      });
    }

  } catch (err) {
    console.error("Access link error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  shareItem,
  getSharedWithMe,
  revokeShare,
  createPublicLink,
  getPublicLinkItem
};
