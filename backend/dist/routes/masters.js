"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const Institution = require('../models/Institution');
const Campus = require('../models/Campus');
const Department = require('../models/Department');
const Program = require('../models/Program');
const logger = require('../utils/logger');
// Middleware: all routes require Admin role
router.use(auth, authorize('admin'));
// Institution CRUD
router.get('/institutions', async (req, res) => {
    const data = await Institution.find();
    res.json({ success: true, data });
});
router.post('/institutions', async (req, res) => {
    const data = await Institution.create(req.body);
    res.status(201).json({ success: true, data });
});
// Campus CRUD
router.get('/campuses', async (req, res) => {
    const data = await Campus.find().populate('institution');
    res.json({ success: true, data });
});
router.post('/campuses', async (req, res) => {
    const data = await Campus.create(req.body);
    res.status(201).json({ success: true, data });
});
// Department CRUD
router.get('/departments', async (req, res) => {
    const data = await Department.find().populate('institution campus');
    res.json({ success: true, data });
});
router.post('/departments', async (req, res) => {
    const data = await Department.create(req.body);
    res.status(201).json({ success: true, data });
});
// Program CRUD
router.get('/programs', async (req, res) => {
    const data = await Program.find().populate('institution campus department');
    res.json({ success: true, data });
});
router.post('/programs', async (req, res) => {
    try {
        const data = await Program.create(req.body);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res.status(422).json({ success: false, message: error.message });
    }
});
module.exports = router;
//# sourceMappingURL=masters.js.map