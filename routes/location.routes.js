const express = require('express');
const router = express.Router();

// GET - Location By ID Page
router.get('/locations/:id', async (req, res) => {
    try {
        const location = await Location.findOne({ '_id': req.params.id }).populate('posts').sort({ '_id': -1 });
        return res.render('locations/view', { location });
    } catch (err) {
        console.log(err)
        req.flash('error', err.toString());
        return res.location(req.get('Referrer') || '/');
    }
});