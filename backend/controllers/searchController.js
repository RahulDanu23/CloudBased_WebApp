const supabase = require('../config/supabase');

// ==========================================
// SEARCH FILES & FOLDERS
// ==========================================

const searchItems = async (req, res) => {
  try {
    const { q } = req.query;
    const user_id = req.user.id;

    if (!q || q.trim() === '') {
      return res.status(400).json({ message: "Search query 'q' is required" });
    }

    // 1. Search Folders
    // We use ilike for case-insensitive search
    const { data: folders, error: folderErr } = await supabase
      .from('folders')
      .select('*')
      .eq('owner_id', user_id)
      .eq('is_deleted', false)
      .ilike('name', `%${q}%`);

    if (folderErr) return res.status(400).json({ message: folderErr.message });

    // 2. Search Files
    const { data: files, error: fileErr } = await supabase
      .from('files')
      .select('*')
      .eq('owner_id', user_id)
      .eq('is_deleted', false)
      .ilike('name', `%${q}%`);

    if (fileErr) return res.status(400).json({ message: fileErr.message });

    return res.status(200).json({
      results: {
        folders: folders || [],
        files: files || []
      }
    });

  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  searchItems
};
