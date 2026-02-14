const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware.js');
const Location = require('../models/Location.js');

// GET - Location List
router.get('/', async (req, res) => {
    try {
        const allLocations = await Location.find();
        res.render('locations/list', {location: allLocations});
    } catch (err) {
        console.log(err)
        req.flash('error', err.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// GET - Location By ID Page
router.get('/:id', async (req, res) => {
    try {
        const location = await Location.findOne({ '_id': req.params.id }).populate('posts').sort({ '_id': -1 });
        return res.render('locations/view', { location });
    } catch (err) {
        console.log(err)
        req.flash('error', err.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// GET - Add Location
router.get('/add', isLoggedIn, async (req, res) => {
    try {
        res.render('locations/add');
    } catch (err) {
        console.log(err)
        req.flash('error', err.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// POST - Add location
router.post('/', isLoggedIn, async (req, res) => {
    try {
        const { name, gps, image, description, thumbnail } = req.body;
        const location = await Location.create({ name, gps, image, description, thumbnail });
        return res.redirect(`/locations/${location._id}`);
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// GET - Location Catches by Location ID
router.get('/locations/:id/catches', async (req, res) => {
    try {
        const perPage = 8;
        const page = req.params.page || 1;

        const posts = await Post.find({ 'catchlocationid': req.params.id }).sort({ '_id': -1 }).skip((perPage * page) - perPage).limit(perPage);
        return res.render('locationcatches', { posts: posts, current: page, pages: Math.ceil(posts.length/perPage)});
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// DELETE - Delete Location By ID
router.delete('/locations/:id', async (req, res) => {
    try {
        await Location.findOneAndDelete({'_id': req.params.id});
        req.flash('success', 'Location successfully deleted.');
        return res.redirect('/locations');
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

module.exports = router;