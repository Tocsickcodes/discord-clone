const mongoose = require('mongoose');

let actualModel;

const getModel = () => {
    if (actualModel) return actualModel;
    if (global.USE_MOCK_DB) {
        actualModel = require('./mockModel')('User');
    } else {
        const UserSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            avatar: { type: String, default: '' },
            status: { type: String, enum: ['online', 'idle', 'dnd', 'offline'], default: 'offline' },
            statusMessage: { type: String, default: '' },
            color: { type: String, default: '#7289da' }
        }, { timestamps: true });
        actualModel = mongoose.model('User', UserSchema);
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
