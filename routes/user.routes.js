const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, usernameToLowerCase } = require('../middleware.js');
const User = require('../models/User.js');

// GET - User Dashboard
router.get('/dashboard', isLoggedIn, async (req, res) => {
    try {
        return res.render('users/dashboard');
    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get("Referrer") || "/");
    }
});

// GET - Update Email
router.get('/email', isLoggedIn, async (req, res) => {
    try {
        return res.render('users/update-email');
    } catch (error) {
        console.log(error);
        req.flash('error', error.toString()); 
        res.location(req.get("Referrer") || "/");
    }
});

// PUT - Update Email
router.put('/email', isLoggedIn, async (req, res) => {
    try {
        await User.findOneAndUpdate({'_id': req.user._id}, { 'email': req.body.updatedEmailAdd });
        req.flash('success', 'Your email address was successfully updated.');
        return res.location(req.get('Referrer') || '/');
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

 // GET - Logout
router.get('/logout', async (req, res) => {
    try {
        req.logout(req.user, error => {
            if(error) return next(error);
                req.flash('success', 'You have been logged out!');
                res.redirect('/');
        });
    } catch (error) {
        console.log(error)
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// GET - Login
router.get('/login', async (req, res) => {
    return res.render('general/login');
});

// POST - Login
router.post('/login', usernameToLowerCase, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
    }),
    function(req, res){
});

// GET - Register
router.get('/register', (req, res) => {
    return res.render('general/register');
});

// POST - Register
router.post('/register', usernameToLowerCase, async (req, res) => {
    try {
        await User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password);
        passport.authenticate('local');
        req.flash('success', 'Welcome to Fishing Information!');
        return res.redirect('/locations');
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

module.exports = router;