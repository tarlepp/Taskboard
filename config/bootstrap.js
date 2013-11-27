/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
module.exports.bootstrap = function(cb) {
    var passport = require("passport");
    var LocalStrategy = require("passport-local").Strategy;
    var initialize = passport.initialize();
    var session = passport.session();
    var http = require("http");
    var methods = ["login", "logIn", "logout", "logOut", "isAuthenticated", "isUnauthenticated"];

    /**
     * Following is to fix socket request on authenticated users.
     *
     * Thanks to: http://stackoverflow.com/questions/17365444/sails-js-passport-js-authentication-through-websockets/18343226#18343226
     */
    sails.removeAllListeners('router:request');

    sails.on('router:request', function(req, res) {
        initialize(req, res, function() {
            session(req, res, function(err) {
                if (err) {
                    return sails.config[500](500, req, res);
                }

                for (var i = 0; i < methods.length; i++) {
                    req[methods[i]] = http.IncomingMessage.prototype[methods[i]].bind(req);
                }

                sails.router.route(req, res);
            });
        });
    });

    /**
     * Passport session setup.
     *
     * To support persistent login sessions, Passport needs to be able to
     * serialize users into and deserialize users out of the session. Typically,
     * this will be as simple as storing the user ID when serializing, and finding
     * the user by ID when deserializing.
     *
     * @param   {sails.model.user}  user
     * @param   {Function}          done
     */
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    /**
     * User deserialize method.
     *
     * @param   {Number}    id
     * @param   {Function}  done
     */
    passport.deserializeUser(function(id, done) {
        User
            .findOne(id)
            .done(function(err, user) {
                done(err, user);
            });
    });

    /*
     * Use the LocalStrategy within Passport.
     *
     * Strategies in passport require a `verify` function, which accept
     * credentials (in this case, a username and password), and invoke a callback
     * with a user object. In the real world, this would query a database;
     * however, in this example we are using a baked-in set of users.
     */
     passport.use(new LocalStrategy(
         /**
          * Constructor function for LocalStrategy. Basically this just try to find
          * specified user and validate user password if user is found.
          *
          * @param  {String}    username
          * @param  {String}    password
          * @param  {Function}  done
          */
        function(username, password, done) {
            /**
             * Find the user by username. If there is no user with the given
             * username, or the password is not correct, set the user to `false` to
             * indicate failure and set a flash message. Otherwise, return the
             * authenticated `user`.
             */
            User
                .findOne({username: username})
                .done(function(err, user) {
                    if (err) {
                        return done(err);
                    }

                    // User not found
                    if (!user) {
                        return done(null, false, { message: 'Unknown user ' + username });
                    }

                    // Password does not match
                    if (!user.validPassword(password)) {
                        return done(null, false, { message: 'Invalid password' });
                    }

                    // Otherwise all is ok, user is valid
                    return done(null, user);
                });
        }
    ));

    /**
     * It's very important to trigger this callback method when you are finished with the bootstrap!
     * (otherwise your server will never lift, since it's waiting on the bootstrap)
     */
    cb();
};