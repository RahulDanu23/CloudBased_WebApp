const supabase = require('../config/supabase');
const { randomUUID } = require('crypto');

// 1. Upload File (Multer approach instead of complex presigned chunking)
const uploadFile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { folder_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file provided" });

    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const storagePath = `${user_id}/${uniqueFileName}`; 

    const { error: storageError } = await supabase.storage
      .from('media-files')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (storageError) return res.status(400).json({ message: "Failed to upload to storage" });

    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert([{
        name: file.originalname,
        size_bytes: file.size,
        mime_type: file.mimetype,
        storage_key: storagePath,
        owner_id: user_id,
        folder_id: folder_id || null
      }])
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from('media-files').remove([storagePath]);
      return res.status(400).json({ message: "Failed to save metadata" });
    }

    return res.status(201).json({ file: fileRecord });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Get File and Signed URL (GET /api/files/:id)
const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Get metadata
    const { data: file, error: dbError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user_id)
      .eq('is_deleted', false)
      .single();

    if (dbError || !file) return res.status(404).json({ message: "File not found" });

    // Generate signed URL (expires in 1 hour)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('media-files')
      .createSignedUrl(file.storage_key, 3600);

    if (signedError) return res.status(400).json({ message: "Could not generate file link" });

    return res.status(200).json({ file, signedUrl: signedData.signedUrl });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Rename or Move File (PATCH /api/files/:id)
const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, folderId } = req.body;
    const user_id = req.user.id;

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (folderId !== undefined) updates.folder_id = folderId;

    const { data, error } = await supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .eq('owner_id', user_id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });
    return res.status(200).json({ file: data });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 4. Soft Delete File (DELETE /api/files/:id)
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('files')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_id', user_id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });
    return res.status(200).json({ message: "File deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  uploadFile,
  getFile,
  updateFile,
  deleteFile
};
