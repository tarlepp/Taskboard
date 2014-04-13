/**
 * /api/services/AuthService.js
 *
 * Generic auth service, which is used to check if user has access to asked object or which role
 * he / she is attached to that object.
 *
 * Basically all service methods uses finally either 'hasProjectAccess' or 'hasProjectAdmin' methods
 * to determine actual access to asked object.
 */
"use strict";

var async = require("async");
var randomstring = require("randomstring");

// Remember me tokens, that are valid for single server instance
var tokens = {};

/**
 * Service method to consume single user remember me token.
 *
 * @param   {String}    token   Token to consume
 * @param   {Function}  next    Callback function to return
 *
 * @returns {*}
 */
exports.consumeRememberMeToken = function(token, next) {
    var uid = tokens[token];

    // invalidate the single-use token
    delete tokens[token];

    return next(null, uid);
};

/**
 * Service method to save given user id to specified token.
 *
 * @param   {String}    token   Token to be save
 * @param   {Number}    uid     User id which is assigned to given token
 * @param   {Function}  next    Callback function
 *
 * @returns {*}
 */
exports.saveRememberMeToken = function(token, uid, next) {
    tokens[token] = uid;

    return next();
};

/**
 * Service method to issue new remember me token for specified user.
 *
 * @param   {sails.model.user}  user    User object
 * @param   {Function}          next    Callback function
 */
exports.issueToken = function(user, next) {
    var token = randomstring.generate(64);

    AuthService.saveRememberMeToken(token, user.id, function(error) {
        if (error) {
            return next(error);
        }

        return next(null, token);
    });
};

/**
 * Method checks if specified user has access to specified project or not. By default method calls
 * specified callback with simple true/false value but optionally method calls callback with user
 * role value in specified project, Possible roles are following:
 *
 *  -3      = Administrator
 *  -2      = Project manager primary
 *  -1      = Project manager (contributor)
 *   0      = Viewer
 *   1      = User
 *   false  = No access
 *
 * This is the main auth method that all other methods will use to determine if user has access or
 * not to specified object.
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
     *  1)  Fetch project data (check that project exists, this will contain also manager data)
     *  2)  Fetch project contributor data (project id + current user id)
     *
     * In other words we need basically make following checks:
     *
     *  a) project exists
     *  b) user is primary project manager
     *  c) user is attached to project in some role
     *
     * If current user is none of those provided callback function is called by false.
     *
     * Note that administrator users have always access to all existing projects.
     */
    async.parallel(
        {
            // Fetch project data, this is needed to check that project exists.
            project: function(callback) {
                DataService.getProject(projectId, callback);
            },

            // Fetch project user data for current project and user
            contributor: function(callback) {
                DataService.getProjectUser({projectId: projectId, userId: user.id}, callback, true);
            }
        },

        /**
         * Callback function which is been called after all parallel jobs are processed.
         *
         * @param   {null|Error}  error
         * @param   {{
         *              project: sails.model.project,
         *              contributor: sails.model.projectUser
         *          }}            data
         */
        function(error, data) {
            var output = false;

            if (!error) {
                // User is administrator, primary project manager or contributor in project
                if (user.admin || data.project.managerId === user.id || data.contributor) {
                    output = true
                }

                // We want to return role
                if (returnRole && output) {
                    if (user.admin) {
                        output = -3;
                    } else if (data.project.managerId === user.id) {
                        output = -2;
                    } else if (data.contributor) {
                        output = data.contributor.role;
                    } else {
                        output = false;
                    }
                }
            }

            next(error, output);
        }
    );
};

/**
 * Method checks if specified user has administrator access to specified project or not. This will
 * simply call 'hasProjectAccess' method to fetch user role in specified project.
 *
 * Specified callback function (next) is always called with two parameters: error (Error object)
 * and hasAdmin (boolean) values.
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            projectId       Project id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 */
exports.hasProjectAdmin = function(user, projectId, next) {
    /**
     * Get user role in specified project with main right service method. User
     * has administrator rights to project if he/she is at least project manager.
     * Basically following roles grants administrator right to project:
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     *  -1  = Project manager (contributor)
     */
    AuthService.hasProjectAccess(user, projectId, function(error, role) {
        var output = false;

        if (!error && role !== false && role < 0) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has access to specified sprint or not. Service method will simply call
 * 'hasProjectAccess' method after it is determined that sprint exists. Project id is a property of sprint
 * object which is passed to main determination method.
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
            // Fetch sprint data
            function(callback) {
                DataService.getSprint(sprintId, callback);
            },

            /**
             * Check that user has access to sprint project.
             *
             * @param   {sails.model.sprint}    sprint      Sprint data
             * @param   {Function}              callback    Callback function to call after job is done
             */
            function(sprint, callback) {
                AuthService.hasProjectAccess(user, sprint.projectId, callback, returnRole);
            }
        ],

        /**
         * Callback function which is been called after all parallel jobs are processed.
         *
         * @param   {null|Error}        error   Possible error
         * @param   {Boolean|Number}    result  Either boolean or role value (-3, -2, -1, 0, 1)
         */
        function(error, result) {
            next(error, result);
        }
    );
};

