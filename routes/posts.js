const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuthenticated, optionalAuth } = require('../middleware/auth');
const { upload } = require('../utils/upload');
const { validate, createPostRules, updatePostRules, createCommentRules, likeRules, idParam } = require('../middleware/validators');

router.get('/', postController.getPosts);
router.get('/hot', postController.getHotPosts);
router.get('/archive', postController.getArchive);
router.get('/tags', postController.getTags);
router.get('/categories', postController.getCategories);
router.get('/:slug', postController.getPost);

router.post('/', isAuthenticated, upload.single('coverImage'), createPostRules, validate, postController.createPost);
router.put('/:id', isAuthenticated, upload.single('coverImage'), idParam, updatePostRules, validate, postController.updatePost);
router.delete('/:id', isAuthenticated, idParam, validate, postController.deletePost);
router.post('/:id/toggle-pin', isAuthenticated, idParam, validate, postController.togglePin);

router.post('/like', isAuthenticated, likeRules, validate, postController.likePost);
router.post('/comments', optionalAuth, createCommentRules, validate, postController.createComment);
router.delete('/comments/:id', isAuthenticated, idParam, validate, postController.deleteComment);
router.post('/comments/:id/like', isAuthenticated, postController.likeComment);

module.exports = router;
