const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_name:     { type: String, required: true, unique: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    role_id:       { type: Number, required: true, default: 2 }, // 1 = admin, 2 = student
    dept_id:       { type: Number, required: true },
    dept_name:     { type: String, default: '' },
    created_at:    { type: Date, default: Date.now },
});

userSchema.index({ role_id: 1 }); // used in User.find({ role_id: 2 }) when broadcasting notifications

module.exports = mongoose.model('User', userSchema);
