const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/catalog', authenticateToken, skillController.catalog);
router.get('/user/:userId', authenticateToken, skillController.getUserSkills);
router.post('/', authenticateToken, skillController.add);
router.delete('/:userSkillId', authenticateToken, skillController.remove);
router.post('/:userSkillId/endorse', authenticateToken, skillController.endorse);
router.delete('/:userSkillId/endorse', authenticateToken, skillController.unendorse);

module.exports = router;
