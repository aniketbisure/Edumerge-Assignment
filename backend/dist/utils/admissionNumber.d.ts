/**
 * Generate a unique Admission Number
 * Format: INST/2026/UG/CSE/KCET/0001
 * Uses Redis INCR for unique counters across distributed systems
 */
export declare const generateAdmissionNumber: (applicant: any, programId: string) => Promise<string>;
declare const _default: {
    generateAdmissionNumber: (applicant: any, programId: string) => Promise<string>;
};
export default _default;
//# sourceMappingURL=admissionNumber.d.ts.map