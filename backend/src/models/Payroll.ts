import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayroll extends Document {
  user: mongoose.Types.ObjectId;
  month: number;
  year: number;
  fullDayCount: number;
  halfDayCount: number;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid';
  header: string;
  digitalSignUrl?: string;
  stampUrl?: string;
}

const payrollSchema: Schema<IPayroll> = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  fullDayCount: {
    type: Number,
    default: 0
  },
  halfDayCount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid'],
    default: 'Draft'
  },
  header: {
    type: String,
    default: 'Institution Payroll'
  },
  digitalSignUrl: String,
  stampUrl: String
}, {
  timestamps: true
});

const Payroll: Model<IPayroll> = mongoose.model<IPayroll>('Payroll', payrollSchema);
export default Payroll;
