import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: true
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a department name']
  },
  code: {
    type: String,
    required: [true, 'Please provide a department code'],
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
