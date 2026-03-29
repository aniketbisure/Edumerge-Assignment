import mongoose from 'mongoose';
declare const Applicant: mongoose.Model<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "Male" | "Female" | "Other";
    category: "GM" | "SC" | "ST" | "OBC" | "EWS";
    program: mongoose.Types.ObjectId;
    quotaType: "KCET" | "COMEDK" | "Management";
    entryType: "Regular" | "Lateral";
    admissionMode: "Management" | "Government";
    status: "Applied" | "Seat_Locked" | "Confirmed" | "Cancelled";
    createdBy: mongoose.Types.ObjectId;
    feeStatus: "Pending" | "Paid";
    dateOfBirth?: NativeDate | null;
    seatLockedAt?: NativeDate | null;
    confirmedAt?: NativeDate | null;
    allotmentNumber?: string | null;
    qualifyingMarks?: number | null;
    documentStatus?: {
        tenthMarksheet: "Pending" | "Submitted" | "Verified";
        twelfthMarksheet: "Pending" | "Submitted" | "Verified";
        casteCertificate: "Pending" | "Submitted" | "Verified";
        domicile: "Pending" | "Submitted" | "Verified";
        photos: "Pending" | "Submitted" | "Verified";
    } | null;
    admissionNumber?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "Male" | "Female" | "Other";
    category: "GM" | "SC" | "ST" | "OBC" | "EWS";
    program: mongoose.Types.ObjectId;
    quotaType: "KCET" | "COMEDK" | "Management";
    entryType: "Regular" | "Lateral";
    admissionMode: "Management" | "Government";
    status: "Applied" | "Seat_Locked" | "Confirmed" | "Cancelled";
    createdBy: mongoose.Types.ObjectId;
    feeStatus: "Pending" | "Paid";
    dateOfBirth?: NativeDate | null;
    seatLockedAt?: NativeDate | null;
    confirmedAt?: NativeDate | null;
    allotmentNumber?: string | null;
    qualifyingMarks?: number | null;
    documentStatus?: {
        tenthMarksheet: "Pending" | "Submitted" | "Verified";
        twelfthMarksheet: "Pending" | "Submitted" | "Verified";
        casteCertificate: "Pending" | "Submitted" | "Verified";
        domicile: "Pending" | "Submitted" | "Verified";
        photos: "Pending" | "Submitted" | "Verified";
    } | null;
    admissionNumber?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "Male" | "Female" | "Other";
    category: "GM" | "SC" | "ST" | "OBC" | "EWS";
    program: mongoose.Types.ObjectId;
    quotaType: "KCET" | "COMEDK" | "Management";
    entryType: "Regular" | "Lateral";
    admissionMode: "Management" | "Government";
    status: "Applied" | "Seat_Locked" | "Confirmed" | "Cancelled";
    createdBy: mongoose.Types.ObjectId;
    feeStatus: "Pending" | "Paid";
    dateOfBirth?: NativeDate | null;
    seatLockedAt?: NativeDate | null;
    confirmedAt?: NativeDate | null;
    allotmentNumber?: string | null;
    qualifyingMarks?: number | null;
    documentStatus?: {
        tenthMarksheet: "Pending" | "Submitted" | "Verified";
        twelfthMarksheet: "Pending" | "Submitted" | "Verified";
        casteCertificate: "Pending" | "Submitted" | "Verified";
        domicile: "Pending" | "Submitted" | "Verified";
        photos: "Pending" | "Submitted" | "Verified";
    } | null;
    admissionNumber?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "Male" | "Female" | "Other";
    category: "GM" | "SC" | "ST" | "OBC" | "EWS";
    program: mongoose.Types.ObjectId;
    quotaType: "KCET" | "COMEDK" | "Management";
    entryType: "Regular" | "Lateral";
    admissionMode: "Management" | "Government";
    status: "Applied" | "Seat_Locked" | "Confirmed" | "Cancelled";
    createdBy: mongoose.Types.ObjectId;
    feeStatus: "Pending" | "Paid";
    dateOfBirth?: NativeDate | null;
    seatLockedAt?: NativeDate | null;
    confirmedAt?: NativeDate | null;
    allotmentNumber?: string | null;
    qualifyingMarks?: number | null;
    documentStatus?: {
        tenthMarksheet: "Pending" | "Submitted" | "Verified";
        twelfthMarksheet: "Pending" | "Submitted" | "Verified";
        casteCertificate: "Pending" | "Submitted" | "Verified";
        domicile: "Pending" | "Submitted" | "Verified";
        photos: "Pending" | "Submitted" | "Verified";
    } | null;
    admissionNumber?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "Male" | "Female" | "Other";
    category: "GM" | "SC" | "ST" | "OBC" | "EWS";
    program: mongoose.Types.ObjectId;
    quotaType: "KCET" | "COMEDK" | "Management";
    entryType: "Regular" | "Lateral";
    admissionMode: "Management" | "Government";
    status: "Applied" | "Seat_Locked" | "Confirmed" | "Cancelled";
    createdBy: mongoose.Types.ObjectId;
    feeStatus: "Pending" | "Paid";
    dateOfBirth?: NativeDate | null;
    seatLockedAt?: NativeDate | null;
    confirmedAt?: NativeDate | null;
    allotmentNumber?: string | null;
    qualifyingMarks?: number | null;
    documentStatus?: {
        tenthMarksheet: "Pending" | "Submitted" | "Verified";
        twelfthMarksheet: "Pending" | "Submitted" | "Verified";
        casteCertificate: "Pending" | "Submitted" | "Verified";
        domicile: "Pending" | "Submitted" | "Verified";
        photos: "Pending" | "Submitted" | "Verified";
    } | null;
    admissionNumber?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "Male" | "Female" | "Other";
    category: "GM" | "SC" | "ST" | "OBC" | "EWS";
    program: mongoose.Types.ObjectId;
    quotaType: "KCET" | "COMEDK" | "Management";
    entryType: "Regular" | "Lateral";
    admissionMode: "Management" | "Government";
    status: "Applied" | "Seat_Locked" | "Confirmed" | "Cancelled";
    createdBy: mongoose.Types.ObjectId;
    feeStatus: "Pending" | "Paid";
    dateOfBirth?: NativeDate | null;
    seatLockedAt?: NativeDate | null;
    confirmedAt?: NativeDate | null;
    allotmentNumber?: string | null;
    qualifyingMarks?: number | null;
    documentStatus?: {
        tenthMarksheet: "Pending" | "Submitted" | "Verified";
        twelfthMarksheet: "Pending" | "Submitted" | "Verified";
        casteCertificate: "Pending" | "Submitted" | "Verified";
        domicile: "Pending" | "Submitted" | "Verified";
        photos: "Pending" | "Submitted" | "Verified";
    } | null;
    admissionNumber?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "Male" | "Female" | "Other";
    category: "GM" | "SC" | "ST" | "OBC" | "EWS";
    program: mongoose.Types.ObjectId;
    quotaType: "KCET" | "COMEDK" | "Management";
    entryType: "Regular" | "Lateral";
    admissionMode: "Management" | "Government";
    status: "Applied" | "Seat_Locked" | "Confirmed" | "Cancelled";
    createdBy: mongoose.Types.ObjectId;
    feeStatus: "Pending" | "Paid";
    dateOfBirth?: NativeDate | null;
    seatLockedAt?: NativeDate | null;
    confirmedAt?: NativeDate | null;
    allotmentNumber?: string | null;
    qualifyingMarks?: number | null;
    documentStatus?: {
        tenthMarksheet: "Pending" | "Submitted" | "Verified";
        twelfthMarksheet: "Pending" | "Submitted" | "Verified";
        casteCertificate: "Pending" | "Submitted" | "Verified";
        domicile: "Pending" | "Submitted" | "Verified";
        photos: "Pending" | "Submitted" | "Verified";
    } | null;
    admissionNumber?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: "Male" | "Female" | "Other";
    category: "GM" | "SC" | "ST" | "OBC" | "EWS";
    program: mongoose.Types.ObjectId;
    quotaType: "KCET" | "COMEDK" | "Management";
    entryType: "Regular" | "Lateral";
    admissionMode: "Management" | "Government";
    status: "Applied" | "Seat_Locked" | "Confirmed" | "Cancelled";
    createdBy: mongoose.Types.ObjectId;
    feeStatus: "Pending" | "Paid";
    dateOfBirth?: NativeDate | null;
    seatLockedAt?: NativeDate | null;
    confirmedAt?: NativeDate | null;
    allotmentNumber?: string | null;
    qualifyingMarks?: number | null;
    documentStatus?: {
        tenthMarksheet: "Pending" | "Submitted" | "Verified";
        twelfthMarksheet: "Pending" | "Submitted" | "Verified";
        casteCertificate: "Pending" | "Submitted" | "Verified";
        domicile: "Pending" | "Submitted" | "Verified";
        photos: "Pending" | "Submitted" | "Verified";
    } | null;
    admissionNumber?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default Applicant;
//# sourceMappingURL=Applicant.d.ts.map