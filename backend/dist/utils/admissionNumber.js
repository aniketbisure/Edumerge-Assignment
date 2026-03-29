"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAdmissionNumber = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const Program_1 = __importDefault(require("../models/Program"));
/**
 * Generate a unique Admission Number
 * Format: INST/2026/UG/CSE/KCET/0001
 * Uses Redis INCR for unique counters across distributed systems
 */
const generateAdmissionNumber = async (applicant, programId) => {
    const program = await Program_1.default.findById(programId).populate('institution');
    if (!program || !program.institution) {
        throw new Error('Program or Institution not found');
    }
    const instCode = program.institution.code;
    const year = program.academicYear.split('-')[0]; // Use first part of academic year
    const courseType = program.courseType;
    const programCode = program.code;
    const quotaType = applicant.quotaType;
    // Counter key stored in Redis
    const counterKey = `admno:${instCode}:${programCode}:${quotaType}:${year}`;
    // Atomically increment counter
    const sequenceNum = await redis_1.default.incr(counterKey);
    // Pad number to 4 digits (e.g., 0001)
    const paddedSequence = sequenceNum.toString().padStart(4, '0');
    return `${instCode}/${year}/${courseType}/${programCode}/${quotaType}/${paddedSequence}`;
};
exports.generateAdmissionNumber = generateAdmissionNumber;
exports.default = {
    generateAdmissionNumber: exports.generateAdmissionNumber
};
//# sourceMappingURL=admissionNumber.js.map