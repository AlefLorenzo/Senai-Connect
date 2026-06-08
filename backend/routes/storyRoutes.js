const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, storyController.getAll);
router.post('/', authenticateToken, storyController.create);
router.delete('/:id', authenticateToken, storyController.delete);

module.exports = router;
