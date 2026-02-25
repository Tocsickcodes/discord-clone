const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
    const { friendId } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: friendId },
                { sender: friendId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.addReaction = async (req, res) => {
    const { messageId } = req.params;
    const { emoji } = req.body;
    try {
        let message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ msg: 'Message not found' });

        // Remove existing reaction from this user if any
        message.reactions = message.reactions.filter(r => r.userId.toString() !== req.user.id);

        // Add new reaction (if toggling, we could check if it was the same emoji)
        // But requirement says "replace old one" or "toggle if same"

        const sameEmoji = message.reactions.find(r => r.userId.toString() === req.user.id && r.emoji === emoji);
        if (!sameEmoji) {
            message.reactions.push({ userId: req.user.id, emoji });
        } else {
            // Toggling is already handled by the filter above if we were simpler, 
            // but let's be explicit.
        }

        await message.save();
        res.json(message.reactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
