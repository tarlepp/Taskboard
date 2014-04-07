/**
 * UserController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
"use strict";

var async = require("async");
var moment = require("moment-timezone");
var languages = require("./../../config/i18n.js");

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to UserController)
     */
    _config: {},

    /**
     * User add action. This will render a new user add GUI.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    add: function(request, response) {
        response.view({
            languages: languages.i18n.locales,
            timezones: DateService.getTimezones()
        });
    },

    /**
     * User edit action. This will render a user edit GUI.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    edit: function(request, response) {
        var userId = request.param("id");

        // Fetch user data
        DataService.getUser(userId, function(error, user) {
            if (error) {
                ResponseService.makeError(error, request, response);
            } else {
                response.view({
                    user: user,
                    languages: languages.i18n.locales,
                    timezones: DateService.getTimezones()
                });
            }
        });
    },

    /**
     * User list action. This will render a GUI where all users are shown in list.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    list: function(request, response) {
        async.waterfall(
            [
                // Fetch users
                function(callback) {
                    DataService.getUsers({}, callback);
                },

                // Fetch last logins for users
                function(users, callback) {
                    fetchLastSignIn(users, callback);
                }
            ],

            /**
             * Main callback function which is called after all waterfall jobs are processed
             * or an error occurred on those.
             *
             * @param   {null|Error}            error
             * @param   {sails.model.user[]}    users
             */
            function(error, users) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.view({
                        users: users
                    });
                }
            }
        );

        /**
         * Private function to fetch last sign in data for each user.
         *
         * @param   {sails.model.user[]}    users
         * @param   {Function}              next
         */
        function fetchLastSignIn(users, next) {
            // Map users
            async.map(
                users,

                /**
                 * Iterator function which is called with every user object in input array.
                 * Function will fetch last sign in information of current user.
                 *
                 * @param   {sails.model.user}  user        User object
                 * @param   {Function}          callback    Callback function to call after job is finished
                 */
                function(user, callback) {
                    // Fetch user last sign in record
                    UserLogin
                        .findOne({
                            userId: user.id
                        })
                        .sort("stamp DESC")
                        .limit(1)
                        .done(function(error, loginData) {
                            if (error) {
                                callback(error, null);
                            } else {
                                // Add last login to user data
                                user.lastLogin = (!loginData) ? null : loginData.stamp;

                                if (user.lastLogin !== null) {
                                    moment.lang(request.user.language);

                                    user.lastLogin = DateService.convertDateObjectToUtc(user.lastLogin);
                                    user.lastLogin.tz(request.user.momentTimezone);
                                }

                                callback(null, user);
                            }
                        });
                },

                /**
                 * Callback function which is called after all users have been processed with iterator
                 * function.
                 *
                 * @param   {null|Error}            error   Error object
                 * @param   {sails.model.user[]}    users   User objects extended by 'lastLogin' information
                 */
                function(error, users) {
                    next(error, users);
                }
            );
        }
    },

    /**
     * User sign in history action. This will render a GUI where is shown specified user sign in
     * history data. This data contains
     *
     * @param   {Request}   request Request object
     * @param   {Response}  response Response object
     */
    history: function(request, response) {
        var userId = request.param("id");

        // Make parallel jobs for history action
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

            /**
             * Callback function which is called after all parallel jobs have been processed.
             *
             * @param   {Error} error   Error object
             * @param   {{}}    data    Object that contains 'user' and 'history' data
             */
            function (error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    moment.lang(request.user.language);

                    // Iterate sign in rows and make formatted stamp
                    _.each(data.history, function(row) {
                        row.stamp = DateService.convertDateObjectToUtc(row.stamp);
                        row.stamp.tz(request.user.momentTimezone);
                    });

                    // Group sign in data by IP addresses
                    data.ipData = _.groupBy(data.history, function(row) {
                        return row.ip;
                    });

                    // Group sign in data by user agents
                    data.agentData = _.groupBy(data.history, function(row) {
                        return row.agent;
                    });

                    response.view(data);
                }
            }
        );
    },

    /**
     * User projects action. Basically this action will show all projects that current user
     * is affected to in some role.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    projects: function(request, response) {
        var userId = request.param("id");

        // Make parallel jobs for 'projects' action
        async.parallel(
            {
                // Fetch single user data
                user: function(callback) {
                    DataService.getUser(userId, callback);
                },

                // Fetch project data
                projects: function(callback) {
                    DataService.getProjects({}, callback);
                }
            },

            /**
             * Callback function which is called after all parallel jobs have been processed.
             *
             * @param   {null|Error}    error   Error object
             * @param   {{
             *              user: sails.model.user,
             *              projects: sails.model.project[]
             *          }}              data    Object that contains 'user' and 'projects' data
             */
            function (error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    filterOutInvalidProjects(data);
                }
            }
        );

        /**
         * Private function to filter out projects that current user has no access to.
         *
         * @param   {{}}    data
         */
        function filterOutInvalidProjects(data) {
            moment.lang(request.user.language);

            async.filter(
                data.projects,

                /**
                 * Iterator function which will filter out projects that current user has no access.
                 *
                 * @param   {sails.model.project}   project     Project object
                 * @param   {Function}              callback    Callback function to call after project is processed
                 */
                function(project, callback) {
                    AuthService.hasProjectAccess(data.user, project.id, function(error, role) {
                        if (role !== false) {
                            project.role = role;
                            project.roleText = "Unknown";

                            project.dateStart = DateService.convertDateObjectToUtc(project.dateStart);
                            project.dateStart.tz(request.user.momentTimezone);

                            project.dateEnd = DateService.convertDateObjectToUtc(project.dateEnd);
                            project.dateEnd.tz(request.user.momentTimezone);

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

                /**
                 * Callback function which is called after all projects have been processed by
                 * specified iterator function.
                 *
                 * @param   {sails.model.project[]} projects    Project objects extended by role
                 */
                function(projects) {
                    data.projects = projects;

                    response.view(data);
                }
            );
        }
    },

    /**
     * User password change action.
     *
     * todo add support for admin users to change anyone password
     *
     * @param   {Request}   request Request object
     * @param   {Response}  response Response object
     */
    changePassword: function(request, response) {
        var userId = request.param("userId");
        var passwordCurrent = request.param("passwordCurrent");
        var passwordNew = request.param("password");
        var passwordReType = request.param("passwordReType");

        if (passwordNew !== passwordReType) {
            response.send(400, "Given passwords doesn't match.");
        } else if (passwordNew.length < 10) {
            response.send(400, "Given new password is too short.");
        } else if (passwordCurrent.length < 10) {
            response.send(400, "Given current password is too short.");
        } else {
            // Get user object
            DataService.getUser(userId, function(error, user) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else if (!user.validPassword(passwordCurrent)) {
                    response.send(400, "Given current password value doesn't match.");
                } else {
                    // Set new password value for user
                    user.password = passwordNew;

                    user.save(function(error) {
                        if (error) {
                            ResponseService.makeError(error, request, response);
                        } else {
                            response.json(true);
                        }
                    });
                }
            });
        }
    }
};
