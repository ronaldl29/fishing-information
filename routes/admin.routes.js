const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware.js');
const User = require('../models/User');

// GET - Admin Panel
router.get('/', isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.render('admin/dashboard', { users });
    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get("Referrer") || "/");
    }
});

module.exports = router;