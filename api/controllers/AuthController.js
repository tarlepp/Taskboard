/**
 * AuthController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
var passport = require('passport');

module.exports = {
    index: function(req, res) {
        var error = req.param("error");

        console.log(error);

        res.view({
            layout: "layout_login",
            error: error
        });
    },

    create: function(req, res) {
        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)) {
                res.redirect("/login?error=true");
                return;
            }

            req.logIn(user, function(err) {
                if (err) {
                    res.view({
                        layout: "layout_login"
                    });
                } else {
                    res.redirect('/');
                }
            });
        })(req, res);
    },

    logout: function(req, res) {
        req.logout();
        res.redirect('/');
    }
};
