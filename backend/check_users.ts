import mongoose from 'mongoose';
import User from './src/models/User';
import 'dotenv/config';

async function checkUsers() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is missing');
    await mongoose.connect(mongoUri);
    const users = await User.find({}).select('+password');
    console.log('Users in DB:', users.map(u => ({ email: u.email, role: u.role, passwordSelected: !!u.password })));
    if (users.length > 0) {
        const u = users.find(u => u.email === 'admin@edumerge.com');
        if (u) {
            const isMatch = await u.comparePassword('Admin@123');
            console.log('Admin password match check:', isMatch);
        } else {
            console.log('Admin user not found');
        }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
