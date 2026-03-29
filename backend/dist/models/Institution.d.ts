import mongoose from 'mongoose';
declare const Institution: mongoose.Model<{
    name: string;
    isActive: boolean;
    code: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    isActive: boolean;
    code: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    name: string;
    isActive: boolean;
    code: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    isActive: boolean;
    code: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    name: string;
    isActive: boolean;
    code: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    name: string;
    isActive: boolean;
    code: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    name: string;
    isActive: boolean;
    code: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    name: string;
    isActive: boolean;
    code: string;
    email?: string | null;
    address?: string | null;
    phone?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default Institution;
//# sourceMappingURL=Institution.d.ts.map