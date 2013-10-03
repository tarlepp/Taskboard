// api/policies/authenticated.js

// We use passport to determine if we're authenticated
module.exports = function(req, res, next) {
    // All is ok, continue
    if (req.isAuthenticated()) {
        return next();
    }

    // User not authenticated => login
    res.redirect('/login');
};
