/**
 * /api/services/AuthService.js
 *
 * Generic auth service, which is used to check .
 */
var async = require("async");

/**
 * Method checks if specified user has access to specified project or not.
 *
 * @param   {User}      user      Signed in user id
 * @param   {Number}    projectId   Project id to check
 */
exports.hasAccessToProject = function(user, projectId, next) {
    // Admin user, always true
    if (user.admin) {
        next(null, true);
    } else { // Otherwise fetch user role
        async.parallel({
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
                            managerId: user.id
                        })
                        .done(function(error, /** sails.json.project */project) {
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
                            userId: user.id
                        })
                        .done(function(error, /** sails.json.projectUser */projectUser) {
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
             * @param   {{}}    error
             * @param   {{}}    results
             */
            function(error, results) {
                var output = false;

                if (results.primary || results.contributor) {
                    output = true
                }

                next(error, output);
            }
        );
    }
};