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
    },

    /**
     * User projects action. Basically this action will show all projects that current user
     * is affected to in some role.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    projects: function(req, res) {
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
                projects: function(callback) {
                    DataService.getProjects({}, callback);
                }
            },
            function (error, data) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    async.filter(
                        data.projects,
                        function(project, callback) {
                            AuthService.hasProjectAccess(data.user, project.id, function(error, role) {
                                if (role !== false) {
                                    project.role = role;
                                    project.roleText = "Unknown";

                                    switch (project.role) {
                                        case -3:
                                            project.roleText = "Administrator";
                                            break;
                                        case -2:
                                            project.roleText = "Manager (Primary)";
                                            break;
                                        case -1:
                                            project.roleText = "Manager";
                                            break;
                                        case 0:
                                            project.roleText = "Viewer";
                                            break;
                                        case 1:
                                            project.roleText = "User";
                                            break;
                                    }

                                    callback(true);
                                } else {
                                    callback(false);
                                }
                            }, true);
                        },
                        function(projects) {
                            data.projects = projects;
                            data.moment = moment;
                            data.currentUser = req.user;
                            data.layout = "layout_ajax";

                            res.view(data);
                        }
                    );
                }
            }
        );
    }
};
