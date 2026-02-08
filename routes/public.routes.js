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
app.get('/terms', async (req, res) => {
    try {
	    return res.render('general/terms');
    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get('Referrer') || '/');
    }
});