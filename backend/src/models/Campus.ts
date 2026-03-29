import mongoose from 'mongoose';

const campusSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a campus name']
  },
  code: {
    type: String,
    required: [true, 'Please provide a campus code'],
    uppercase: true
  },
  location: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Campus = mongoose.model('Campus', campusSchema);
export default Campus;
