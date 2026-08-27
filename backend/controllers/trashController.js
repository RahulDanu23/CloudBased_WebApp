const supabase = require('../config/supabase');

// ==========================================
// TRASH MANAGEMENT
// ==========================================

// 1. Get all items in trash
const getTrash = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data: folders, error: folderErr } = await supabase
      .from('folders')
      .select('*')
      .eq('owner_id', user_id)
      .eq('is_deleted', true);

    if (folderErr) return res.status(400).json({ message: folderErr.message });

    const { data: files, error: fileErr } = await supabase
      .from('files')
      .select('*')
      .eq('owner_id', user_id)
      .eq('is_deleted', true);

    if (fileErr) return res.status(400).json({ message: fileErr.message });

    return res.status(200).json({
      trash: {
        folders: folders || [],
        files: files || []
      }
    });
  } catch (err) {
    console.error("Get trash error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Restore an item from trash
const restoreItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const user_id = req.user.id;

    if (!['file', 'folder'].includes(type)) {
      return res.status(400).json({ message: "Invalid type. Must be 'file' or 'folder'" });
    }

    const table = type === 'file' ? 'files' : 'folders';

    const { data, error } = await supabase
      .from(table)
      .update({ is_deleted: false })
      .eq('id', id)
      .eq('owner_id', user_id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    return res.status(200).json({ message: `${type} restored successfully`, [type]: data });
  } catch (err) {
    console.error("Restore error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Empty Trash (Permanent Delete)
const emptyTrash = async (req, res) => {
  try {
    const user_id = req.user.id;

    // A. Find all deleted files to remove them from Supabase Storage first
    const { data: filesToDelete, error: fetchErr } = await supabase
      .from('files')
      .select('storage_key')
      .eq('owner_id', user_id)
      .eq('is_deleted', true);

    if (fetchErr) return res.status(400).json({ message: fetchErr.message });

    if (filesToDelete && filesToDelete.length > 0) {
      const storageKeys = filesToDelete.map(f => f.storage_key);
      const { error: storageErr } = await supabase.storage
        .from('media-files')
        .remove(storageKeys);

      if (storageErr) {
        console.error("Error removing files from storage:", storageErr);
        // We continue anyway to clean up the DB
      }
    }

    // B. Delete files from database
    const { error: fileDeleteErr } = await supabase
      .from('files')
      .delete()
      .eq('owner_id', user_id)
      .eq('is_deleted', true);

    if (fileDeleteErr) return res.status(400).json({ message: fileDeleteErr.message });

    // C. Delete folders from database (Postgres CASCADE should handle child folders if set up correctly, 
    // but doing it explicitly for is_deleted=true is safer)
    const { error: folderDeleteErr } = await supabase
      .from('folders')
      .delete()
      .eq('owner_id', user_id)
      .eq('is_deleted', true);

    if (folderDeleteErr) return res.status(400).json({ message: folderDeleteErr.message });

    return res.status(200).json({ message: "Trash emptied successfully" });
  } catch (err) {
    console.error("Empty trash error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTrash,
  restoreItem,
  emptyTrash
};
