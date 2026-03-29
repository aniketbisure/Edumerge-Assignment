import mongoose, { Document, Model } from 'mongoose';
interface IQuota {
    quotaType: 'KCET' | 'COMEDK' | 'Management';
    seats: number;
    filled: number;
}
export interface IProgram extends Document {
    department: mongoose.Types.ObjectId;
    campus: mongoose.Types.ObjectId;
    institution: mongoose.Types.ObjectId;
    name: string;
    code: string;
    courseType: 'UG' | 'PG';
    entryType: 'Regular' | 'Lateral';
    admissionMode: 'Government' | 'Management';
    academicYear: string;
    totalIntake: number;
    quotas: IQuota[];
    supernumerarySeats: number;
    isActive: boolean;
    availableSeats: number;
}
declare const Program: Model<IProgram>;
export default Program;
//# sourceMappingURL=Program.d.ts.map