"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = __importDefault(require("../middleware/auth"));
const rbac_1 = __importDefault(require("../middleware/rbac"));
const Institution_1 = __importDefault(require("../models/Institution"));
const Campus_1 = __importDefault(require("../models/Campus"));
const Department_1 = __importDefault(require("../models/Department"));
const Program_1 = __importDefault(require("../models/Program"));
// Middleware: all routes require Admin role
router.use(auth_1.default, (0, rbac_1.default)('admin'));
// Institution CRUD
router.get('/institutions', async (req, res) => {
    const data = await Institution_1.default.find();
    res.json({ success: true, data });
});
router.post('/institutions', async (req, res) => {
    const data = await Institution_1.default.create(req.body);
    res.status(201).json({ success: true, data });
});
// Campus CRUD
router.get('/campuses', async (req, res) => {
    const data = await Campus_1.default.find().populate('institution');
    res.json({ success: true, data });
});
router.post('/campuses', async (req, res) => {
    const data = await Campus_1.default.create(req.body);
    res.status(201).json({ success: true, data });
});
// Department CRUD
router.get('/departments', async (req, res) => {
    const data = await Department_1.default.find().populate('institution campus');
    res.json({ success: true, data });
});
router.post('/departments', async (req, res) => {
    const data = await Department_1.default.create(req.body);
    res.status(201).json({ success: true, data });
});
// Program CRUD
router.get('/programs', async (req, res) => {
    const data = await Program_1.default.find().populate('institution campus department');
    res.json({ success: true, data });
});
router.post('/programs', async (req, res) => {
    try {
        const data = await Program_1.default.create(req.body);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res.status(422).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=masters.js.map