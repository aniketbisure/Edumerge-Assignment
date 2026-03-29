import express, { RequestHandler } from 'express';
const router = express.Router();
import auth, { AuthRequest } from '../middleware/auth';
import authorize from '../middleware/rbac';
import Applicant from '../models/Applicant';
import Program from '../models/Program';
import seatAllocationService from '../services/seatAllocation';
import admissionNumberService from '../utils/admissionNumber';
import logger from '../utils/logger';
import { getErrorMessage } from '../utils/error';

// Role: Admission Officer and Admin
router.use(auth as RequestHandler, authorize('admin', 'admission_officer'));

// 1. Create Applicant
router.post('/', async (req, res) => {
  const authReq = req as AuthRequest;
  try {
    const applicantData = {
      ...req.body,
      createdBy: authReq.user.id
    };
    
    // Quick validation: Check if program exists
    const program = await Program.findById(req.body.program);
    if (!program) throw new Error('Selected program not found');

    const applicant = await Applicant.create(applicantData);
    res.status(201).json({ success: true, data: applicant });
  } catch (error) {
    logger.error('Error creating applicant:', getErrorMessage(error));
    res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
});

// 2. List Applicants (with Filters & Search)
router.get('/', async (req, res, next) => {
  try {
    const { status, program, quotaType, search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    
    const query: any = {};
    if (status) query.status = status;
    if (program) query.program = program;
    if (quotaType) query.quotaType = quotaType;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const applicants = await Applicant.find(query)
      .populate('program', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Applicant.countDocuments(query);

    res.json({ 
      success: true, 
      data: applicants,
      meta: { total, page, limit }
    });
  } catch (error) {
    logger.error('Error fetching applicants:', getErrorMessage(error));
    next(error);
  }
});

// 3. Get Applicant Details
router.get('/:id', async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id)
      .populate('program')
      .populate('createdBy', 'name');
    
    if (!applicant) throw new Error('Applicant not found');
    res.json({ success: true, data: applicant });
  } catch (error) {
    res.status(404).json({ success: false, message: getErrorMessage(error) });
  }
});

// 4. Update Document Verification
router.put('/:id/documents', async (req, res) => {
  try {
    const { documentStatus } = req.body;
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { documentStatus },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: applicant });
  } catch (error) {
    res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
});

// 5. Update Fee Status
router.put('/:id/fee', async (req, res) => {
  try {
    const { feeStatus } = req.body;
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { feeStatus },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: applicant });
  } catch (error) {
    res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
});

// 6. Allocate Seat (Lock Seat)
router.post('/:id/allocate-seat', async (req, res) => {
  try {
    const applicantId = req.params.id;
    const { programId, quotaType, allotmentNumber } = req.body;
    
    // Validate applicant exists and is in 'Applied' status
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) throw new Error('Applicant not found');
    if (applicant.status !== 'Applied') {
      throw new Error(`Cannot allocate seat for applicant in status: ${applicant.status}`);
    }

    // Call service with Redis locking
    const updatedApplicant = await seatAllocationService.allocateSeat(applicantId, programId, quotaType);
    
    // Update allotment number if provided (for government quotas)
    if (allotmentNumber) {
      updatedApplicant.allotmentNumber = allotmentNumber;
      await updatedApplicant.save();
    }

    res.json({ 
      success: true, 
      message: 'Seat locked successfully', 
      data: updatedApplicant 
    });
  } catch (error) {
    logger.error('Allocation failed:', getErrorMessage(error));
    res.status(409).json({ success: false, message: getErrorMessage(error) });
  }
});

// 7. Confirm Admission (Requires Paid Fee)
router.post('/:id/confirm', async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) throw new Error('Applicant not found');

    // Rule 1: Must be Seat_Locked
    if (applicant.status !== 'Seat_Locked') {
      throw new Error('Seat must be locked before confirmation');
    }

    // Rule 2: Must be Fee_Paid
    if (applicant.feeStatus !== 'Paid') {
      throw new Error('Admission fee must be paid before confirmation');
    }

    // Rule 3: Essential Docs should be Submitted/Verified (optional, but good)
    // For simplicity, let's just proceed or check tenthMarksheet
    if (applicant.documentStatus?.tenthMarksheet === 'Pending') {
      throw new Error('Tenth marksheet verification is pending');
    }

    // Rule 4: Generate Admission Number (Unique/Immutable)
    const admissionNumber = await admissionNumberService.generateAdmissionNumber(applicant, applicant.program.toString());
    
    applicant.admissionNumber = admissionNumber;
    applicant.status = 'Confirmed';
    applicant.confirmedAt = new Date();
    await applicant.save();

    res.json({ 
      success: true, 
      message: 'Admission confirmed successfully', 
      data: { admissionNumber, applicant } 
    });
  } catch (error) {
    logger.error('Confirmation failed:', getErrorMessage(error));
    res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
});

// 8. Cancel Admission & Release Seat
router.delete('/:id/cancel', async (req, res) => {
  try {
    const updatedApplicant = await seatAllocationService.releaseSeat(req.params.id);
    res.json({ 
      success: true, 
      message: 'Seat released, admission cancelled', 
      data: updatedApplicant 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
});

export default router;
