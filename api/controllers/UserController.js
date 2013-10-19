/**
 * UserController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var async = require("async");
var moment = require("moment-timezone");

module.exports = {
    /**
     * User list action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    list: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

        // Fetch user data
        User
            .find()
            .sort("lastName ASC")
            .sort("firstName ASC")
            .sort("username ASC")
            .done(function(error, users) {
                if (error) {
                    res.send(error, 500);
                } else {
                    res.view({
                        layout: "layout_ajax",
                        users: users
                    });
                }
            });
    },

    /**
     * User add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

        res.view({
            layout: "layout_ajax"
        });
    },

    /**
     * User edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

        var userId = req.param("id");

        // Fetch user data
        User
            .findOne(userId)
            .done(function(error, user) {
                if (error) {
                    res.send(error, 500);
                } else if (!user) {
                    res.send("User not found.", 404);
                } else {
                    res.view({
                        user: user,
                        layout: "layout_ajax"
                    });
                }
            });
    },

    /**
     * User sign in history action.
     *
     * @todo    refactor timestamp to be current user timezone, this needs some thinking...
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    history: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

        var userId = req.param("id");

        async.parallel(
            {
                // Fetch single user data
                user: function(callback) {
                    DataService.getUser(userId, callback);
                },

                // Fetch user sign in data
                history: function(callback) {
                    DataService.getUserSignInData(userId, callback);
                }
            },
            function (error, data) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.layout = "layout_ajax";

                    // Iterate sign in rows and make formatted stamp
                    _.each(data.history, function(row) {
                        var stamp = moment(row.stamp);

                        row.stampFormatted = stamp.format('YYYY-MM-DD HH:mm:ss');
                    });

                    res.view(data);
                }
            }
        );
    }
};
