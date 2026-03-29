"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const campusSchema = new mongoose_1.default.Schema({
    institution: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Institution',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a campus name']
    },
    code: {
        type: String,
        required: [true, 'Please provide a campus code'],
        uppercase: true
    },
    location: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
const Campus = mongoose_1.default.model('Campus', campusSchema);
exports.default = Campus;
//# sourceMappingURL=Campus.js.map