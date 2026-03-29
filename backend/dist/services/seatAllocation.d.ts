import { IApplicant } from '../models/Applicant';
/**
 * Allocate a seat to an applicant with Redis distributed locking
 */
export declare const allocateSeat: (applicantId: string, programId: string, quotaType: string) => Promise<IApplicant>;
/**
 * Release a seat if an admission is cancelled
 */
export declare const releaseSeat: (applicantId: string) => Promise<IApplicant>;
declare const _default: {
    allocateSeat: (applicantId: string, programId: string, quotaType: string) => Promise<IApplicant>;
    releaseSeat: (applicantId: string) => Promise<IApplicant>;
};
export default _default;
//# sourceMappingURL=seatAllocation.d.ts.map