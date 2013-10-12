/**
 * /api/services/AuthService.js
 *
 * Generic auth service, which is used to check .
 */
var async = require("async");

/**
 * Method checks if specified user has access to specified project or not. By default method calls
 * specified callback with simple true/false value but optionally method calls callback with user
 * role value in specified project, Possible roles are following:
 *
 *  -3  = Administrator
 *  -2  = Project manager primary
 *  -1  = Project manager (contributor)
 *   0  = Viewer
 *   1  = User
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            projectId       Project id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 * @param   {Boolean}           [returnRole]    Return role in callback not just boolean value
 */
exports.hasProjectAccess = function(user, projectId, next, returnRole) {
    returnRole = returnRole || false;

    /**
     * Make parallel jobs to determine if user has access to specified project or not.
     *
     *  1)  Fetch project data (check that project exists)
     *  2)  Fetch project primary manager data (project id + current user id)
     *  3)  Fetch project contributor data (project id + current user id)
     *
     * In other words we need basically check if user is
     *
     *  a) primary project manager
     *  b) attached to project in some role
     *
     * If current user is either of these provided next callback is called by false.
     *
     * Note that administrator users have always access to all existing projects.
     */
    async.parallel(
        {
            /**
             * Check that specified project exists.
             *
             * @param   {Function}  callback
             */
            project: function(callback) {
                DataService.getProject(projectId, callback);
            },

            /**
             * Function to fetch possible Project object for signed in user and specified project.
             * User must be project manager.
             *
             * Note that this query may return undefined.
             *
             * @param   {Function}  callback
             */
            primary: function(callback) {
                Project
                    .findOne({
                        id: projectId,
                        managerId: user.id
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
             * Function to fetch possible ProjectUser object for signed in user and specified project.
             *
             * Note that this query may return undefined.
             *
             * @param   {Function}  callback
             */
            contributor: function(callback) {
                ProjectUser
                    .findOne({
                        projectId: projectId,
                        userId: user.id
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
         * Callback function which is been called after all parallel jobs are processed.
         *
         * @param   {Error|string}  error
         * @param   {{}}            results
         */
        function(error, results) {
            var output = false;

            // User is administrator, primary project manager or contributor in project
            if (user.admin || results.primary || results.contributor) {
                output = true
            }

            // We want to return role
            if (returnRole && output) {
                if (user.admin) {
                    output = -3;
                } else if (results.primary) {
                    output = -2;
                } else {
                    output = results.contributor.role;
                }
            }

            next(error, output);
        }
    );
};

/**
 * Method checks if specified user has update access to specified project or not.
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            projectId       Project id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 */
exports.hasProjectUpdate = function(user, projectId, next) {
    /**
     * Get user role in specified project with main right service method. User has
     * update rights to project if he/she is at least project manager. Basically
     * following roles grants user update right to project:
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     *  -1  = Project manager (contributor)
     */
    AuthService.hasProjectAccess(user, projectId, function(error, role) {
        var output = false;

        if (role !== false && role < 0) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has destroy access to specified project or not.
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            projectId       Project id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 */
exports.hasProjectDestroy = function(user, projectId, next) {
    /**
     * Get user role in specified project with main right service method. User has
     * destroy rights to project if he/she is at least project manager (primary).
     * Basically following roles grants user destroy right to project:
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     */
    AuthService.hasProjectAccess(user, projectId, function(error, role) {
        var output = false;

        if (role !== false && role < -1) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has access to specified sprint or not.
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            sprintId        Sprint id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 * @param   {Boolean}           [returnRole]    Return role in callback not just boolean value
 */
exports.hasSprintAccess = function(user, sprintId, next, returnRole) {
    returnRole = returnRole || false;

    /**
     * Make waterfall jobs to check if user has access to specified sprint or not:
     *
     *  1)  Fetch sprint data (check that sprint exists)
     *  2)  Call AuthService.hasAccessToProject to check actual project right
     *
     * After these jobs call specified callback function with result data.
     */
    async.waterfall(
        [
            /**
             * Check that sprint exists.
             *
             * @param   {Function}  callback
             */
            function(callback) {
                DataService.getSprint(sprintId, callback);
            },

            /**
             * Check that user has access to sprint project.
             *
             * @param   {sails.model.sprint}    sprint      Sprint data
             * @param   {Function}              callback
             */
            function(sprint, callback) {
                AuthService.hasProjectAccess(user, sprint.projectId, callback, returnRole);
            }
        ],

        /**
         * Callback function which is been called after all parallel jobs are processed.
         *
         * @param   {Error|String}  error
         * @param   {Boolean}       results
         */
        function(error, results) {
            next(error, results);
        }
    );
};

/**
 * Method checks if specified user has create access to sprints in specified project or not.
 * Note that this check is only based to given project id and nothing else.
 *
 * @param   {sails.req.user}    user        Signed in user object
 * @param   {Number}            projectId   Project id to check
 * @param   {Function}          next        Main callback function, which is called after checks
 */
exports.hasSprintCreate = function(user, projectId, next) {
    /**
     * Get user role in specified project with main right service method. User has
     * create rights to sprint if he/she is at least project manager on project.
     * Basically following roles grants user create new sprint, if user is project:
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     *  -1  = Project manager (contributor)
     */
    AuthService.hasProjectAccess(user, projectId, function(error, role) {
        var output = false;

        if (role !== false && role < 0) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has update access to specified sprint or not.
 *
 * @param   {sails.req.user}    user        Signed in user object
 * @param   {Number}            sprintId    Sprint id to check
 * @param   {Function}          next        Main callback function, which is called after checks
 */
exports.hasSprintUpdate = function(user, sprintId, next) {
    /**
     * Get user role in specified sprint project with main right service method. User has
     * update rights to sprint if he/she is at least project manager on sprint project.
     *
     * Basically following project roles grants user update right to sprint:
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     *  -1  = Project manager (contributor)
     */
    AuthService.hasSprintAccess(user, sprintId, function(error, role) {
        var output = false;

        if (role !== false && role < 0) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has destroy access to specified sprint or not.
 *
 * @param   {sails.req.user}    user        Signed in user object
 * @param   {Number}            sprintId    Sprint id to check
 * @param   {Function}          next        Main callback function, which is called after checks
 */
exports.hasSprintDestroy = function(user, sprintId, next) {
    /**
     * Get user role in specified sprint project with main right service method. User has
     * destroy rights to sprint if he/she is at least project manager (primary) at sprint
     * project.
     *
     * Basically following project roles grants user destroy right to sprint:
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     */
    AuthService.hasSprintAccess(user, sprintId, function(error, role) {
        var output = false;

        if (role !== false && role < -1) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has access to specified milestone or not.
 *
 * @param   {sails.req.user}    user        Signed in user object
 * @param   {Number}            milestoneId Milestone id to check
 * @param   {Function}          next        Main callback function, which is called after checks
 */
exports.hasAccessToMilestone = function(user, milestoneId, next) {
    /**
     * Make waterfall jobs to check if user has access to specified sprint or not:
     *
     *  1)  Fetch milestone data (check that milestone exists)
     *  2)  Call AuthService.hasAccessToProject to check actual project right
     *
     * After these jobs call specified callback function with result data.
     */
    async.waterfall(
        [
            /**
             * Check that sprint exists.
             *
             * @param   {Function}  callback
             */
            function(callback) {
                DataService.getMilestone(milestoneId, callback);
            },

            /**
             * Check that user has access to sprint project.
             *
             * @param   {sails.model.milestone} milestone   Milestone data
             * @param   {Function}              callback
             */
            function(milestone, callback) {
                AuthService.hasProjectAccess(user, milestone.projectId, callback);
            }
        ],

        /**
         * Callback function which is been called after all parallel jobs are processed.
         *
         * @param   {Error|String}  error
         * @param   {Boolean}       results
         */
        function(error, results) {
            next(error, results);
        }
    );
};