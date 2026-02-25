require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const multer = require('multer');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { usernameToLowerCase, isLoggedIn, isAdmin } = require('./middleware');
const Post = require('./models/Post');
const Location = require('./models/Location');
const User = require('./models/User');
const generalRoutes = require('./routes/general.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const locationRoutes = require('./routes/locations.routes.js');
const userRoutes = require('./routes/user.routes.js');

// Security
app.use(mongoSanitize()); 
app.use(helmet({contentSecurityPolicy: false}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL);

// Flash Messages
app.use(flash());

// Setup Express Session
app.use(require('express-session')({
    secret: process.env.EXPRESS_SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        touchAfter: 24 * 3600
    })
}));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

// App Config
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Multer Setup
const storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './public/uploads')
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

const fileFilter = function(req, file, callback) {
	const allowedTypes = /jpeg|jpg|png|gif|webp/;
	const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
	const mime = allowedTypes.test(file.mimetype);
	if (ext && mime) {
		callback(null, true);
	} else {
		callback(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
	}
};

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter
}).single('image');


// Add user data globally
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash('error');
   res.locals.success = req.flash('success');
   next();
});

app.use('/', generalRoutes);
app.use('/admin', adminRoutes);
app.use('/locations', locationRoutes);
app.use('/user', userRoutes);

// Location Selector
app.get('/addcatch', async (req, res) => {
    try {
        const locations = await Location.find();
        return res.render('locationselector', {locations});
    } catch (error) {
        return res.send('Oops we hit a snag.');
    }
});

// Catch Feed
app.get('/catches', async (req, res) => {
    return res.redirect('/catches/1');
});

// Feed Page
app.get('/catches/:page', async (req, res) => {
    try {
        const perPage = 8;
        const page = req.params.page || 1;

        const posts = await Post.find({}).sort({'_id': -1}).skip((perPage * page) - perPage).limit(perPage);

        return res.render('posts/list', {posts: posts, current: page, pages: Math.ceil(posts.length/perPage)});
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// GET - Edit Location
app.get('/locations/:id/edit', isLoggedIn, async (req, res) => {
    try {
        const location = await Location.findOne({ '_id': req.params.id });
        return res.render('locations/edit', { location });
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});


// PUT - Edit Location
app.put('/locations/:id', isLoggedIn, async (req, res) => {
    try {
        const { name, gps, image, description, thumbnail } = req.body;
        await Location.findOneAndUpdate({ '_id': req.params.id }, { name, gps, image, description, thumbnail });
        return res.redirect(`/locations/${req.params.id}`);
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// Edit a catch
app.get('/locations/:id/catch/:catchid/edit', async (req, res) => {
    try {
        const post = await Post.findOne({ '_id': req.params.catchid });
        return res.render('posts/edit', { post });
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/'); 
    }
});

// View Catch
app.get('/catch/:catchid', async (req, res) => {
    try {
        const post = await Post.findOne({ '_id': req.params.catchid });
        return res.render('catchpage', { post });
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');  
    }
});

// Edit Catch
app.put('/locations/:id/catch/:catchid', async (req, res) => {
    try {
        await Post.findOneAndUpdate({ '_id': req.params.catchid }, req.body.post);
        req.flash('success', 'Successfully updated catch.');
        return res.redirect(`/catch/${req.params.catchid}`);
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// Delete Catch
app.delete('/locations/:id/catch/:catchid', async (req, res) => {
    try {
        const deletedPost = await Post.findOneAndDelete({ '_id': req.params.catchid });
        await Location.findOneAndUpdate({ '_id': req.params.id }, { '$pull': { '$elemMatch': { 'catches': deletedPost._id }}});

        req.flash('success', 'Your catch has been deleted.');
        return res.location(req.get('Referrer') || '/');
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/'); 
    }
});

// New Catch FORM ONLY
app.get('/locations/:id/catch/new', isLoggedIn, async (req, res) => {
    try {
        const location = await Location.findOne({ '_id': req.params.id });
        return res.render('posts/add', { location });
    } catch (error) {
        req.flash('error', error.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// Catch Post LOGIC
app.post('/locations/:id/catch', isLoggedIn, async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            req.flash('error', 'Location not found');
            return res.redirect('/locations');
        }

        await new Promise((resolve, reject) => {
            upload(req, res, (err) => (err ? reject(err) : resolve()));
        });

        const { catchlocation, catchlocationid, species, weight, description } = req.body;
        const image = '/uploads/' + req.file.filename;

        const post = await Post.create({
            species, image, weight, description, catchlocation, catchlocationid
        });

        post.author.id = req.user._id;
        post.author.username = req.user.username;
        await post.save();

        location.posts.push(post);
        await location.save();

        req.flash('success', 'Your catch has been added. Thank you!');
        return res.redirect('/locations/' + location._id + '/catches/');
    } catch (err) {
        console.log(err);
        req.flash('error', err.message || 'Something went wrong');
        return res.redirect('/locations');
    }
});

// DELETE - Delete User
app.delete('/users/:userId', isAdmin, async (req, res) => {
    try {
        await User.findOneAndDelete({_id: req.params.userId});
        req.flash('success', 'User has been deleted.');
        return res.location(req.get('Referrer') || '/');
    } catch (err) {
        req.flash('error', err.toString());
        return res.location(req.get('Referrer') || '/');
    }
});

// 404 Page - Must be last
app.get('*', async (req, res) => {
    res.render('general/page-not-found');
});

app.listen(process.env.PORT, () => {
   console.log(`Fishing Information is now running on ${process.env.PORT}!`);
});
