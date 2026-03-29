"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const institutionSchema = new mongoose_1.default.Schema({
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
institutionSchema.pre('save', async function () {
    const doc = this; // Cast to any to access dynamic properties or define an interface
    if (!doc.code && doc.name) {
        doc.code = doc.name
            .split(' ')
            .map((word) => (word[0] || ''))
            .join('')
            .toUpperCase();
    }
});
const Institution = mongoose_1.default.model('Institution', institutionSchema);
exports.default = Institution;
//# sourceMappingURL=Institution.js.map