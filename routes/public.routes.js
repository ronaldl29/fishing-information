const express = require('express');
const router = express.Router();

// Home Page
router.get('/', async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get("Referrer") || "/");
    }
});