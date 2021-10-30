require('dotenv').config();

const express             = require("express"),
    app                   = express(),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    flash                 = require("connect-flash"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    methodOverride        = require("method-override"),
    Catch                 = require("./models/catch"),
    Location              = require('./models/location'),
    User                  = require("./models/user"),
    multer                = require("multer"),
    path                  = require("path"),
    mongoSanitize         = require('express-mongo-sanitize'),
    helmet                = require('helmet');

// Security
app.use(mongoSanitize()); 
app.use(helmet({contentSecurityPolicy: false}));

// Connect to MongoDB
mongoose.connect("mongodb://localhost/fishbak", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

// Flash Messages
app.use(flash());

// Setup ReCaptcha Middleware
const opts =
  { secretKey: process.env.RECAPTCHA_SECRET_KEY
  , errors:
    { validation: function () { return new Error('Captcha must be filled out.') }
    , missingBody: function () { return new Error('Missing body response from recaptcha') }
    , missingError: function () { return new Error('Recaptcha not successful but no error codes provided') }
    , recaptchaErrorHandler: function (errors) {
        return new Error(errors.join(', '))
      }
    }
 }
var sentCaptcha = require('recaptcha-middleware')(opts);

// Setup Express Session
app.use(require("express-session")({
    secret: process.env.EXPRESS_SESSION_KEY,
    resave: false,
    saveUninitialized: false
}));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

// App Config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Multer Setup
const storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './public/uploads')
	},
	filename: function(req, file, callback) {
		console.log(file)
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});
const upload = multer({ storage : storage}).single('image');


// Add user data globally
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error     = req.flash("error");
   res.locals.success   = req.flash("success");
   next();
});

// Home
app.get("/", (req, res) => {
  res.redirect("/locations");
});

app.get("/locations", (req, res) => {
    Location.find({}, function(err, allLocations){
        if(err){
            res.send("Oops we hit a snag.");
        } else {
            res.render("locationlist", {location: allLocations});
        }
    })
});

// Location Selector
app.get("/addcatch", async (req, res) => {
    try {
        const locations = await Location.find();
        return res.render("locationselector", {locations});
    } catch (error) {
        return res.send('Oops we hit a snag.');
    }
});

// Catch Feed
app.get("/catches", (req, res) => {
    return res.redirect("/catches/1");
});

// User Dashboard
app.get("/dashboard", isLoggedIn, (req, res) => {
    return res.render("dashboard")
});

// Update Email
app.get('/update/user/email', isLoggedIn, (req, res) => {
    return res.render('changeemail');
});

app.put('/update/user/email', isLoggedIn, async (req, res) => {
    try {
        await User.findOneAndUpdate({'_id': req.user._id}, { 'email': req.body.updatedEmailAdd });
        req.flash('success', 'Your email address was successfully updated.');
        return res.redirect('back');
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');
    }
});

// Feed Page
app.get('/catches/:page', async (req, res) => {
    try {
        const perPage = 8;
        const page = req.params.page || 1;

        const posts = await Catch.find({}).sort({"_id": -1}).skip((perPage * page) - perPage).limit(perPage);

        return res.render('catch123', {posts: posts, current: page, pages: Math.ceil(posts.length/perPage)});
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');
    }
});

app.get('/locations/add', isLoggedIn, (req, res) => {
    res.render("newlocation");
});

// Add location logic
app.post('/locations', isLoggedIn, async (req, res) => {
    try {
        const { name, gps, image, description, thumbnail } = req.body;
        const location = await Location.create({ name, gps, image, description, thumbnail });
        return res.redirect(`/locations/${location._id}`);
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');
    }
});

// Edit location
app.get('/locations/:id/edit', isLoggedIn, async (req, res) => {
    try {
        const location = await Location.findOne({ '_id': req.params.id });
        return res.render('editlocation', { location });
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');
    }
});


// Update location
app.put('/locations/:id', isLoggedIn, async (req, res) => {
    try {
        const { name, gps, image, description, thumbnail } = req.body;
        await Location.findOneAndUpdate({ '_id': req.params.id }, { name, gps, image, description, thumbnail });
        return res.redirect(`/locations/${req.params.id}`);
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');
    }
});

// Delete Location
app.delete("/locations/:id", async (req, res) => {
    try {
        await Location.findOneAndDelete({'_id': req.params.id});
        req.flash('success', 'Location successfully deleted.');
        return res.redirect('/locations');
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');
    }
});

// Location Page
app.get('/locations/:id', async (req, res) => {
    try {
        const location = await Location.findOne({ '_id': req.params.id }).populate('catches').sort({ '_id': -1 });
        return res.render('location', { location });
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');
    }
});

// Location Catches
app.get('/locations/:id/catches', async (req, res) => {
    try {
        const perPage = 8;
        const page = req.params.page || 1;

        const posts = await Catch.find({ 'catchlocationid': req.params.id }).sort({ '_id': -1 }).skip((perPage * page) - perPage).limit(perPage);
        return res.render('locationcatches', { posts: posts, current: page, pages: Math.ceil(posts.length/perPage)});
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');
    }
});

// Edit a catch
app.get('/locations/:id/catch/:catchid/edit', isUserPost, async (req, res) => {
    try {
        const post = await Catch.findOne({ '_id': req.params.catchid });
        return res.render('editcatch', { post });
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');   
    }
});

