const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, userController.getUsers);
router.put('/status', auth, userController.updateStatus);

module.exports = router;
