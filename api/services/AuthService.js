/**
 * /api/services/AuthService.js
 *
 * Generic auth service, which is used to check .
 */
var async = require("async");

/**
 * Method checks if specified user has access to specified project or not.
 *
 * @param   {sails.req.user}    user        Signed in user object
 * @param   {Number}            projectId   Project id to check
 * @param   {Function}          next        Main callback function, which is called after checks
 */
exports.hasAccessToProject = function(user, projectId, next) {
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

            next(error, output);
        }
    );
};

/**
 * Method checks if specified user has access to specified sprint or not.
 *
 * @param   {sails.req.user}    user        Signed in user object
 * @param   {Number}            sprintId    Sprint id to check
 * @param   {Function}          next        Main callback function, which is called after checks
 */
exports.hasAccessToSprint = function(user, sprintId, next) {
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
                AuthService.hasAccessToProject(user, sprint.projectId, callback);
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