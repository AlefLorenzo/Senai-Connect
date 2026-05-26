const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/contacts', authenticateToken, messageController.getContacts);
router.get('/:userId', authenticateToken, messageController.getHistory);
router.post('/', authenticateToken, messageController.send);

module.exports = router;
