"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = __importDefault(require("../middleware/auth"));
const rbac_1 = __importDefault(require("../middleware/rbac"));
const Applicant_1 = __importDefault(require("../models/Applicant"));
const Program_1 = __importDefault(require("../models/Program"));
const seatAllocation_1 = __importDefault(require("../services/seatAllocation"));
const admissionNumber_1 = __importDefault(require("../utils/admissionNumber"));
const logger_1 = __importDefault(require("../utils/logger"));
// Role: Admission Officer and Admin
router.use(auth_1.default, (0, rbac_1.default)('admin', 'admission_officer'));
// 1. Create Applicant
router.post('/', async (req, res) => {
    try {
        const applicantData = {
            ...req.body,
            createdBy: req.user.id
        };
        // Quick validation: Check if program exists
        const program = await Program_1.default.findById(req.body.program);
        if (!program)
            throw new Error('Selected program not found');
        const applicant = await Applicant_1.default.create(applicantData);
        res.status(201).json({ success: true, data: applicant });
    }
    catch (error) {
        logger_1.default.error('Error creating applicant:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});
// 2. List Applicants (with Filters & Search)
router.get('/', async (req, res) => {
    try {
        const { status, program, quotaType, search, page = 1, limit = 10 } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (program)
            query.program = program;
        if (quotaType)
            query.quotaType = quotaType;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { admissionNumber: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (page - 1) * limit;
        const applicants = await Applicant_1.default.find(query)
            .populate('program', 'name code')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Applicant_1.default.countDocuments(query);
        res.json({
            success: true,
            data: applicants,
            meta: { total, page: Number(page), limit: Number(limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// 3. Get Applicant Details
router.get('/:id', async (req, res) => {
    try {
        const applicant = await Applicant_1.default.findById(req.params.id)
            .populate('program')
            .populate('createdBy', 'name');
        if (!applicant)
            throw new Error('Applicant not found');
        res.json({ success: true, data: applicant });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
});
// 4. Update Document Verification
router.put('/:id/documents', async (req, res) => {
    try {
        const { documentStatus } = req.body;
        const applicant = await Applicant_1.default.findByIdAndUpdate(req.params.id, { documentStatus }, { new: true, runValidators: true });
        res.json({ success: true, data: applicant });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// 5. Update Fee Status
router.put('/:id/fee', async (req, res) => {
    try {
        const { feeStatus } = req.body;
        const applicant = await Applicant_1.default.findByIdAndUpdate(req.params.id, { feeStatus }, { new: true, runValidators: true });
        res.json({ success: true, data: applicant });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// 6. Allocate Seat (Lock Seat)
router.post('/:id/allocate-seat', async (req, res) => {
    try {
        const applicantId = req.params.id;
        const { programId, quotaType, allotmentNumber } = req.body;
        // Validate applicant exists and is in 'Applied' status
        const applicant = await Applicant_1.default.findById(applicantId);
        if (!applicant)
            throw new Error('Applicant not found');
        if (applicant.status !== 'Applied') {
            throw new Error(`Cannot allocate seat for applicant in status: ${applicant.status}`);
        }
        // Call service with Redis locking
        const updatedApplicant = await seatAllocation_1.default.allocateSeat(applicantId, programId, quotaType);
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
    }
    catch (error) {
        logger_1.default.error('Allocation failed:', error.message);
        res.status(409).json({ success: false, message: error.message });
    }
});
// 7. Confirm Admission (Requires Paid Fee)
router.post('/:id/confirm', async (req, res) => {
    try {
        const applicant = await Applicant_1.default.findById(req.params.id);
        if (!applicant)
            throw new Error('Applicant not found');
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
        if (applicant.documentStatus.tenthMarksheet === 'Pending') {
            throw new Error('Tenth marksheet verification is pending');
        }
        // Rule 4: Generate Admission Number (Unique/Immutable)
        const admissionNumber = await admissionNumber_1.default.generateAdmissionNumber(applicant, applicant.program);
        applicant.admissionNumber = admissionNumber;
        applicant.status = 'Confirmed';
        applicant.confirmedAt = new Date();
        await applicant.save();
        res.json({
            success: true,
            message: 'Admission confirmed successfully',
            data: { admissionNumber, applicant }
        });
    }
    catch (error) {
        logger_1.default.error('Confirmation failed:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});
// 8. Cancel Admission & Release Seat
router.delete('/:id/cancel', async (req, res) => {
    try {
        const updatedApplicant = await seatAllocation_1.default.releaseSeat(req.params.id);
        res.json({
            success: true,
            message: 'Seat released, admission cancelled',
            data: updatedApplicant
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=applicants.js.map