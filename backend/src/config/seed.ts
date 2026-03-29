import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import Institution from '../models/Institution';
import Campus from '../models/Campus';
import Department from '../models/Department';
import Program from '../models/Program';
import logger from '../utils/logger';

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Institution.deleteMany({});
    await Campus.deleteMany({});
    await Department.deleteMany({});
    await Program.deleteMany({});

    // 1. Create Users
    await User.create([
      { name: 'Admin User', email: 'admin@edumerge.com', password: 'Admin@123', role: 'admin' },
      { name: 'Admission Officer', email: 'officer@edumerge.com', password: 'Officer@123', role: 'admission_officer' },
      { name: 'Management User', email: 'mgmt@edumerge.com', password: 'Mgmt@123', role: 'management' }
    ]);
    logger.info('Users seeded');

    // 2. Create Institution
    const inst = await Institution.create({
      name: 'Edumerge Institute of Technology',
      code: 'EIT',
      address: 'Electronic City, Bangalore',
      phone: '080-12345678',
      email: 'contact@eit.edu'
    });
    logger.info('Institution seeded');

    // 3. Create Campus
    const campus = await Campus.create({
      institution: inst._id,
      name: 'Main Campus',
      code: 'MC',
      location: 'Bangalore South'
    });

    // 4. Create Department
    const dept = await Department.create({
      institution: inst._id,
      campus: campus._id,
      name: 'Computer Science & Engineering',
      code: 'CSE'
    });

    // 5. Create Programs
    await Program.create([
      {
        institution: inst._id,
        campus: campus._id,
        department: dept._id,
        name: 'B.Tech Computer Science',
        code: 'CS101',
        courseType: 'UG',
        entryType: 'Regular',
        admissionMode: 'Government',
        academicYear: '2026-27',
        totalIntake: 60,
        quotas: [
          { quotaType: 'KCET', seats: 30, filled: 0 },
          { quotaType: 'COMEDK', seats: 15, filled: 0 },
          { quotaType: 'Management', seats: 15, filled: 0 }
        ]
      },
      {
        institution: inst._id,
        campus: campus._id,
        department: dept._id,
        name: 'B.Tech Information Science',
        code: 'IS101',
        courseType: 'UG',
        entryType: 'Regular',
        admissionMode: 'Management',
        academicYear: '2026-27',
        totalIntake: 60,
        quotas: [
          { quotaType: 'KCET', seats: 30, filled: 0 },
          { quotaType: 'COMEDK', seats: 15, filled: 0 },
          { quotaType: 'Management', seats: 15, filled: 0 }
        ]
      }
    ]);
    logger.info('Programs seeded');

    logger.info('Seeding completed successfully');
    process.exit(0);
  } catch (error: any) {
    logger.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
