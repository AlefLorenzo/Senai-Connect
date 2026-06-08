const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/', authenticateToken, uploadController.uploadFile);

module.exports = router;
