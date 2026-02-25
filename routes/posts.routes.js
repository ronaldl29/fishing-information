const express = require('express');
const router = express.Router();
const Post = require('../models/Post.js');

// GET - Posts
router.get('/', async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        req.flash('error', error.toString());
        res.location(req.get("Referrer") || "/");
    }
});

// GET - Posts by Location ID
router.get('/locations/:id/catches/:page?', async (req, res) => {
    try {
        const perPage = 8;
        const page = req.params.page || 1;

        const totalPosts = await Post.countDocuments({ catchlocationid: req.params.id });
        const posts = await Post.find({ catchlocationid: req.params.id })
            .sort({ _id: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);

        if (!posts.length) {
            req.flash('error', 'No catches found for this location.');
            return res.redirect('/locations/' + req.params.id);
        }

        return res.render('posts/locationcatches', {
            posts,
            current: page,
            pages: Math.ceil(totalPosts / perPage)
        });
    } catch (error) {
        console.log(error);
        req.flash('error', error.toString());
        return res.redirect('/locations');
    }
});

module.exports = router;