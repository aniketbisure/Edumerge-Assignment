"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = __importDefault(require("../middleware/auth"));
const Applicant_1 = __importDefault(require("../models/Applicant"));
const Program_1 = __importDefault(require("../models/Program"));
// Dashboard statistics (Available for all authenticated roles)
router.get('/stats', auth_1.default, async (req, res) => {
    try {
        // 1. Total Intake vs Admitted/Filled
        const programs = await Program_1.default.find();
        const totalIntake = programs.reduce((acc, p) => acc + p.totalIntake, 0);
        // Total Filled seats across all programs (includes Locked & Confirmed)
        const totalFilled = programs.reduce((acc, p) => acc + p.quotas.reduce((qAcc, q) => qAcc + q.filled, 0), 0);
        const totalAdmitted = await Applicant_1.default.countDocuments({ status: 'Confirmed' });
        // 2. Quota-wise distribution
        // Aggregation: Count per status
        const statusCounts = await Applicant_1.default.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        // 3. Fee Pending List (top 10)
        const feePending = await Applicant_1.default.find({ feeStatus: 'Pending', status: { $ne: 'Cancelled' } })
            .populate('program', 'name')
            .sort({ createdAt: -1 })
            .limit(10);
        // 4. Pending Documents (top 10)
        const pendingDocs = await Applicant_1.default.find({
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
        // 5. Program-wise Quota counts
        const programStats = programs.map(p => ({
            name: p.name,
            kcet: p.quotas.find(q => q.quotaType === 'KCET')?.filled || 0,
            comedk: p.quotas.find(q => q.quotaType === 'COMEDK')?.filled || 0,
            mgmt: p.quotas.find(q => q.quotaType === 'Management')?.filled || 0,
            total: p.totalIntake,
            filled: p.quotas.reduce((acc, q) => acc + q.filled, 0)
        }));
        res.json({
            success: true,
            data: {
                totalIntake,
                totalAdmitted,
                totalFilled,
                seatsRemaining: totalIntake - totalFilled,
                feePendingCount: await Applicant_1.default.countDocuments({ feeStatus: 'Pending' }),
                statusDistribution: statusCounts,
                programStats,
                feePendingList: feePending,
                pendingDocsList: pendingDocs
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map