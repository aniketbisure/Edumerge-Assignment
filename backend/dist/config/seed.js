"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Institution = require('../models/Institution');
const Campus = require('../models/Campus');
const Department = require('../models/Department');
const Program = require('../models/Program');
const logger = require('../utils/logger');
const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('Connected to MongoDB for seeding...');
        // Clear existing data
        await User.deleteMany({});
        await Institution.deleteMany({});
        await Campus.deleteMany({});
        await Department.deleteMany({});
        await Program.deleteMany({});
        // 1. Create Users
        const users = await User.create([
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
    }
    catch (error) {
        logger.error('Error seeding data:', error);
        process.exit(1);
    }
};
seedData();
//# sourceMappingURL=seed.js.map