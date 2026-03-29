const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: false },
});

const User = mongoose.model('User', userSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'admin@edumerge.com' }).select('+password');
  console.log('User found:', !!user);
  if (user) {
    console.log('Hashed Password:', user.password);
    console.log('Starts with $2a$ or $2b$:', user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$'));
    const isMatch = await bcrypt.compare('Admin@123', user.password);
    console.log('bcrypt.compare result:', isMatch);
  }
  process.exit(0);
}

check().catch(err => { console.error(err); process.exit(1); });
