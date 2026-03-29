import express from 'express';
const router = express.Router();
import auth from '../middleware/auth';
import Applicant from '../models/Applicant';
import Program from '../models/Program';

// Dashboard statistics (Available for all authenticated roles)
router.get('/stats', auth, async (req, res: any) => {
  try {
    // 1. Total Intake vs Admitted/Filled
    const programs = await Program.find();
    const totalIntake = programs.reduce((acc, p) => acc + p.totalIntake, 0);
    
    // Total Filled seats across all programs (includes Locked & Confirmed)
    const totalFilled = programs.reduce((acc, p) => 
      acc + p.quotas.reduce((qAcc, q) => qAcc + q.filled, 0), 0
    );

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
        feePendingCount: await Applicant.countDocuments({ feeStatus: 'Pending' }),
        statusDistribution: statusCounts,
        programStats,
        feePendingList: feePending,
        pendingDocsList: pendingDocs
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
