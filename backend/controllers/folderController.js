const supabase = require('../config/supabase');

// Helper to get folder breadcrumbs recursively
const getFolderPath = async (folderId, path = []) => {
  if (!folderId) return path;

  const { data: folder } = await supabase
    .from('folders')
    .select('id, name, parent_id')
    .eq('id', folderId)
    .single();

  if (folder) {
    path.unshift({ id: folder.id, name: folder.name });
    if (folder.parent_id) {
      return getFolderPath(folder.parent_id, path);
    }
  }
  return path;
};

// 1. Create Folder
const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const user_id = req.user.id;

    if (!name) return res.status(400).json({ message: "Folder name is required" });

    const { data, error } = await supabase
      .from('folders')
      .insert([{ name, owner_id: user_id, parent_id: parentId || null }])
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });
    return res.status(201).json({ folder: data });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Get Folder with Children and Path (GET /api/folders/:id)
// Use id 'root' for the root directory
const getFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const isRoot = id === 'root';

    // 1. Get Folder Info
    let folder = null;
    let path = [];
    if (!isRoot) {
      const { data: f, error: fErr } = await supabase
        .from('folders')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user_id)
        .eq('is_deleted', false)
        .single();
      
      if (fErr) return res.status(404).json({ message: "Folder not found" });
      folder = f;
      path = await getFolderPath(folder.id);
    }

    // 2. Get Sub-folders
    let foldersQuery = supabase.from('folders').select('*').eq('owner_id', user_id).eq('is_deleted', false).order('name');
    if (isRoot) foldersQuery = foldersQuery.is('parent_id', null);
    else foldersQuery = foldersQuery.eq('parent_id', id);
    const { data: childFolders } = await foldersQuery;

    // 3. Get Files
    let filesQuery = supabase.from('files').select('*').eq('owner_id', user_id).eq('is_deleted', false).order('created_at', { ascending: false });
    if (isRoot) filesQuery = filesQuery.is('folder_id', null);
    else filesQuery = filesQuery.eq('folder_id', id);
    const { data: childFiles } = await filesQuery;

    return res.status(200).json({
      folder,
      children: {
        folders: childFolders || [],
        files: childFiles || []
      },
      path
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Rename or Move Folder (PATCH /api/folders/:id)
const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    const user_id = req.user.id;

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (parentId !== undefined) updates.parent_id = parentId;

    const { data, error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', id)
      .eq('owner_id', user_id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });
    return res.status(200).json({ folder: data });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 4. Soft Delete Folder
const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('folders')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_id', user_id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });
    return res.status(200).json({ message: "Folder deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createFolder,
  getFolder,
  updateFolder,
  deleteFolder
};
