const express = require('express');
const { register, login, logout, getMe, forgotPassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/me', requireAuth, getMe);

module.exports = router;