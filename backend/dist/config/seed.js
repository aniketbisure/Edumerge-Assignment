"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Institution_1 = __importDefault(require("../models/Institution"));
const Campus_1 = __importDefault(require("../models/Campus"));
const Department_1 = __importDefault(require("../models/Department"));
const Program_1 = __importDefault(require("../models/Program"));
const logger_1 = __importDefault(require("../utils/logger"));
const seedData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose_1.default.connect(mongoUri);
        logger_1.default.info('Connected to MongoDB for seeding...');
        // Clear existing data
        await User_1.default.deleteMany({});
        await Institution_1.default.deleteMany({});
        await Campus_1.default.deleteMany({});
        await Department_1.default.deleteMany({});
        await Program_1.default.deleteMany({});
        // 1. Create Users
        await User_1.default.create([
            { name: 'Admin User', email: 'admin@edumerge.com', password: 'Admin@123', role: 'admin' },
            { name: 'Admission Officer', email: 'officer@edumerge.com', password: 'Officer@123', role: 'admission_officer' },
            { name: 'Management User', email: 'mgmt@edumerge.com', password: 'Mgmt@123', role: 'management' }
        ]);
        logger_1.default.info('Users seeded');
        // 2. Create Institution
        const inst = await Institution_1.default.create({
            name: 'Edumerge Institute of Technology',
            code: 'EIT',
            address: 'Electronic City, Bangalore',
            phone: '080-12345678',
            email: 'contact@eit.edu'
        });
        logger_1.default.info('Institution seeded');
        // 3. Create Campus
        const campus = await Campus_1.default.create({
            institution: inst._id,
            name: 'Main Campus',
            code: 'MC',
            location: 'Bangalore South'
        });
        // 4. Create Department
        const dept = await Department_1.default.create({
            institution: inst._id,
            campus: campus._id,
            name: 'Computer Science & Engineering',
            code: 'CSE'
        });
        // 5. Create Programs
        await Program_1.default.create([
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
        logger_1.default.info('Programs seeded');
        logger_1.default.info('Seeding completed successfully');
        process.exit(0);
    }
    catch (error) {
        logger_1.default.error(`Error seeding data: ${error.message}`);
        process.exit(1);
    }
};
seedData();
//# sourceMappingURL=seed.js.map