const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, groupController.getAll);
router.post('/', authenticateToken, groupController.create);
router.get('/:id', authenticateToken, groupController.getById);
router.post('/:id/join', authenticateToken, groupController.join);
router.post('/:id/leave', authenticateToken, groupController.leave);
router.get('/:id/members', authenticateToken, groupController.getMembers);
router.get('/:id/posts', authenticateToken, groupController.getPosts);
router.post('/:id/posts', authenticateToken, groupController.createPost);

module.exports = router;
