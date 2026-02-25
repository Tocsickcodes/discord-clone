const Datastore = require('nedb-promises');
const path = require('path');

module.exports = (modelName) => {
    const db = Datastore.create({
        filename: path.join(__dirname, '../data', `${modelName.toLowerCase()}s.db`),
        autoload: true
    });

    // Shim to mimic Mongoose Model
    return class MockModel {
        constructor(data) {
            Object.assign(this, data);
            this._id = this._id || Math.random().toString(36).substr(2, 9);
        }

        async save() {
            const data = { ...this };
            delete data.save; // Don't save the function
            const existing = await db.findOne({ _id: this._id });
            if (existing) {
                await db.update({ _id: this._id }, data);
            } else {
                await db.insert(data);
            }
            return this;
        }

        static async find(query = {}) {
            // Convert MongoDB regex if any (NeDB supports regex natively)
            return await db.find(query);
        }

        static async findOne(query = {}) {
            const doc = await db.findOne(query);
            return doc ? new MockModel(doc) : null;
        }

        static async findById(id) {
            const doc = await db.findOne({ _id: id });
            return doc ? new MockModel(doc) : null;
        }

        static async findByIdAndUpdate(id, update, options = {}) {
            await db.update({ _id: id }, update, options);
            const doc = await db.findOne({ _id: id });
            return doc ? new MockModel(doc) : null;
        }

        static async findOneAndUpdate(query, update, options = {}) {
            await db.update(query, update, options);
            const doc = await db.findOne(query);
            return doc ? new MockModel(doc) : null;
        }

        static async select() { return this; } // Dummy for chainable select()
    };
};
