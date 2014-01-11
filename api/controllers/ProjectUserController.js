/**
 * ProjectUserController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
var async = require("async");

module.exports = {
    /**
     * This actions makes view for project users. Note that 'projectId' parameter is
     * required for this action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    users: function(req, res) {
        var projectId = req.param("projectId");
        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
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
                    AuthService.hasProjectAccess(req.user, projectId, callback, true);
                }
            },

            /**
             * Callback function that is called after all parallel jobs are done
             * or some error has happen in those
             *
             * @param   {Error} error   Error data
             * @param   {{}}    results Object that contains following data:
             *                           - project {sails.model.project}
             *                           - role, User role in current project
             */
            function callback(error, results) {
                if (error) {
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    data.project = results.project;
                    data.role = results.role;

                    fetchProjectUsers();
                }
            }
        );

        /**
         * Function to fetch project user data. Also note that this will add selected
         * project manager to this user list.
         *
         * todo:    potential bug for duplicate user, eg user is attached to project
         *          and afterwards this same user has been selected to project manager.
         *
         *          This is not a big deal yet, but remember to handle this :D
         *
         *          Life cycle callbacks should handle this.
         */
        function fetchProjectUsers() {
            // Fetch all project user
            ProjectUser
                .find()
                .where({projectId: projectId})
                .exec(function(error, /** sails.json.projectUser */projectUsers) {
                    if (error) {
                        res.send(error.status ? error.status : 500, error.message ? error.message : error);
                    } else {
                        data.users = projectUsers;

                        // Add project main manager to project users data
                        projectUsers.push({
                            projectId: data.project.id,
                            userId: data.project.managerId,
                            role: -1,
                            main: 1
                        });

                        // Fetch administrator users, excluding the main admin
                        User
                            .find()
                            .where({
                                admin: true,
                                username: {"!": "admin"}
                            })
                            .exec(function(error, admins) {
                                _.each(admins, function(admin) {
                                    var founded = _.find(data.users, function(user) { return user.userId === admin.id; });

                                    if (founded) {
                                        founded.admin = true;
                                    } else {
                                        projectUsers.push({
                                            projectId: data.project.id,
                                            userId: admin.id,
                                            role: -1,
                                            main: 0,
                                            admin: true
                                        });
                                    }
                                });

                                // Fetch detailed user data
                                fetchUserData();
                            });
                    }
                });
        }

        /**
         * Function to fetch detailed user data from database.
         */
        function fetchUserData() {
            async.map(
                data.users,

                /**
                 * Iterator function which is called on every user in data.users variable.
                 *
                 * @param   {sails.model.projectUser}   projectUser
                 * @param   {Function}                  callback
                 */
                function(projectUser, callback) {
                    DataService.getUser(projectUser.userId, function(error, user) {
                        if (error) {
                            callback(error, null);
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
                    });
                },

                /**
                 * Main callback function which is called after all project users have
                 * been mapped via async.js.
                 *
                 * @param   {Error|null}        error
                 * @param   {sails.model.user}  results
                 */
                function(error, results) {
                    if (error) {
                        res.send(error.status ? error.status : 500, error.message ? error.message : error);
                    } else {
                        data.users = _.sortBy(results, function(user) {
                            return [user.fullName(), user.username].join("|");
                        });

                        res.view(data);
                    }
                }
            );
        }
    },

    /**
     * This actions fetches available users for specified project. These users can be
     * attached to specified project.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    availableUsers: function(req, res) {
        var projectId = parseInt(req.param("projectId"), 10);
        var userIds = [];

        // Fetch project data
        Project
            .findOne(projectId)
            .done(function(error, project) {
                if (error) {
                    res.send(error, 500);
                } else if (!project) {
                    res.send("Project not found.", 404);
                } else {
                    // Add project manager to "used" users
                    userIds.push({id: {"!": project.managerId}});

                    // Fetch current attached users
                    fetchCurrentUsers();
                }
            });

        /**
         * Private function to fetch all users who are already attached
         * to specified project.
         */
        function fetchCurrentUsers() {
            ProjectUser
                .find()
                .where({projectId: projectId})
                .done(function(error, users) {
                    if (error) {
                        res.send(error, 500);
                    } else {
                        // Iterate users and add those to "used" users
                        _.each(users, function(projectUser) {
                            userIds.push({id: {"!": projectUser.userId}});
                        });

                        // And finally fetch available users
                        fetchAvailableUsers();
                    }
                });
        }

        /**
         * Private function to fetch all available users for
         * specified project.
         */
        function fetchAvailableUsers() {
            User
                .find()
                .where({
                    and: userIds,
                    admin: 0
                })
                .done(function(error, users) {
                    if (error) {
                        res.send(error, 500);
                    } else {
                        res.json(users);
                    }
                });
        }
    },

    /**
     * This actions fetches available users for specified project. These users can be
     * attached to specified project.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    ownProjects: function(req, res) {
        var projectIds = [];

        // Make parallel call
        async.parallel([
            /**
             * First fetch all projects where current user is a contributor in
             * some role.
             *
             * @param   {Function}  callback
             */
            function(callback) {
                ProjectUser
                    .find()
                    .where({
                        userId: req.user.id
                    })
                    .done(function(error, /** sails.json.projectUser[] */projectUsers) {
                        if (error) {
                            return callback(error)
                        } else {
                            _.each(projectUsers, function(/** sails.json.projectUser */projectUser) {
                                projectIds.push({id: projectUser.projectId})
                            });

                            callback();
                        }
                    });
            },

            /**
             * Then fetch project id(s) where current user is a primary manager.
             *
             * @param   {Function}  callback
             */
            function(callback) {
                Project
                    .find()
                    .where({
                        managerId: req.user.id
                    })
                    .done(function(error, /** sails.json.project[] */projects) {
                        if (error) {
                            return callback(error)
                        } else {
                            _.each(projects, function(/** sails.json.project */project) {
                                projectIds.push({id: project.id})
                            });

                            callback();
                        }
                    });
            }
        ],
            /**
             * Callback function which is called when all parallel jobs are processed.
             *
             * @param error
             */
            function(error) {
                if (error) {
                    res.send(error, 500);
                }

                var where = null;

                // Admin user has all projects
                if (req.user.admin) {
                    where = {};
                } else if (projectIds.length > 0) { // Current user has "some" project(s)
                    where = {
                        or: projectIds
                    };
                } else { // Otherwise just send empty data
                    res.json([]);
                }

                // Fetch project data
                Project
                    .find()
                    .where(where)
                    .done(function(error, /** sails.json.project[] */projects) {
                        if (error) {
                            res.send(error, 500);
                        } else {
                            res.json(projects);
                        }
                    });
            }
        );
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
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     *
     * @constructor
     */
    getRole: function(req, res) {
        var projectId = parseInt(req.param("projectId"), 10);

        // Admin user, always return -3
        if (req.user.admin) {
            res.json(200, -3);
        } else { // Otherwise fetch user role
            async.parallel(
                {
                    /**
                     * Function to fetch possible Project object for signed in user and
                     * specified project. User must be project manager.
                     *
                     * Note that this query may return undefined.
                     *
                     * @param   {Function}  callback
                     */
                    primary: function(callback) {
                        Project
                            .findOne({
                                id: projectId,
                                managerId: req.user.id
                            })
                            .done(function(error, /** sails.model.project */project) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    callback(null, project)
                                }
                            });
                    },

                    /**
                     * Function to fetch possible ProjectUser object for signed in user
                     * and specified project.
                     *
                     * Note that this query may return undefined.
                     *
                     * @param   {Function}  callback
                     */
                    contributor: function(callback) {
                        ProjectUser
                            .findOne({
                                projectId: projectId,
                                userId: req.user.id
                            })
                            .done(function(error, /** sails.model.projectUser */projectUser) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    callback(null, projectUser)
                                }
                            });
                    }
                },

                /**
                 * Callback function which is been called after all parallel jobs are
                 * processed.
                 *
                 * @param   {Error} error
                 * @param   {{}}    results
                 */
                function(error, results) {
                    var output = false;

                    if (results.primary) {
                        output = -2;
                    } else if (results.contributor) {
                        output = results.contributor.role;
                    }

                    res.json(200, output);
                }
            );
        }
    }
};
