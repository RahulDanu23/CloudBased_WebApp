const express = require('express');
const multer = require('multer');
const { uploadFile, getFile, updateFile, deleteFile } = require('../controllers/fileController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(requireAuth);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id', getFile);
router.patch('/:id', updateFile);
router.delete('/:id', deleteFile);

module.exports = router;
