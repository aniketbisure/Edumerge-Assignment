"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
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
institutionSchema.pre('save', function (next) {
    if (!this.code && this.name) {
        this.code = this.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    }
    next();
});
module.exports = mongoose.model('Institution', institutionSchema);
//# sourceMappingURL=Institution.js.map