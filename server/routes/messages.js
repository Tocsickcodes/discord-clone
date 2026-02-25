const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.get('/:friendId', auth, messageController.getMessages);
router.post('/react/:messageId', auth, messageController.addReaction);

module.exports = router;
