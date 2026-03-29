"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const applicantSchema = new mongoose_1.default.Schema({
    // ... (rest of schema)
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    category: {
        type: String,
        enum: ['GM', 'SC', 'ST', 'OBC', 'EWS'],
        required: true
    },
    program: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    quotaType: {
        type: String,
        enum: ['KCET', 'COMEDK', 'Management'],
        required: true
    },
    entryType: {
        type: String,
        enum: ['Regular', 'Lateral'],
        required: true
    },
    admissionMode: {
        type: String,
        enum: ['Government', 'Management'],
        required: true
    },
    allotmentNumber: {
        type: String,
        trim: true
    },
    qualifyingMarks: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ['Applied', 'Seat_Locked', 'Confirmed', 'Cancelled'],
        default: 'Applied'
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentStatus: {
        tenthMarksheet: { type: String, enum: ['Pending', 'Submitted', 'Verified'], default: 'Pending' },
        twelfthMarksheet: { type: String, enum: ['Pending', 'Submitted', 'Verified'], default: 'Pending' },
        casteCertificate: { type: String, enum: ['Pending', 'Submitted', 'Verified'], default: 'Pending' },
        domicile: { type: String, enum: ['Pending', 'Submitted', 'Verified'], default: 'Pending' },
        photos: { type: String, enum: ['Pending', 'Submitted', 'Verified'], default: 'Pending' }
    },
    feeStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    admissionNumber: {
        type: String,
        sparse: true,
        unique: true,
        immutable: true // admissionNumber should be immutable once set
    },
    seatLockedAt: Date,
    confirmedAt: Date
}, {
    timestamps: true
});
// Indexes for query performance
applicantSchema.index({ program: 1, status: 1 });
const Applicant = mongoose_1.default.model('Applicant', applicantSchema);
exports.default = Applicant;
//# sourceMappingURL=Applicant.js.map