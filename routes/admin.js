const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { validate, categoryRules, idParam } = require('../middleware/validators');

router.use(isAuthenticated, isAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/posts', adminController.listPosts);

router.get('/comments', adminController.listComments);
router.delete('/comments/:id', idParam, validate, adminController.deleteComment);

router.get('/users', adminController.listUsers);
router.delete('/users/:id', idParam, validate, adminController.deleteUser);

router.get('/categories', adminController.getCategories);
router.post('/categories', categoryRules, validate, adminController.createCategory);
router.put('/categories/:id', idParam, categoryRules, validate, adminController.updateCategory);
router.delete('/categories/:id', idParam, validate, adminController.deleteCategory);

module.exports = router;
