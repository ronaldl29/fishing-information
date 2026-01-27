const express = require('express');
const router = express.Router();

// Admin Panel
router.get('/admin', async (req, res) => {
    try {
        res.render('admin/dashboard');
    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get("Referrer") || "/");
    }
});