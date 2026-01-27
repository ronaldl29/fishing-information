module.exports.usernameToLowerCase = (req, res, next) => {
    if(req.body.username){
        req.body.username = req.body.username.toLowerCase();
    }
    next();
}

module.exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You must be logged in.');
    res.redirect('/login');
}

module.exports.isAdmin = (req, res, next) => {
    if(req.user.isAdmin){
        return next();
    } else {
        req.flash('error', 'You must be an admin to access this URL.');
        res.redirect('back');
    }
}