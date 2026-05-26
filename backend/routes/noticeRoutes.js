const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, noticeController.getNotices);
router.post('/', authenticateToken, noticeController.createNotice);
router.get('/events', authenticateToken, noticeController.getEvents);
router.post('/events', authenticateToken, noticeController.createEvent);

module.exports = router;
