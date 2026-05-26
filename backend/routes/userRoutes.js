const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/:id', authenticateToken, userController.getProfile);
router.put('/:id', authenticateToken, userController.updateProfile);
router.get('/:id/posts', authenticateToken, userController.getUserPosts);
router.get('/:id/saved', authenticateToken, userController.getUserSaved);
router.get('/:id/groups', authenticateToken, userController.getUserGroups);

module.exports = router;
