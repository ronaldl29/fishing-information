const express = require('express');
const router = express.Router();

// Admin Panel
router.get('/', async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get("Referrer") || "/");
    }
});