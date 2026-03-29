import mongoose, { Document, Schema, Model } from 'mongoose';

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

const quotaSchema = new Schema<IQuota>({
  quotaType: {
    type: String,
    enum: ['KCET', 'COMEDK', 'Management'],
    required: true
  },
  seats: {
    type: Number,
    required: true,
    min: 0
  },
  filled: {
    type: Number,
    default: 0,
    min: 0
  }
});

const programSchema = new Schema<IProgram>({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  campus: {
    type: Schema.Types.ObjectId,
    ref: 'Campus',
    required: true
  },
  institution: {
    type: Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a program name']
  },
  code: {
    type: String,
    required: [true, 'Please provide a program code'],
    uppercase: true
  },
  courseType: {
    type: String,
    enum: ['UG', 'PG'],
    required: true
  },
  entryType: {
    type: String,
    enum: ['Regular', 'Lateral'],
    required: true
  },
  admissionMode: {
    type: String,
    enum: ['Government', 'Management'],
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    default: '2026-27'
  },
  totalIntake: {
    type: Number,
    required: [true, 'Total intake is required'],
    min: 1
  },
  quotas: [quotaSchema],
  supernumerarySeats: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available seats
programSchema.virtual('availableSeats').get(function(this: IProgram) {
  if (!this.quotas) return this.totalIntake || 0;
  const totalFilled = this.quotas.reduce((acc, q) => acc + q.filled, 0);
  return (this.totalIntake || 0) - totalFilled;
});

// Pre-save validation: sum of quota seats must equal totalIntake
programSchema.pre<IProgram>('save', async function() {
  const sumQuotaSeats = this.quotas.reduce((acc, q) => acc + q.seats, 0);
  if (sumQuotaSeats !== this.totalIntake) {
    throw new Error(`Sum of quota seats (${sumQuotaSeats}) must equal total intake (${this.totalIntake})`);
  }
});


// Index for query performance
programSchema.index({ institution: 1, academicYear: 1 });

const Program: Model<IProgram> = mongoose.model<IProgram>('Program', programSchema);
export default Program;
