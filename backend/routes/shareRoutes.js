const express = require('express');
const {
  shareItem,
  getSharedWithMe,
  revokeShare,
  createPublicLink,
  getPublicLinkItem
} = require('../controllers/shareController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
// This endpoint must NOT use requireAuth because it's for public link access
router.get('/link/:token', getPublicLinkItem);

// ==========================================
// PROTECTED ROUTES
// ==========================================
router.use(requireAuth);

router.post('/', shareItem);
router.get('/shared-with-me', getSharedWithMe);
router.delete('/:id', revokeShare);
router.post('/link', createPublicLink);

module.exports = router;
