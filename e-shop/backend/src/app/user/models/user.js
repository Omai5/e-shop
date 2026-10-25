const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    password: {type: String, required: true},
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

// In-memory fallback, used only when MONGODB_URI is not set (local development)
let users = []

module.exports = {
    User,
    users
}
