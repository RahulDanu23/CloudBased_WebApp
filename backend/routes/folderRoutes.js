const express = require('express');
const { createFolder, getFolder, updateFolder, deleteFolder } = require('../controllers/folderController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth);

router.post('/', createFolder);
router.get('/:id', getFolder);
router.patch('/:id', updateFolder);
router.delete('/:id', deleteFolder);

module.exports = router;
