const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middlewares/auth');

// Posts
router.get('/', authenticateToken, postController.getAll);
router.post('/', authenticateToken, postController.create);
router.put('/:id', authenticateToken, postController.update);
router.delete('/:id', authenticateToken, postController.delete);

// Interações de Posts (Likes e Saves)
router.post('/:id/like', authenticateToken, postController.toggleLike);
router.post('/:id/save', authenticateToken, postController.toggleSave);
router.get('/:id/status', authenticateToken, postController.getSavedStatus);

// Comentários nos Posts
router.get('/:id/comments', authenticateToken, commentController.getByPost);
router.post('/:id/comments', authenticateToken, commentController.create);
router.delete('/comments/:id', authenticateToken, commentController.delete); // Deleta um comentário específico

module.exports = router;
