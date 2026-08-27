const supabase = require('../config/supabase');

// ==========================================
// STARS / FAVORITES
// ==========================================

// 1. Toggle Star (Add or Remove)
const toggleStar = async (req, res) => {
  try {
    const { type, id } = req.params;
    const user_id = req.user.id;

    if (!['file', 'folder'].includes(type)) {
      return res.status(400).json({ message: "Invalid type. Must be 'file' or 'folder'" });
    }

    // Check if it's already starred
    const { data: existingStar } = await supabase
      .from('stars')
      .select('*')
      .eq('user_id', user_id)
      .eq('resource_type', type)
      .eq('resource_id', id)
      .single();

    if (existingStar) {
      // Unstar
      const { error } = await supabase
        .from('stars')
        .delete()
        .eq('user_id', user_id)
        .eq('resource_type', type)
        .eq('resource_id', id);

      if (error) return res.status(400).json({ message: error.message });
      return res.status(200).json({ message: "Item unstarred", isStarred: false });
    } else {
      // Star
      const { error } = await supabase
        .from('stars')
        .insert([
          {
            user_id: user_id,
            resource_type: type,
            resource_id: id
          }
        ]);

      if (error) return res.status(400).json({ message: error.message });
      return res.status(200).json({ message: "Item starred", isStarred: true });
    }
  } catch (err) {
    console.error("Toggle star error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Get all starred items
const getStars = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data: stars, error } = await supabase
      .from('stars')
      .select('*')
      .eq('user_id', user_id);

    if (error) return res.status(400).json({ message: error.message });

    // Separate IDs
    const fileIds = stars.filter(s => s.resource_type === 'file').map(s => s.resource_id);
    const folderIds = stars.filter(s => s.resource_type === 'folder').map(s => s.resource_id);

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

    const enrichedStars = stars.map(star => {
      let resource = null;
      if (star.resource_type === 'file') {
        resource = filesData.find(f => f.id === star.resource_id);
      } else {
        resource = foldersData.find(f => f.id === star.resource_id);
      }
      return {
        ...star,
        resource: resource || { message: "Resource no longer available or deleted" }
      };
    }).filter(star => !star.resource.message);

    return res.status(200).json({ stars: enrichedStars });
  } catch (err) {
    console.error("Get stars error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  toggleStar,
  getStars
};
