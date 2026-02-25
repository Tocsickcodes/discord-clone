const mongoose = require('mongoose');
let actualModel;

const getModel = () => {
    if (actualModel) return actualModel;
    if (global.USE_MOCK_DB) {
        actualModel = require('./mockModel')('Message');
    } else {
        const ReactionSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            emoji: { type: String, required: true }
        }, { _id: false });

        const MessageSchema = new mongoose.Schema({
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Could be empty for channel messages
            channel: { type: String, default: '' }, // For future channel support
            content: { type: String, required: true },
            status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
            reactions: [ReactionSchema]
        }, { timestamps: true });

        actualModel = mongoose.model('Message', MessageSchema);
    }
    return actualModel;
};

module.exports = new Proxy(function () { }, {
    get: (target, prop) => getModel()[prop],
    construct: (target, args) => {
        const M = getModel();
        return new M(...args);
    }
});
