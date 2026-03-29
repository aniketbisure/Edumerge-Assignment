"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Applicant = require('../models/Applicant');
const Program = require('../models/Program');
// Dashboard statistics (Available for all authenticated roles)
router.get('/stats', auth, async (req, res) => {
    try {
        // 1. Total Intake vs Admitted
        const programs = await Program.find();
        const totalIntake = programs.reduce((acc, p) => acc + p.totalIntake, 0);
        const totalAdmitted = await Applicant.countDocuments({ status: 'Confirmed' });
        // 2. Quota-wise distribution
        // Aggregation: Count per status
        const statusCounts = await Applicant.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        // 3. Fee Pending List (top 10)
        const feePending = await Applicant.find({ feeStatus: 'Pending', status: { $ne: 'Cancelled' } })
            .populate('program', 'name')
            .sort({ createdAt: -1 })
            .limit(10);
        // 4. Pending Documents (top 10)
        const pendingDocs = await Applicant.find({
            $or: [
                { 'documentStatus.tenthMarksheet': 'Pending' },
                { 'documentStatus.twelfthMarksheet': 'Pending' },
                { 'documentStatus.photos': 'Pending' }
            ],
            status: { $ne: 'Cancelled' }
        })
            .populate('program', 'name')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json({
            success: true,
            data: {
                totalIntake,
                totalAdmitted,
                seatsRemaining: totalIntake - totalAdmitted,
                feePendingCount: await Applicant.countDocuments({ feeStatus: 'Pending' }),
                statusDistribution: statusCounts,
                feePendingList: feePending,
                pendingDocsList: pendingDocs
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
module.exports = router;
//# sourceMappingURL=dashboard.js.map