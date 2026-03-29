import { Document, Model } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'admission_officer' | 'management';
    isActive: boolean;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
declare const User: Model<IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map