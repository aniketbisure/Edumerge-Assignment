import express, { RequestHandler } from 'express';
const router = express.Router();
import auth, { AuthRequest } from '../middleware/auth';
import authorize from '../middleware/rbac';
import Attendance from '../models/Attendance';
import Payroll from '../models/Payroll';
import logger from '../utils/logger';

// Role restriction: Admin only to manage other's payroll, all authenticated can see their own
router.use(auth as RequestHandler);

// 1. Submit Attendance Record
router.post('/attendance', async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const { userId, date, checkIn, checkOut, hoursWorked } = req.body;
    
    // Default to currently logged in user if not provided
    const targetUserId = userId || authReq.user.id;
    
    const attendanceRecord = await Attendance.create({
      user: targetUserId,
      date: date || new Date(),
      checkIn: checkIn || new Date(),
      checkOut,
      hoursWorked: hoursWorked || 0
    });
    
    res.status(201).json({ success: true, data: attendanceRecord });
  } catch (error: any) {
    logger.error('Attendance creation failed:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// 2. Generate Monthly Payroll (Admin only)
router.post('/generate/:month/:year', authorize('admin'), async (req, res) => {
  try {
    const { month, year } = req.params;
    const { userId, baseSalary = 30000 } = req.body; // Base salary for calculation
    
    const m = parseInt(month);
    const y = parseInt(year);
    
    // Find all attendance records for this user in this month
    const attendanceRecords = await Attendance.find({
      user: userId,
      date: {
        $gte: new Date(y, m - 1, 1),
        $lte: new Date(y, m, 0)
      }
    });
    
    let fullDays = 0;
    let halfDays = 0;
    
    attendanceRecords.forEach(rec => {
      if (rec.status === 'Full_Day') fullDays++;
      else if (rec.status === 'Half_Day') halfDays++;
    });
    
    // Example calculation: Salary / 30 * (fullDays + halfDays/2)
    const totalAmount = (baseSalary / 30) * (fullDays + halfDays * 0.5);
    
    const payroll = await Payroll.findOneAndUpdate(
      { user: userId, month: m, year: y },
      { 
        fullDayCount: fullDays,
        halfDayCount: halfDays,
        totalAmount,
        status: 'Draft',
        header: req.body.header || 'Institution Payroll Report',
        digitalSignUrl: req.body.digitalSignUrl,
        stampUrl: req.body.stampUrl
      },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, data: payroll });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 3. Get Payroll Records
router.get('/', async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const query: any = {};
    if (authReq.user.role !== 'admin') {
      query.user = authReq.user.id;
    }
    
    const payrolls = await Payroll.find(query).populate('user', 'name email');
    res.json({ success: true, data: payrolls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Update Payroll (Header, Signatures, etc.)
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: payroll });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