/**
 * Method checks if specified user has admin access to specified sprint or not. Actual check is done
 * via 'hasSprintAccess' method.
 *
 * Specified callback function (next) is always called with two parameters: error (Error object)
 * and hasAdmin (boolean) values.
 *
 * @param   {sails.req.user}    user        Signed in user object
 * @param   {Number}            sprintId    Sprint id to check
 * @param   {Function}          next        Main callback function, which is called after checks
 */
exports.hasSprintAdmin = function(user, sprintId, next) {
    /**
     * Get user role in specified sprint project with main right service method. User has
     * administrator rights to sprint if he/she is at least project manager on sprint project.
     *
     * Basically following project roles grants user update right to sprint:
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     *  -1  = Project manager (contributor)
     */
    AuthService.hasSprintAccess(user, sprintId, function(error, role) {
        var output = false;

        if (!error && role !== false && role < 0) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has access to specified milestone or not. Actual access check
 * is done via 'hasProjectAccess' method.
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            milestoneId     Milestone id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 * @param   {Boolean}           [returnRole]    Return role in callback not just boolean value
 */
exports.hasMilestoneAccess = function(user, milestoneId, next, returnRole) {
    returnRole = returnRole || false;

    /**
     * Make waterfall jobs to check if user has access to specified milestone or not:
     *
     *  1)  Fetch milestone data (check that milestone exists)
     *  2)  Call AuthService.hasAccessToProject to check actual project right
     *
     * After these jobs call specified callback function with result data.
     */
    async.waterfall(
        [
            // Fetch milestone data
            function(callback) {
                DataService.getMilestone(milestoneId, callback);
            },

            /**
             * Check that user has access to milestone project.
             *
             * @param   {sails.model.milestone} milestone   Milestone data
             * @param   {Function}              callback    Callback function to call after job is done
             */
            function(milestone, callback) {
                AuthService.hasProjectAccess(user, milestone.projectId, callback, returnRole);
            }
        ],

        /**
         * Callback function which is been called after all jobs are processed.
         *
         * @param   {null|Error}        error   Possible error
         * @param   {Boolean|Number}    result  Either boolean or role value (-3, -2, -1, 0, 1)
         */
        function(error, result) {
            next(error, result);
        }
    );
};

/**
 * Method checks if specified user has admin access to specified milestone or not. This method
 * uses 'hasMilestoneAccess' method to determine real data.
 *
 * Specified callback function (next) is always called with two parameters: error (Error object)
 * and hasAdmin (boolean) values.
 *
 * @param   {sails.req.user}    user        Signed in user object
 * @param   {Number}            milestoneId Milestone id to check
 * @param   {Function}          next        Main callback function, which is called after checks
 */
exports.hasMilestoneAdmin = function(user, milestoneId, next) {
    /**
     * Get user role in specified milestone project with main right service method. User has
     * update rights to milestone if he/she is at least project manager on milestone project.
     *
     * Basically following project roles grants user update right to milestone:
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     *  -1  = Project manager (contributor)
     */
    AuthService.hasMilestoneAccess(user, milestoneId, function(error, role) {
        var output = false;

        if (!error && role !== false && role < 0) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has access to specified story or not. This method uses
 * 'hasProjectAccess' method to determine actual access to specified story on taskboard.
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            storyId         Story id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 * @param   {Boolean}           [returnRole]    Return role in callback not just boolean value
 */
exports.hasStoryAccess = function(user, storyId, next, returnRole) {
    returnRole = returnRole || false;

    /**
     * Make waterfall jobs to check if user has access to specified story or not:
     *
     *  1)  Fetch story data (check that story exists)
     *  2)  Call AuthService.hasAccessToProject to check actual project right
     */
    async.waterfall(
        [
            // Fetch story data
            function(callback) {
                DataService.getStory(storyId, callback);
            },

            /**
             * Check that user has access to story project
             *
             * @param   {sails.model.story} story       Story data
             * @param   {Function}          callback    Callback function to call after job is done
             */
            function(story, callback) {
                AuthService.hasProjectAccess(user, story.projectId, callback, returnRole);
            }
        ],

        /**
         * Callback function which is been called after all waterfall jobs are processed.
         *
         * @param   {null|Error}        error   Possible error
         * @param   {Boolean|Number}    result  Either boolean or role value (-3, -2, -1, 0, 1)
         */
        function(error, result) {
            next(error, result);
        }
    );
};

/**
 * Method checks if specified user has admin access to specified story or not. This method uses
 * 'hasStoryAccess' method to determine user role within this specified story.
 *
 * Specified callback function (next) is always called with two parameters: error (Error object)
 * and hasAdmin (boolean) values.
 *
 * @param   {sails.req.user}    user    Signed in user object
 * @param   {Number}            storyId Story id to check
 * @param   {Function}          next    Main callback function, which is called after checks
 */
exports.hasStoryAdmin = function(user, storyId, next) {
    /**
     * Get user role in specified story with main right service method. User has
     * admin rights to story if he/she has greater than view rights to project.
     *
     * Basically following project roles grants user admin rights to story
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     *  -1  = Project manager (contributor)
     *   1  = Normal user (contributor)
     */
    AuthService.hasStoryAccess(user, storyId, function(error, role) {
        var output = false;

        if (!error && role !== false && role !== 0) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has access to specified task or not. This method relies to
 * 'hasStoryAccess' method to do actual access check.
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            taskId          Task id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 * @param   {Boolean}           [returnRole]    Return role in callback not just boolean value
 */
exports.hasTaskAccess = function(user, taskId, next, returnRole) {
    returnRole = returnRole || false;

    /**
     * Make waterfall jobs to check if user has access to specified story or not:
     *
     *  1)  Fetch task data (check that task exists)
     *  2)  Call AuthService.hasStoryAccess to check actual project right
     */
    async.waterfall(
        [
            // Fetch task data
            function(callback) {
                DataService.getTask(taskId, callback);
            },

            /**
             * Check that user has access to task story.
             *
             * @param   {sails.model.task}  task        Task data
             * @param   {Function}          callback    Callback function to call after job is done
             */
            function(task, callback) {
                AuthService.hasStoryAccess(user, task.storyId, callback, returnRole);
            }
        ],

        /**
         * Callback function which is been called after all jobs are processed.
         *
         * @param   {null|Error}        error   Possible error
         * @param   {Boolean|Number}    result  Either boolean or role value (-3, -2, -1, 0, 1)
         */
        function(error, result) {
            next(error, result);
        }
    );
};

/**
 * Method checks if specified user has admin access to specified task or not. This method uses
 * 'hasTaskAccess' method to determine user role in task project.
 *
 * Specified callback function (next) is always called with two parameters: error (Error object)
 * and hasAdmin (boolean) values.
 *
 * @param   {sails.req.user}    user    Signed in user object
 * @param   {Number}            taskId  Task id to check
 * @param   {Function}          next    Main callback function, which is called after checks
 */
exports.hasTaskAdmin = function(user, taskId, next) {
    /**
     * Get user role in specified  with main right service method. User has
     * admin rights to story if he/she has greater than view rights to project.
     *
     * Basically following project roles grants user admin rights to story
     *
     *  -3  = Administrator
     *  -2  = Project manager primary
     *  -1  = Project manager (contributor)
     *   1  = Normal user (contributor)
     */
    AuthService.hasTaskAccess(user, taskId, function(error, role) {
        var output = false;

        if (!error && role !== false && role !== 0) {
            output = true;
        }

        next(error, output);
    }, true);
};

/**
 * Method checks if specified user has access to specified phase or not. This method uses
 * 'hasProjectAccess' method to determine if current user has the access or not.
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            phaseId         Phase id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 * @param   {Boolean}           [returnRole]    Return role in callback not just boolean value
 */
exports.hasPhaseAccess = function(user, phaseId, next, returnRole) {
    returnRole = returnRole || false;

    /**
     * Make waterfall jobs to check if user has access to specified story or not:
     *
     *  1)  Fetch phase data (check that phase exists)
     *  2)  Call AuthService.hasProjectAccess to check actual project right
     */
    async.waterfall(
        [
            // Fetch phase data
            function(callback) {
                DataService.getPhase(phaseId, callback);
            },

            /**
             * Check that user has access to project phase
             *
             * @param   {sails.model.phase} phase       Phase data
             * @param   {Function}          callback    Callback function to call after job is done
             */
            function(phase, callback) {
                AuthService.hasProjectAccess(user, phase.projectId, callback, returnRole);
            }
        ],

        /**
         * Callback function which is been called after all jobs are processed.
         *
         * @param   {null|Error}        error   Possible error
         * @param   {Boolean|Number}    result  Either boolean or role value (-3, -2, -1, 0, 1)
         */
        function(error, result) {
            next(error, result);
        }
    );
};

/**
 * Method checks if specified user has admin access to specified phase or not. This method uses
 * 'hasProjectAccess' method to determine user actual role within phase specified phase.
 *
 * Specified callback function (next) is always called with two parameters: error (Error object)
 * and hasAdmin (boolean) values.
 *
 * @param   {sails.req.user}    user    Signed in user object
 * @param   {Number}            phaseId Phase id to check
 * @param   {Function}          next    Main callback function, which is called after checks
 */
exports.hasPhaseAdmin = function(user, phaseId, next) {
    /**
     * Make waterfall jobs to check if user has access to specified phase or not:
     *
     *  1)  Fetch phase data (check that phase exists)
     *  2)  Call AuthService.hasProjectAdmin to check actual project right
     */
    async.waterfall(
        [
            // Fetch project data
            function(callback) {
                DataService.getPhase(phaseId, callback);
            },

            /**
             * Check that user has admin access to project phase.
             *
             * @param   {sails.model.phase} phase       Phase data
             * @param   {Function}          callback    Callback function to call after job is done
             */
            function(phase, callback) {
                AuthService.hasProjectAdmin(user, phase.projectId, callback);
            }
        ],

        /**
         * Callback function which is been called after all jobs are processed.
         *
         * @param   {null|Error}    error   Possible error
         * @param   {Boolean}       result  Information if user has admin access or not
         */
        function(error, result) {
            next(error, result);
        }
    );
};

/**
 * Method checks if specified user has access to specified project external link or not. Actual
 * check is done with 'hasProjectAccess' method.
 *
 * @param   {sails.req.user}    user            Signed in user object
 * @param   {Number}            linkId          Project external link id to check
 * @param   {Function}          next            Main callback function, which is called after checks
 * @param   {Boolean}           [returnRole]    Return role in callback not just boolean value
 */
exports.hasExternalLinkAccess = function(user, linkId, next, returnRole) {
    returnRole = returnRole || false;

    /**
     * Make waterfall jobs to check if user has access to specified project external link or not:
     *
     *  1)  Fetch external link data (check that link exists)
     *  2)  Call AuthService.hasProjectAccess to check actual project right
     */
    async.waterfall(
        [
            // Get project link data
            function(callback) {
                DataService.getProjectLink(linkId, callback);
            },

            /**
             * Check if user has access to project where link is attached
             *
             * @param   {sails.model.externalLink}  link        External link object
             * @param   {Function}                  callback    Callback function to call after job is done
             */
            function(link, callback) {
                AuthService.hasProjectAccess(user, link.projectId, callback, returnRole);
            }
        ],

        /**
         * Callback function which is been called after all jobs are processed.
         *
         * @param   {null|Error}        error   Possible error
         * @param   {Boolean|Number}    result  Either boolean or role value (-3, -2, -1, 0, 1)
         */
        function(error, result) {
            next(error, result);
        }
    );
};

/**
 * Method checks if specified user has admin access to specified project external link or not.
 * Actual check is done via 'hasProjectAdmin' method.
 *
 * @param   {sails.req.user}    user    Signed in user object
 * @param   {Number}            linkId  Project external link id to check
 * @param   {Function}          next    Main callback function, which is called after checks
 */
exports.hasExternalLinkAdmin = function(user, linkId, next) {
    /**
     * Make waterfall jobs to check if user has admin access to specified project external link or not:
     *
     *  1)  Fetch external link data (check that link exists)
     *  2)  Call AuthService.hasProjectAccess to check actual project right
     */
    async.waterfall(
        [
            // Get project link data
            function(callback) {
                DataService.getProjectLink(linkId, callback);
            },

            /**
             * Check if user has access to project where link is attached
             *
             * @param   {sails.model.externalLink}  link        External link object
             * @param   {Function}                  callback    Callback function to call after job is done
             */
            function(link, callback) {
                AuthService.hasProjectAdmin(user, link.projectId, callback);
            }
        ],

        /**
         * Callback function which is been called after all jobs are processed.
         *
         * @param   {null|Error}    error   Possible error
         * @param   {Boolean}       result  Has admin or not
         */
        function(error, result) {
            next(error, result);
        }
    );
};

/**
 * Method checks if specified user is administrator or not.
 *
 * @param   {sails.req.user}    user    Signed in user object
 * @param   {Function}          next    Main callback function, which is called after checks
 */
exports.isAdministrator = function(user, next) {
    next(null, user.admin);
};