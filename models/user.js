const { string } = require('joi');
const mongoose = require('mongoose');
const passportLocal = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocal);


module.exports = mongoose.model('User', UserSchema);