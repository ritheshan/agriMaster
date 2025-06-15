const express = require('express');
const multer = require('multer');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();
const communityController = require('../controllers/communityController');

const upload = multer({ dest: 'uploads/' });

router.post('/post', authenticateToken, upload.fields([{ name: 'image' }, { name: 'video' }]), communityController.createPost);
router.get('/posts', communityController.getPosts);
router.get('/post/:id', communityController.getPostById);
router.post('/post/:id/comment', authenticateToken, communityController.addComment);
router.post('/post/:id/like', authenticateToken, communityController.toggleLike);
router.post('/post/:id/verify', authenticateToken, authorizeRoles('expert', 'admin'), communityController.verifyPost);
router.delete('/post/:id', authenticateToken, communityController.deletePost);
router.post('/promote/:userId', authenticateToken, authorizeRoles('admin'), communityController.promoteUser);

module.exports = router;