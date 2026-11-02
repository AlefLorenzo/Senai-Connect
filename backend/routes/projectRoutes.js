const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/user/:userId', authenticateToken, projectController.getByUser);
router.post('/', authenticateToken, projectController.create);
router.delete('/:id', authenticateToken, projectController.remove);

module.exports = router;
