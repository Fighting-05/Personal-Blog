const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { avatarUpload } = require('../utils/upload');
const { validate, registerRules, loginRules, updatePasswordRules, updateProfileRules } = require('../middleware/validators');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.put('/profile', isAuthenticated, avatarUpload.single('avatar'), updateProfileRules, validate, authController.updateProfile);
router.put('/password', isAuthenticated, updatePasswordRules, validate, authController.updatePassword);

module.exports = router;
