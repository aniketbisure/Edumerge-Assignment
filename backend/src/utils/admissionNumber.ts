import redis from '../config/redis';
import Institution from '../models/Institution';
import Program from '../models/Program';

/**
 * Generate a unique Admission Number
 * Format: INST/2026/UG/CSE/KCET/0001
 * Uses Redis INCR for unique counters across distributed systems
 */
export const generateAdmissionNumber = async (applicant: any, programId: string) => {
  const program: any = await Program.findById(programId).populate('institution');
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
  const sequenceNum = await (redis as any).incr(counterKey);
  
  // Pad number to 4 digits (e.g., 0001)
  const paddedSequence = sequenceNum.toString().padStart(4, '0');

  return `${instCode}/${year}/${courseType}/${programCode}/${quotaType}/${paddedSequence}`;
};

export default {
    generateAdmissionNumber
};
