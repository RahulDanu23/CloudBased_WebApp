const express = require('express');
const { searchItems } = require('../controllers/searchController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', searchItems);

module.exports = router;
