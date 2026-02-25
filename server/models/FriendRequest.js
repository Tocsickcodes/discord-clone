const mongoose = require('mongoose');
let actualModel;

const getModel = () => {
    if (actualModel) return actualModel;
    if (global.USE_MOCK_DB) {
        actualModel = require('./mockModel')('FriendRequest');
    } else {
        const FriendRequestSchema = new mongoose.Schema({
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
        }, { timestamps: true });
        actualModel = mongoose.model('FriendRequest', FriendRequestSchema);
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
