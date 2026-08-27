const express = require('express');
const { getTrash, restoreItem, emptyTrash } = require('../controllers/trashController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getTrash);
router.post('/restore/:type/:id', restoreItem);
router.delete('/empty', emptyTrash);

module.exports = router;
