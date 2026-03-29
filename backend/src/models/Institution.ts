import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an institution name']
  },
  code: {
    type: String,
    required: [true, 'Please provide an institution code'],
    unique: true,
    uppercase: true
  },
  address: String,
  phone: String,
  email: {
    type: String,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save to auto-generate code from name initials if not provided (optional extra)
institutionSchema.pre('save', async function() {
  const doc = this as any; // Cast to any to access dynamic properties or define an interface
  if (!doc.code && doc.name) {
    doc.code = doc.name
      .split(' ')
      .map((word: string) => (word[0] || ''))
      .join('')
      .toUpperCase();
  }
});

const Institution = mongoose.model('Institution', institutionSchema);
export default Institution;
