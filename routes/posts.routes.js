const express = require('express');
const router = express.Router();

// GET - Posts
router.get('/', async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get("Referrer") || "/");
    }
});

module.exports = router;