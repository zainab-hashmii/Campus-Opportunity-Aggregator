const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SavedOpportunity = require('../models/SavedOpportunity');
const verifyToken = require('../middleware/auth');
const { getDeptName, getCategoryName } = require('../config/constants');
const { runInTransaction } = require('../utils/transaction');

// GET /api/admin/stats
// Aggregation pipeline collapses the two Opportunity counts into one round-trip.
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const [oppCounts, total_students, total_saves] = await Promise.all([
            Opportunity.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            User.countDocuments({ role_id: 2 }),
            SavedOpportunity.countDocuments(),
        ]);

        const total_active  = oppCounts.find(g => g._id === 'active')?.count  ?? 0;
        const total_expired = oppCounts.find(g => g._id === 'expired')?.count ?? 0;

        res.json({ success: true, data: { total_active, total_expired, total_students, total_saves } });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
});

// GET /api/admin/opportunities
// Cursor-based iteration avoids loading the entire collection into memory at once.
router.get('/opportunities', verifyToken, async (req, res) => {
    try {
        const data = [];
        const cursor = Opportunity.find().sort({ created_at: -1 }).lean().cursor();
        for await (const o of cursor) {
            data.push({
                opp_id:           o._id.toString(),
                title:            o.title,
                organization:     o.organization,
                category:         o.category_name,
                department:       o.dept_name,
                deadline:         o.deadline,
                status:           o.status,
                mode:             o.opp_mode,
                opp_mode:         o.opp_mode,
                location:         o.location,
                is_paid:          o.is_paid ? 1 : 0,
                stipend:          o.stipend,
                duration:         o.duration,
                required_skills:  o.required_skills,
                eligibility:      o.eligibility,
                application_link: o.application_link,
                tags:             o.tags,
                views_count:      o.views_count,
                save_count:       o.save_count,
            });
        }
        res.json({ success: true, data });
    } catch (err) {
        console.error('Admin opps error:', err);
        res.status(500).json({ success: false, message: 'Error fetching opportunities' });
    }
});

// POST /api/admin/opportunities
// Transaction: opportunity creation + notification fan-out are committed atomically.
router.post('/opportunities', verifyToken, async (req, res) => {
    if (req.user.role_id !== 1) {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const {
        title, description, organization, category_id, dept_id,
        deadline, opp_mode, location, is_paid, stipend, duration,
        required_skills, eligibility, application_link, tags,
    } = req.body;
    if (!title || !description || !category_id || !dept_id || !deadline || !opp_mode) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const category_name = getCategoryName(category_id);
        const dept_name     = getDeptName(dept_id);

        await runInTransaction(async (session) => {
            const opts = session ? { session } : {};

            const [opp] = await Opportunity.create([{
                title,
                description,
                organization:     organization || '',
                category_id:      Number(category_id),
                category_name,
                dept_id:          Number(dept_id),
                dept_name,
                deadline:         new Date(deadline),
                opp_mode,
                location:         location || '',
                is_paid:          !!is_paid,
                stipend:          stipend || '',
                duration:         duration || '',
                required_skills:  Array.isArray(required_skills) ? required_skills : [],
                eligibility:      eligibility || '',
                application_link: application_link || '',
                tags:             Array.isArray(tags) ? tags : [],
                posted_by:        req.user.user_id,
            }], opts);

            // Notify all students (replaces Oracle trigger trg_notify_on_new)
            const students = await User.find({ role_id: 2 }, '_id').lean();
            if (students.length > 0) {
                const notifications = students.map(s => ({
                    user_id: s._id,
                    opp_id:  opp._id,
                    message: `New opportunity posted: ${title}`,
                    is_read: false,
                }));
                await Notification.insertMany(notifications, { ordered: false, ...opts });
            }
        });

        res.status(201).json({ success: true, message: 'Opportunity posted successfully.' });
    } catch (err) {
        console.error('Post opportunity error:', err);
        res.status(500).json({ success: false, message: 'Error posting opportunity.' });
    }
});

// DELETE /api/admin/opportunities/:id
// Transaction: deletes the opportunity and cascades to orphaned saves + notifications atomically.
router.delete('/opportunities/:id', verifyToken, async (req, res) => {
    if (req.user.role_id !== 1) {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    try {
        await runInTransaction(async (session) => {
            const opts = session ? { session } : {};
            await Opportunity.findByIdAndDelete(req.params.id, opts);
            await SavedOpportunity.deleteMany({ opp_id: req.params.id }, opts);
            await Notification.deleteMany({ opp_id: req.params.id }, opts);
        });
        res.json({ success: true, message: 'Opportunity deleted' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: 'Error deleting opportunity' });
    }
});

// GET /api/admin/expiring
router.get('/expiring', verifyToken, async (req, res) => {
    try {
        const now            = new Date();
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const opps = await Opportunity.find({
            status:   'active',
            deadline: { $gte: now, $lte: threeDaysLater },
        }).lean();

        res.json({
            success: true,
            data: opps.map(o => ({
                opp_id:      o._id.toString(),
                title:       o.title,
                description: o.description,
                category:    o.category_name,
                department:  o.dept_name,
                deadline:    o.deadline,
                mode:        o.opp_mode,
                is_paid:     o.is_paid ? 1 : 0,
                views_count: o.views_count,
                save_count:  o.save_count,
            })),
        });
    } catch (err) {
        console.error('Expiring error:', err);
        res.status(500).json({ success: false, message: 'Error fetching expiring opportunities' });
    }
});

// GET /api/admin/recommendations/:user_id
// Aggregation pipeline with $lookup derives interested categories in one round-trip
// instead of a separate populate query.
router.get('/recommendations/:user_id', verifyToken, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.user_id);

        const categoryGroups = await SavedOpportunity.aggregate([
            { $match: { user_id: userId } },
            {
                $lookup: {
                    from:         'opportunities',
                    localField:   'opp_id',
                    foreignField: '_id',
                    as:           'opp',
                },
            },
            { $unwind: { path: '$opp', preserveNullAndEmptyArrays: false } },
            { $group: { _id: '$opp.category_id' } },
        ]);

        const interestedCategories = categoryGroups.map(g => g._id).filter(id => id != null);

        const filter = { status: 'active', deadline: { $gte: new Date() } };
        if (interestedCategories.length > 0) {
            filter.category_id = { $in: interestedCategories };
        }

        const opps = await Opportunity
            .find(filter)
            .sort({ views_count: -1, save_count: -1 })
            .limit(10)
            .populate('posted_by', 'user_name')
            .lean();

        res.json({
            success: true,
            data: opps.map(o => ({
                opp_id:      o._id.toString(),
                title:       o.title,
                description: o.description,
                category:    o.category_name,
                department:  o.dept_name,
                deadline:    o.deadline,
                mode:        o.opp_mode,
                is_paid:     o.is_paid ? 1 : 0,
                views_count: o.views_count,
                save_count:  o.save_count,
                posted_by:   o.posted_by?.user_name,
                trend_score: Math.round((o.views_count * 0.4 + o.save_count * 0.6) * 100) / 100,
            })),
        });
    } catch (err) {
        console.error('Recommendations error:', err);
        res.status(500).json({ success: false, message: 'Error fetching recommendations' });
    }
});

module.exports = router;
