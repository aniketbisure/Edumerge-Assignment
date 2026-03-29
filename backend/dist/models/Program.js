"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const quotaSchema = new mongoose_1.Schema({
    quotaType: {
        type: String,
        enum: ['KCET', 'COMEDK', 'Management'],
        required: true
    },
    seats: {
        type: Number,
        required: true,
        min: 0
    },
    filled: {
        type: Number,
        default: 0,
        min: 0
    }
});
const programSchema = new mongoose_1.Schema({
    department: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    campus: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Campus',
        required: true
    },
    institution: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a program name']
    },
    code: {
        type: String,
        required: [true, 'Please provide a program code'],
        uppercase: true
    },
    courseType: {
        type: String,
        enum: ['UG', 'PG'],
        required: true
    },
    entryType: {
        type: String,
        enum: ['Regular', 'Lateral'],
        required: true
    },
    admissionMode: {
        type: String,
        enum: ['Government', 'Management'],
        required: true
    },
    academicYear: {
        type: String,
        required: true,
        default: '2026-27'
    },
    totalIntake: {
        type: Number,
        required: [true, 'Total intake is required'],
        min: 1
    },
    quotas: [quotaSchema],
    supernumerarySeats: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual for available seats
programSchema.virtual('availableSeats').get(function () {
    const totalFilled = this.quotas.reduce((acc, q) => acc + q.filled, 0);
    return this.totalIntake - totalFilled;
});
// Pre-save validation: sum of quota seats must equal totalIntake
programSchema.pre('save', async function () {
    const sumQuotaSeats = this.quotas.reduce((acc, q) => acc + q.seats, 0);
    if (sumQuotaSeats !== this.totalIntake) {
        throw new Error(`Sum of quota seats (${sumQuotaSeats}) must equal total intake (${this.totalIntake})`);
    }
});
// Index for query performance
programSchema.index({ institution: 1, academicYear: 1 });
const Program = mongoose_1.default.model('Program', programSchema);
exports.default = Program;
//# sourceMappingURL=Program.js.map