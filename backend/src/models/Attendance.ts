import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAttendance extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  hoursWorked: number;
  status: 'Full_Day' | 'Half_Day' | 'Absent';
}

const attendanceSchema: Schema<IAttendance> = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Full_Day', 'Half_Day', 'Absent'],
    default: 'Absent'
  }
}, {
  timestamps: true
});

// Calculate status based on hoursWorked before saving
attendanceSchema.pre('save', function(this: IAttendance) {
  if (this.hoursWorked >= 9) {
    this.status = 'Full_Day';
  } else if (this.hoursWorked > 0) {
    this.status = 'Half_Day';
  } else {
    this.status = 'Absent';
  }
});

const Attendance: Model<IAttendance> = mongoose.model<IAttendance>('Attendance', attendanceSchema);
export default Attendance;
