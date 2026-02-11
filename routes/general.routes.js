const express = require('express');
const router = express.Router();

// GET - Home Page
router.get('/', async (req, res) => {
    try {
        return res.redirect("/locations");
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

// GET - Resources
router.get('/resources', async (req, res) => {
    try {
	    res.render('general/resources');
    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get('Referrer') || '/');
    }
});

module.exports = router;