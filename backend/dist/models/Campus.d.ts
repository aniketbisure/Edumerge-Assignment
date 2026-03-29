import mongoose from 'mongoose';
declare const Campus: mongoose.Model<{
    name: string;
    isActive: boolean;
    code: string;
    institution: mongoose.Types.ObjectId;
    location?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    isActive: boolean;
    code: string;
    institution: mongoose.Types.ObjectId;
    location?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    name: string;
    isActive: boolean;
    code: string;
    institution: mongoose.Types.ObjectId;
    location?: string | null;
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
    institution: mongoose.Types.ObjectId;
    location?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    name: string;
    isActive: boolean;
    code: string;
    institution: mongoose.Types.ObjectId;
    location?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    name: string;
    isActive: boolean;
    code: string;
    institution: mongoose.Types.ObjectId;
    location?: string | null;
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
    institution: mongoose.Types.ObjectId;
    location?: string | null;
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
    institution: mongoose.Types.ObjectId;
    location?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default Campus;
//# sourceMappingURL=Campus.d.ts.map