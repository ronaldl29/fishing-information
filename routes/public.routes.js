const express = require('express');
const router = express.Router();

// Home Page
router.get('/', async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get('Referrer') || '/');
    }
});


// GET - Terms of Use
router.get('/terms', async (req, res) => {
    try {
	    return res.render('general/terms');
    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get('Referrer') || '/');
    }
});