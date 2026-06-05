const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcrypt');
const crypto   = require('crypto');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { getDeptName }                              = require('../config/constants');
const { validateEmailDomain, sendVerificationEmail, sendWelcomeEmail } = require('../utils/email');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { user_name, email, password, dept_id } = req.body;

    if (!user_name || !email || !password || !dept_id) {
        return res.status(400).json({ message: 'Username, email, password, and department are required.' });
    }

    const domainValid = await validateEmailDomain(email);
    if (!domainValid) {
        return res.status(400).json({
            message: 'The email address does not appear to be valid. Please use a real, deliverable email address.'
        });
    }

    try {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            // If the account exists but is unverified, resend the verification email
            if (!existing.is_verified) {
                const token   = crypto.randomBytes(32).toString('hex');
                const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h
                existing.verify_token         = token;
                existing.verify_token_expires = expires;
                await existing.save();

                sendVerificationEmail(existing.email, existing.user_name, token)
                    .then(() => console.log('[Email] Resent verification to:', existing.email))
                    .catch(err => console.error('[Email] Resend failed:', err.message));

                return res.status(200).json({
                    message: 'This email is already registered but not verified. A new verification link has been sent — please check your inbox.'
                });
            }
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const dept_name     = getDeptName(dept_id);
        const token         = crypto.randomBytes(32).toString('hex');
        const expires       = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

        await User.create({
            user_name,
            email:                email.toLowerCase(),
            password_hash,
            role_id:              2,
            dept_id:              Number(dept_id),
            dept_name,
            is_verified:          false,
            verify_token:         token,
            verify_token_expires: expires,
        });

        sendVerificationEmail(email, user_name, token)
            .then(() => console.log('[Email] Verification email sent to:', email))
            .catch(err => console.error('[Email] Verification email failed:', err.message));

        res.status(201).json({
            message: 'Account created! Please check your inbox and click the verification link to activate your account.'
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// GET /api/auth/verify-email?token=<token>
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Verification token is missing.' });
    }

    try {
        const user = await User.findOne({
            verify_token:         token,
            verify_token_expires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'This verification link is invalid or has expired. Please register again to get a new link.'
            });
        }

        user.is_verified          = true;
        user.verify_token         = null;
        user.verify_token_expires = null;
        await user.save();

        // Fire-and-forget welcome email now that the account is confirmed
        sendWelcomeEmail(user.email, user.user_name)
            .then(() => console.log('[Email] Welcome email sent to:', user.email))
            .catch(err => console.error('[Email] Welcome email failed:', err.message));

        res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
    } catch (err) {
        console.error('Verify email error:', err);
        res.status(500).json({ success: false, message: 'Server error during verification.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const identifier = email.toLowerCase();
        const user = await User.findOne({
            $or: [{ email: identifier }, { user_name: identifier }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { user_id: user._id, user_name: user.user_name, email: user.email, role_id: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful.',
            token,
            user: { user_id: user._id, user_name: user.user_name, email: user.email, role_id: user.role_id }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return 200 to avoid leaking whether an account exists
        if (!user || user.is_verified) {
            return res.json({ message: 'If that email is registered and unverified, a new link has been sent.' });
        }

        const token   = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.verify_token         = token;
        user.verify_token_expires = expires;
        await user.save();

        sendVerificationEmail(user.email, user.user_name, token)
            .then(() => console.log('[Email] Resent verification to:', user.email))
            .catch(err => console.error('[Email] Resend failed:', err.message));

        res.json({ message: 'If that email is registered and unverified, a new link has been sent.' });
    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
