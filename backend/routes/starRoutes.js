const express = require('express');
const { toggleStar, getStars } = require('../controllers/starController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getStars);
router.post('/:type/:id', toggleStar);

module.exports = router;
