import redis from '../config/redis';
import Program, { IProgram } from '../models/Program';
import Applicant, { IApplicant } from '../models/Applicant';
import logger from '../utils/logger';

/**
 * Allocate a seat to an applicant with Redis distributed locking
 */
export const allocateSeat = async (applicantId: string, programId: string, quotaType: string): Promise<IApplicant> => {
  const lockKey = `lock:seat:${programId}:${quotaType}`;
  
  // 1. Acquire Redis lock
  const lock = await redis.set(lockKey, '1', 'EX', 10, 'NX');
  
  if (!lock) {
    throw new Error('System busy, please retry');
  }

  try {
    // 2. Fetch program
    const program: IProgram | null = await Program.findById(programId);
    if (!program) throw new Error('Program not found');

    // 3. Check quota availability
    const quotaIndex = program.quotas.findIndex(q => q.quotaType === quotaType);
    if (quotaIndex === -1) throw new Error(`Quota ${quotaType} not found for this program`);

    const quota = program.quotas[quotaIndex];
    if (!quota) throw new Error(`Quota index ${quotaIndex} out of bounds`);
    
    if (quota.filled >= quota.seats) {
      throw new Error(`Quota full for ${quotaType}`);
    }

    // 4. Update program and applicant
    if (program.quotas[quotaIndex]) {
      program.quotas[quotaIndex].filled += 1;
      await program.save();
    }

    const applicant: IApplicant | null = await Applicant.findById(applicantId);
    if (!applicant) throw new Error('Applicant not found');

    applicant.status = 'Seat_Locked';
    applicant.seatLockedAt = new Date();
    applicant.program = programId as any;
    applicant.quotaType = quotaType as any;
    await applicant.save();

    // 5. Cache updated seat counts
    await redis.set(`seats:${programId}`, JSON.stringify(program.quotas), 'EX', 60);

    return applicant;
  } finally {
    // 6. Release lock
    await redis.del(lockKey);
  }
};

/**
 * Release a seat if an admission is cancelled
 */
export const releaseSeat = async (applicantId: string): Promise<IApplicant> => {
  const applicant: IApplicant | null = await Applicant.findById(applicantId);
  if (!applicant || applicant.status !== 'Seat_Locked') {
    throw new Error('Invalid applicant status for seat release');
  }

  const programId = applicant.program;
  const quotaType = applicant.quotaType;

  const program: IProgram | null = await Program.findById(programId);
  if (program) {
    const quotaIndex = program.quotas.findIndex(q => q.quotaType === quotaType);
    if (quotaIndex !== -1 && program.quotas[quotaIndex]) {
      program.quotas[quotaIndex].filled = Math.max(0, (program.quotas[quotaIndex].filled || 0) - 1);
      await program.save();
    }
  }

  applicant.status = 'Cancelled';
  await applicant.save();

  return applicant;
};

export default {
    allocateSeat,
    releaseSeat
};
