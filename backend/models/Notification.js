const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
    opp_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', default: null },
    message:    { type: String, required: true },
    is_read:    { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
});

notificationSchema.index({ user_id: 1, created_at: -1 });
notificationSchema.index({ opp_id: 1 });             // for cascade delete when an opportunity is removed
notificationSchema.index({ user_id: 1, is_read: 1 }); // for filtering unread notifications per user

module.exports = mongoose.model('Notification', notificationSchema);
