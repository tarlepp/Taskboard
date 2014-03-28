/**
 * ProjectUserController
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
var async = require("async");

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ProjectUserController)
     */
    _config: {},

    /**
     * This actions makes view for project users. Note that 'projectId' parameter is
     * required for this action.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    users: function(request, response) {
        var projectId = request.param("projectId");
        var data = {
            users: false,
            project: false,
            role: false
        };

        async.parallel(
            {
                // Fetch project data
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                // Fetch current user role in project
                role: function(callback) {
                    AuthService.hasProjectAccess(request.user, projectId, callback, true);
                },

                // Fetch project users
                projectUsers: function(callback) {
                    DataService.getProjectUsers({projectId: projectId}, callback);
                },

                // Fetch admin users
                adminUsers: function(callback) {
                    DataService.getUsers({ admin: true, username: {"!": "admin"} }, callback);
                },

                // Fetch all users
                users: function(callback) {
                    DataService.getUsers({}, callback);
                }
            },

            /**
             * Callback function that is called after all parallel jobs are done
             * or some error has happen in those
             *
             * @param   {null|Error}    error   Error data
             * @param   {{
             *              project: sails.model.project,
             *              role: sails.helper.role,
             *              projectUsers: sails.model.projectUser[],
             *              adminUsers: sails.model.user[],
             *              users: sails.model.user[]
             *          }}              results Object that contains all needed data
             */
            function callback(error, results) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    data.project = results.project;
                    data.role = results.role;

                    // Remove possible duplicate users and admin users
                    results.projectUsers = _.filter(results.projectUsers, function(projectUser) {
                        var founded = false;

                        if (projectUser.userId === results.project.managerId) {
                            founded = true;
                        } else {
                            var adminUser = _.find(results.adminUsers, function(adminUser) {
                                return adminUser.id === projectUser.userId;
                            });

                            if (adminUser) {
                                founded = true;
                            }
                        }

                        return !founded;
                    });

                    // Add real project main manager to user list
                    results.projectUsers.push({
                        projectId: results.project.id,
                        userId: results.project.managerId,
                        role: -1,
                        main: 1
                    });

                    // Add admin users
                    _.each(results.adminUsers, function(adminUser) {
                        var founded = _.find(results.projectUsers, function(projectUser) {
                            return projectUser.userId === adminUser.id;
                        });

                        if (!founded) {
                            results.projectUsers.push({
                                projectId: results.project.id,
                                userId: adminUser.id,
                                role: -1,
                                main: 0,
                                admin: true
                            });
                        }
                    });

                    determineUserData(results.projectUsers, results.users);
                }
            }
        );

        /**
         * Private function to determine project user data. This will combine project user and
         * user data objects for GUI.
         *
         * @param   {sails.model.projectUser[]} projectUsers
         * @param   {sails.model.user[]}        users
         */
        function determineUserData(projectUsers, users) {
            async.map(
                projectUsers,

                /**
                 * Iterator function to combine project user and main user data.
                 *
                 * @param   {sails.model.projectUser}   projectUser
                 * @param   {Function}                  callback
                 */
                function(projectUser, callback) {
                    var user = _.find(users, function(user) {
                        return user.id === projectUser.userId;
                    });

                    if (!user) {
                        callback("User not found, weird this should not happen...", null);
                    } else {
                        var roleText = "Unknown";

                        switch (projectUser.role) {
                            case -1:
                                roleText = "Manager";
                                break;
                            case 0:
                                roleText = "Viewer";
                                break;
                            case 1:
                                roleText = "User";
                                break;
                        }

                        projectUser.roleText = roleText;

                        user.projectUser = projectUser;

                        callback(null, user);
                    }
                },

                /**
                 * Main callback function which is called after all project users have been
                 * processed.
                 *
                 * @param   {null|Error}            error
                 * @param   {sails.model.user[]}    users
                 */
                function(error, users) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        data.users = users.sort(HelperService.dynamicSortMultiple("lastName", "firstName", "username"));

                        response.view(data);
                    }
                }
            );
        }
    },

    /**
     * This actions fetches available users for specified project. These users can be
     * attached to specified project.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    availableUsers: function(request, response) {
        var projectId = parseInt(request.param("projectId"), 10);

        async.parallel(
            {
                // Fetch project data
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                // Fetch current project users
                projectUsers: function(callback) {
                    DataService.getProjectUsers({projectId: projectId}, callback);
                }
            },

            /**
             * Main callback function which is called after all parallel jobs are done.
             *
             * @param   {null|Error}    error
             * @param   {{
             *              project: sails.model.project,
             *              projectUsers: sails.model.projectUser[]
             *          }}              results
             */
            function (error, results) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    fetchAvailableUsers(results);
                }
            }
        );

        /**
         * Private function to fetch available users for this project. Available users are not
         * yet attached to this project nor user is administrator user. Administrator users have
         * always access to projects.
         *
         * @param   {{
         *              project: sails.model.project,
         *              projectUsers: sails.model.projectUser[]
         *          }}  data
         */
        function fetchAvailableUsers(data) {
            var userIds = _.map(data.projectUsers, function(user) {
                return {id: {"!": user.userId}};
            });

            userIds.push({id: {"!": data.project.managerId}});

            var where = {
                and: userIds,
                admin: 0
            };

            // Fetch available users
            DataService.getUsers(where, function(error, users) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.json(200, users);
                }
            });
        }
    },

    /**
     * This actions fetches available users for specified project. These users can be
     * attached to specified project.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    ownProjects: function(request, response) {
        async.waterfall(
            [
                // Fetch project user data
                function(callback) {
                    DataService.getProjectUsers({userId: request.user.id}, callback)
                },

                // Map project user data
                function(projectUsers, callback) {
                    var projectIds = _.map(projectUsers, function(projectUser) {
                        return {id: projectUser.projectId};
                    });

                    callback(null, projectIds);
                }
            ],

            /**
             * Main callback function which is called after all waterfall jobs are done.
             *
             * @param   {null|Error}    error       Possible error
             * @param   {{}}            conditions  Project conditions
             */
            function(error, conditions) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    fetchProjects(conditions);
                }
            }
        );

        /**
         * Private function to fetch project data where current user is in some role. Note
         * that administrator users have all access to all projects.
         *
         * @param   {{id: {Number}}[]}  conditions  Project ids as an array of objects
         */
        function fetchProjects(conditions) {
            var where = {};

            // Administrator user has access to all projects
            if (!request.user.admin) {
                // Add project manager condition
                conditions.push({
                    managerId: request.user.id
                });

                where = {
                    or: conditions
                };
            }

            // Fetch project data
            DataService.getProjects(where, function(error, projects) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.json(200, projects);
                }
            });
        }
    },

    /**
     * Method returns user role in specified project. Successfully output is always
     * json which contains user role:
     *
     *  -3 = User is administrator
     *  -2 = Project manager (primary)
     *  -1 = Project manager
     *   0 = Only view rights
     *   1 = Normal user
     *
     * false if nothing matches.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     *
     * @constructor
     */
    getRole: function(request, response) {
        var projectId = parseInt(request.param("projectId"), 10);

        // Admin user, always return -3
        if (request.user.admin) {
            response.json(200, -3);
        } else { // Otherwise fetch user role
            async.parallel(
                {
                    /**
                     * Function to fetch possible Project object for signed in user and
                     * specified project. User must be project manager.
                     *
                     * @param   {Function}  callback
                     */
                    primary: function(callback) {
                        DataService.getProject({id: projectId, managerId: request.user.id}, callback);
                    },

                    /**
                     * Function to fetch possible ProjectUser object for signed in user
                     * and specified project.
                     *
                     * @param   {Function}  callback
                     */
                    contributor: function(callback) {
                        DataService.getProjectUser({projectId: projectId, userId: request.user.id}, callback);
                    }
                },

                /**
                 * Callback function which is been called after all parallel jobs are processed.
                 *
                 * @param   {null|Error}    error   Possible error.
                 * @param   {{
                 *              primary: sails.model.project
                 *              contributor: sails.model.projectUser
                 *          }}              results Fetched data as an object
                 */
                function(error, results) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        var output = false;

                        if (results.primary) {
                            output = -2;
                        } else if (results.contributor) {
                            output = results.contributor.role;
                        }

                        response.json(200, output);
                    }
                }
            );
        }
    }
};
