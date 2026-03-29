"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const departmentSchema = new mongoose_1.default.Schema({
    campus: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Campus',
        required: true
    },
    institution: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
const Department = mongoose_1.default.model('Department', departmentSchema);
exports.default = Department;
//# sourceMappingURL=Department.js.map