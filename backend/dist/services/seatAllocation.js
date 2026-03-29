"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseSeat = exports.allocateSeat = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const Program_1 = __importDefault(require("../models/Program"));
const Applicant_1 = __importDefault(require("../models/Applicant"));
/**
 * Allocate a seat to an applicant with Redis distributed locking
 */
const allocateSeat = async (applicantId, programId, quotaType) => {
    const lockKey = `lock:seat:${programId}:${quotaType}`;
    // 1. Acquire Redis lock
    const lock = await redis_1.default.set(lockKey, '1', 'NX', 'EX', 10);
    if (!lock) {
        throw new Error('System busy, please retry');
    }
    try {
        // 2. Fetch program
        const program = await Program_1.default.findById(programId);
        if (!program)
            throw new Error('Program not found');
        // 3. Check quota availability
        const quotaIndex = program.quotas.findIndex(q => q.quotaType === quotaType);
        if (quotaIndex === -1)
            throw new Error(`Quota ${quotaType} not found for this program`);
        const quota = program.quotas[quotaIndex];
        if (quota.filled >= quota.seats) {
            throw new Error(`Quota full for ${quotaType}`);
        }
        // 4. Update program and applicant
        program.quotas[quotaIndex].filled += 1;
        await program.save();
        const applicant = await Applicant_1.default.findById(applicantId);
        if (!applicant)
            throw new Error('Applicant not found');
        applicant.status = 'Seat_Locked';
        applicant.seatLockedAt = new Date();
        applicant.program = programId;
        applicant.quotaType = quotaType;
        await applicant.save();
        // 5. Cache updated seat counts
        await redis_1.default.set(`seats:${programId}`, JSON.stringify(program.quotas), 'EX', 60);
        return applicant;
    }
    finally {
        // 6. Release lock
        await redis_1.default.del(lockKey);
    }
};
exports.allocateSeat = allocateSeat;
/**
 * Release a seat if an admission is cancelled
 */
const releaseSeat = async (applicantId) => {
    const applicant = await Applicant_1.default.findById(applicantId);
    if (!applicant || applicant.status !== 'Seat_Locked') {
        throw new Error('Invalid applicant status for seat release');
    }
    const programId = applicant.program;
    const quotaType = applicant.quotaType;
    const program = await Program_1.default.findById(programId);
    if (program) {
        const quotaIndex = program.quotas.findIndex(q => q.quotaType === quotaType);
        if (quotaIndex !== -1) {
            program.quotas[quotaIndex].filled = Math.max(0, program.quotas[quotaIndex].filled - 1);
            await program.save();
        }
    }
    applicant.status = 'Cancelled';
    await applicant.save();
    return applicant;
};
exports.releaseSeat = releaseSeat;
exports.default = {
    allocateSeat: exports.allocateSeat,
    releaseSeat: exports.releaseSeat
};
//# sourceMappingURL=seatAllocation.js.map