// View Catch
app.get('/catch/:catchid', async (req, res) => {
    try {
        const post = await Catch.findOne({ '_id': req.params.catchid });
        return res.render('catchpage', { post });
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');    
    }
});

// Edit Catch
app.put('/locations/:id/catch/:catchid', isUserPost, async (req, res) => {
    try {
        await Catch.findOneAndUpdate({ '_id': req.params.catchid }, req.body.post);
        req.flash('success', 'Successfully updated catch.');
        return res.redirect(`/catch/${req.params.catchid}`);
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');
    }
});

// Delete Catch
app.delete('/locations/:id/catch/:catchid', isUserPost, async (req, res) => {
    try {
        const deletedPost = await Catch.findOneAndDelete({ '_id': req.params.catchid });
        console.log(deletedPost);
        const updatedLocation = await Location.findOneAndUpdate({ '_id': req.params.id }, { '$pull': { '$elemMatch': { 'catches': deletedPost._id }}});
        console.log(updatedLocation);

        req.flash('success', 'Your catch has been deleted.');
        return res.redirect('back');
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');    
    }
});

// Register an account FORM
app.get("/register", (req, res) => {
    return res.render("register");
});

// Register Logic
app.post('/register', sentCaptcha, usernameToLowerCase, async (req, res) => {
    try {
        await User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password);
        passport.authenticate('local');
        req.flash('success', 'Welcome to FishingBakersfield!');
        return res.redirect('/locations');
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back');  
    }
});


// Admin Panel
app.get('/admin', isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        return res.render('admin', { users });
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back'); 
    }
});

// Terms
app.get('/terms', (req, res) => {
	return res.render('terms');
});

// Login FORM ONLY
app.get('/login', (req, res) => {
    return res.render('login');
});

// Login Logic (NOT FORM)
app.post('/login', usernameToLowerCase, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
    }),
    function(req, res){
 });

 // Logout
 app.get('/logout', (req, res) => {
     req.logout();
     req.flash("success", "You've been logged out. Come back soon!");
     res.redirect("back");
 });

// New Catch FORM ONLY
app.get('/locations/:id/catch/new', isLoggedIn, async (req, res) => {
    try {
        const location = await Location.findOne({ '_id': req.params.id });
        return res.render('newcatch', { location });
    } catch (error) {
        req.flash('error', error.toString());
        return res.redirect('back'); 
    }
});

// Catch Post LOGIC
app.post("/locations/:id/catch", isLoggedIn, function(req, res){
    Location.findById(req.params.id, function(err, location){
        if(err){
            console.log(err);
            res.redirect("/locations");
        } else {
            upload(req, res, function(err){
                if(err){
                    return res.end("Upload unsuccessful");
                }
        var catchlocation = req.body.catchlocation;
        var catchlocationid = req.body.catchlocationid;
        var species = req.body.species;
        var image = '/uploads/' + req.file.filename;
        var weight = req.body.weight;
        var description = req.body.description;
        var addCatch = {species: species, image: image, weight: weight, description: description, catchlocation: catchlocation, catchlocationid: catchlocationid};

        Catch.create(addCatch, function(err, post){
            if(err){
                res.redirect("locations/:id/catch/new");
            } else {
                post.author.id = req.user._id;
                post.author.username = req.user.username;
                post.save();
                location.catches.push(post);
                location.save();
                req.flash('success', 'Your catch has been added. Thank you!');
                res.redirect("/locations/" + location._id + "/catches/");
            }
        });
            });
        }
    });
});

// Resources
app.get("/resources", function(req, res){
	res.render("resources");
});

app.get("/howdeepistruxtunlake", function(req, res){
  res.render("truxtundepth");
});

// Delete User
app.delete("/users/:userId", isAdmin, function(req, res){
    User.findByIdAndRemove(req.params.userId, function(err, post){
        if(err){
            req.flash("error", err.toString());
            res.redirect("back");
        }
        req.flash("success", "User has been deleted.");
        res.redirect("back");
    });
});

// Not found page - KEEP LAST
app.get("*", function(req, res){
    res.render("notfound");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/login");
}

function usernameToLowerCase(req, res, next){
            req.body.username = req.body.username.toLowerCase();
            next();
}


function isUserPost(req, res, next){
    if(req.isAuthenticated()){
       Catch.findById(req.params.catchid, function(err, foundPost){
           if(err){
               res.redirect("back");
           } else {
               if(foundPost.author.id.equals(req.user._id) || req.user.isAdmin){
                   next();
               } else {
                   req.flash("error", "You can't edit other angler's catches.");
                   res.redirect("back");
               }
           }
       });
    } else {
        res.redirect("back");
    }
}

function isAdmin(req, res, next){
    if(!req.user){
        req.flash("error", "You must be an admin to access this page.");
        return res.redirect("/login");   
    }

    if(req.user.isAdmin){
        next();
    } else {
        req.flash("error", "You must be an admin to access this page.");
        return res.redirect("back");
    }
}

app.set('port',  (process.env.PORT || 5000));

app.listen(5000, function(){
   console.log(`fB is now running in ${process.env.NODE_ENV}!`);
});
