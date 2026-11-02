const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/me', authenticateToken, gamificationController.getMyProgress);
router.get('/user/:userId', authenticateToken, gamificationController.getUserProgress);
router.get('/leaderboard', authenticateToken, gamificationController.getLeaderboard);

module.exports = router;
