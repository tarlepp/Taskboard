/**
 * /api/services/DataService.js
 *
 * Generic data service, which is used to fetch generic data and call defined callback after data fetching.
 * This contains basically all data fetch that Taskboard needs. Services contains fetch of one and multiple
 * objects.
 *
 * Single object fetch:
 *  get{ObjectName}(terms, next, [noExistCheck])
 *
 * Multiple object fetch
 *  get{ObjectName}s(terms, next)
 *
 * All data service methods will write error log if some error occurs. In all cases callback function 'next'
 * is called with two arguments: possible error and actual result.
 *
 * Note that with multiple object fetch service will attach "default" sort conditions for results.
 */

var async = require("async");

/**
 * Service to fetch single project data from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getProject = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Project
        .findOne(where)
        .exec(function(error, /** sails.model.project */ project) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch project data]");
                sails.log.error(error);
            } else if (!project && !noExistsCheck) {
                error = new Error();

                error.message = "Project not found.";
                error.status = 404;
            }

            next(error, project);
        });
};

/**
 * Service to fetch project data from database.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to call after query
 */
exports.getProjects = function(where, next) {
    Project
        .find()
        .where(where)
        .sort("title ASC")
        .exec(function(error, /** sails.model.project[] */ projects) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch project data]");
                sails.log.error(error);
            }

            next(error, projects);
        });
};

/**
 * Service to fetch project object that belongs to specified object (name + id). Basically service this
 * just fetches necessary data by specified object and process it until we have project.
 *
 * Note that this only support following objects at this time:
 *  - Story
 *  - Task
 *
 * @param   {String}    objectName  Name of the object
 * @param   {Number}    objectId    Object id
 * @param   {Function}  next
 */
exports.getProjectByLink = function(objectName, objectId, next) {
    // Make necessary jobs as waterfall
    async.waterfall(
        [
            /**
             * First job in main water fall jobs. With this we will determine project id by
             * specified object. Actual determination is done in separate processes which
             * uses own async water fall jobs to determine project id.
             *
             * @param   {Function}  callback
             */
            function(callback) {
                switch (objectName) {
                    case "Story":
                        // In case of story we just needed to fetch story data
                        DataService.getStory(objectId, callback);
                        break;
                    case "Task":
                        // With task we need to get actual task object and then story object
                        async.waterfall(
                            [
                                // Fetch task
                                function(cb) {
                                    DataService.getTask(objectId, cb);
                                },

                                // Fetch story object via task object.
                                function(task, cb) {
                                    DataService.getStory(task.storyId, cb);
                                }
                            ],

                            /**
                             * Task specified water fall callback function which is called after we have
                             * determined project id via task data or some error has been occurred.
                             *
                             * This will call main water fall async job callback function.
                             *
                             * Yo dawg, i herd like y ar doing callbacks in your callbacks!
                             *
                             * @param   {null|Error}        error   Possible error
                             * @param   {sails.model.story} story   Story object
                             */
                            function(error, story) {
                                callback(error, story);
                            }
                        );
                        break;
                    default:
                        callback("Not supported link object '" + objectName + "' given", null);
                        break;
                }
            },

            /**
             * Callback function to fetch actual project object, this is called after we have
             * determined project id from specified object.
             *
             * @param   {sails.model.story} story       Story object
             * @param   {Function}          callback    Callback function to call after job is done
             */
            function(story, callback) {
                DataService.getProject(story.projectId, callback);
            }
        ],

        /**
         * Main callback which is call after all main water fall jobs are done
         *
         * @param   {null|Error}            error
         * @param   {sails.model.project}   project
         */
        function(error, project) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch project data by link, see errors above.]");
            }

            next(error, project);
        }
    )
};

/**
 * Service to fetch single project user from database by given conditions.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getProjectUser = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    ProjectUser
        .findOne(where)
        .exec(function(error, /** sails.model.projectUser */ projectUser) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch project user data]");
                sails.log.error(error);
            } else if (!projectUser && !noExistsCheck) {
                error = new Error();

                error.message = "Project user not found.";
                error.status = 404;
            }

            next(error, projectUser);
        });
};

/**
 * Service to fetch project users from database by given conditions.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to after query
 */
exports.getProjectUsers = function(where, next) {
    ProjectUser
        .find()
        .where(where)
        .exec(function(error, /** sails.model.projectUser[] */ projectUsers) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch project user data]");
                sails.log.error(error);
            }

            next(error, projectUsers);
        });
};

/**
 * Service to fetch single project external link from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getProjectLink = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    ExternalLink
        .findOne(where)
        .exec(function(error, /** sails.model.externalLink */ externalLink) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch external link data]");
                sails.log.error(error);
            } else if (!projectUser && !noExistsCheck) {
                error = new Error();

                error.message = "External link not found.";
                error.status = 404;
            }

            next(error, externalLink);
        });
};

/**
 * Service to fetch specified project external link data from database.
 *
 * @param   {Number}    projectId   Project id
 * @param   {Function}  next        Callback function to call after query
 */
exports.getProjectLinks = function(projectId, next) {
    ExternalLink
        .find()
        .where({projectId: projectId})
        .sort("title ASC")
        .exec(function(error, /** sails.model.externalLink[] */ links) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch external link data]");
                sails.log.error(error);
            }

            next(error, links);
        });
};

/**
 * Service to fetch single sprint data from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getSprint = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Sprint
        .findOne(where)
        .exec(function(error, /** sails.model.sprint */ sprint) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch sprint data]");
                sails.log.error(error);
            } else if (!sprint && !noExistsCheck) {
                error = new Error();

                error.message = "Sprint not found.";
                error.status = 404;
            }

            next(error, sprint);
        });
};

/**
 * Service to fetch sprint data from database.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to call after query
 */
exports.getSprints = function(where, next) {
    Sprint
        .find()
        .where(where)
        .sort("dateStart ASC")
        .sort("dateEnd ASC")
        .sort("title ASC")
        .exec(function(error, /** sails.model.sprint[] */ sprints) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch sprint data]");
                sails.log.error(error);
            }

            next(error, sprints);
        });
};

/**
 * Service to fetch sprint exclude day objects from database.
 *
 * @param   {Number}    sprintId    Sprint ID
 * @param   {Function}  next        Callback function to call after query
 */
exports.getSprintExcludeDays = function(sprintId, next) {
    ExcludeSprintDay
        .find()
        .where({sprintId: sprintId})
        .sort("day ASC")
        .exec(function(error, /** sails.model.excludeSprintDay[] */ excludeSprintDay) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch sprint exclude day data]");
                sails.log.error(error);
            }

            next(error, excludeSprintDay);
        });
};

/**
 * Service to fetch single milestone data from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getMilestone = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Milestone
        .findOne(where)
        .exec(function(error, /** sails.model.milestone */ milestone) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch milestone data]");
                sails.log.error(error);
            } else if (!milestone && !noExistsCheck) {
                error = new Error();

                error.message = "Milestone not found.";
                error.status = 404;
            }

            next(error, milestone);
        });
};

/**
 * Service to fetch milestone data from database.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to call after query
 */
exports.getMilestones = function(where, next) {
    Milestone
        .find()
        .where(where)
        .sort("deadline ASC")
        .sort("title ASC")
        .exec(function(error, /** sails.model.milestone[] */  milestones) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch milestone data]");
                sails.log.error(error);
            }

            next(error, milestones);
        });
};

/**
 * Service to fetch single story data from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getStory = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Story
        .findOne(where)
        .exec(function(error, /** sails.model.story */ story) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch story data]");
                sails.log.error(error);
            } else if (!story && !noExistsCheck) {
                error = new Error();

                error.message = "Story not found.";
                error.status = 404;
            }

            next(error, story);
        });
};

/**
 * Service to fetch story data from database.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to call after query
 */
exports.getStories = function(where, next) {
    Story
        .find()
        .where(where)
        .sort("priority ASC")
        .sort("title ASC")
        .exec(function(error, /** sails.model.story[] */ stories) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch story data]");
                sails.log.error(error);
            }

            next(error, stories);
        });
};

/**
 * Service to fetch single task data from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getTask = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Task
        .findOne(where)
        .exec(function(error, /** sails.model.task */ task) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch task data]");
                sails.log.error(error);
            } else if (!task && !noExistsCheck) {
                error = new Error();

                error.message = "Task not found.";
                error.status = 404;
            }

            next(error, task);
        });
};

/**
 * Service to fetch task data from database.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to call after query
 */
exports.getTasks = function(where, next) {
    Task
        .find()
        .where(where)
        .sort("priority ASC")
        .sort("title ASC")
        .exec(function(error, /** sails.model.task[] */ tasks) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch task data]");
                sails.log.error(error);
            }

            next(error, tasks);
        });
};

/**
 * Service to fetch single phase data from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getPhase = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Phase
        .findOne(where)
        .exec(function(error, /** sails.model.phase */ phase) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch phase data]");
                sails.log.error(error);
            } else if (!phase && !noExistsCheck) {
                error = new Error();

                error.message = "Phase not found.";
                error.status = 404;
            }

            next(error, phase);
        });
};

/**
 * Service to fetch phase data from database.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to call after query
 */
exports.getPhases = function(where, next) {
    Phase
        .find()
        .where(where)
        .sort("order ASC")
        .exec(function(error, /** sails.model.phase[] */ phases) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch phase data]");
                sails.log.error(error);
            }

            next(error, phases);
        });
};

/**
 * Service to fetch phase data via specified task id data.
 *
 * @param   {Number}    taskId  Task id whose phases are fetched
 * @param   {Function}  next    Callback function to call after query
 */
exports.getPhasesForTask = function(taskId, next) {
    async.waterfall(
        [
            // Fetch task data
            function(callback) {
                DataService.getTask(taskId, callback);
            },

            // Fetch task story data
            function(task, callback) {
                DataService.getStory(task.storyId, callback);
            },

            // Fetch task phases data via story projectId information
            function(story, callback) {
                DataService.getPhases({projectId: story.projectId}, callback);
            }
        ],

        /**
         * Main callback function which is called after all jobs are done and processed.
         *
         * @param   {null|Error}            error   Possible error
         * @param   {sails.model.phase[]}   phases  Determined phases for task
         */
        function(error, phases) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch phases for task, check errors above]");
            }

            next(error, phases);
        }
    );
};

/**
 * Service to fetch single comment from database. Note that this won't fetch comment
 * siblings nor author data
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getComment = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Comment
        .findOne(where)
        .exec(function(error, /** sails.model.comment */ comment) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch comment data]");
                sails.log.error(error);
            } else if (!comment && !noExistsCheck) {
                error = new Error();

                error.message = "Comment not found.";
                error.status = 404;
            }

            next(error, comment);
        });
};

/**
 * Service to fetch comments for specified object. Note that service calls itself recursive to
 * fetch all nested comments. Note that service fetches all users for performance reasons so we
 * don't have to make n single user queries to database.
 *
 * @param   {String}                objectName  Name of the object (Project, Sprint, Story, Task, etc.)
 * @param   {Number}                objectId    Id of the specified object
 * @param   {Number}                commentId   Possible parent comment id
 * @param   {Function}              next        Callback function which is called after comments are fetched
 * @param   {sails.model.user[]}    [users]     User objects or empty array
 */
exports.getComments = function(objectName, objectId, commentId, next, users) {
    users = users || false;

    async.parallel(
        {
            // Fetch comments
            comments: function(callback) {
                Comment
                    .find()
                    .where({
                        objectName: objectName,
                        objectId: objectId,
                        commentId: commentId
                    })
                    .sort("createdAt ASC")
                    .exec(function(error, /** sails.model.comment[] */ comments) {
                        callback(error, comments);
                    });
            },

            // Fetch users, note this is done only with first iteration
            users: function(callback) {
                if (users) {
                    callback(null, users);
                } else {
                    DataService.getUsers({}, callback);
                }
            }
        },

        /**
         * Main callback function which is called after all parallel jobs are done or
         * an error has occurred within those.
         *
         * @param   {null|Error}    error
         * @param   {{
         *              comments: sails.model.comment[],
         *              users: sails.model.user[]
         *          }}              data
         */
        function(error, data) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch comment data]");
                sails.log.error(error);

                next(error, null);
            } else {
                fetchSiblingsAndAttachUsers(data);
            }
        }
    );

    /**
     * Private helper function to attach user object to each comment and fetch
     * siblings by calling service method itself with current comment data.
     *
     * @param   {{
     *              comments: sails.model.comment[],
     *              users: sails.model.user[]
     *          }}  data
     */
    function fetchSiblingsAndAttachUsers(data) {
        async.map(
            data.comments,

            /**
             * Iterator function which will attach user object to processed link object. Users
             * are simply searched from user array which is fetched in main async parallel call.
             *
             * @param   {sails.model.comment}   comment     Comment object
             * @param   {Function}              callback    Callback function to call after job is done.
             */
            function(comment, callback) {
                comment.author = _.find(data.users, function(user) {
                    return user.id === comment.createdUserId;
                });

                // Call service itself recursive, note that we pass the users to service
                DataService.getComments(objectName, objectId, comment.id, function(error, comments) {
                    if (!error) {
                        comment.comments = comments;
                    }

                    callback(error, comment);
                }, data.users);
            },

            /**
             * Main callback function which is called after all links are mapped. In this
             * comments contains author and siblings data.
             *
             * @param   {null|Error}            error   Possible error
             * @param   {sails.model.comment[]} comment Processed comments
             */
            function(error, comment) {
                if (error) {
                    sails.log.error(__filename + ":" + __line + " [Failed to fetch comment sibling data]");
                    sails.log.error(error);
                }

                next(error, comment);
            }
        );
    }
};

/**
 * Service to fetch single task type data from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getType = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Type
        .findOne(where)
        .exec(function(error, /** sails.model.type */ type) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch type data]");
                sails.log.error(error);
            } else if (!type && !noExistsCheck) {
                error = new Error();

                error.message = "Task type not found.";
                error.status = 404;
            }

            next(error, type);
        });
};

/**
 * Service to fetch type data from database.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to call after query
 */
exports.getTypes = function(where, next) {
    Type
        .find()
        .where(where)
        .sort("order ASC")
        .sort("title ASC")
        .exec(function(error, /** sails.model.type[] */ types) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch type data]");
                sails.log.error(error);
            }

            next(error, types);
        });
};

/**
 * Service to fetch single link object from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getLink = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Link
        .findOne(where)
        .exec(function(error, /** sails.model.link */ link) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch link data]");
                sails.log.error(error);
            } else if (!link && !noExistsCheck) {
                error = new Error();

                error.message = "Link not found.";
                error.status = 404;
            }

            next(error, link);
        });
};

/**
 * Service to fetch attached links for specified object. For performance reasons service
 * will simply fetch all users from database and then map those to actual links. This will
 * save a whole lot queries to database.
 *
 * @param   {String}    objectName  Name of the object (Story, Task, etc.)
 * @param   {Number}    objectId    Id of the specified object
 * @param   {Function}  next        Callback function which is called after links are fetched
 */
exports.getLinks = function(objectName, objectId, next) {
    async.parallel(
        {
            // Fetch links
            links: function(callback) {
                Link
                    .find()
                    .where({
                        objectName: objectName,
                        objectId: objectId
                    })
                    .sort("link ASC")
                    .sort("createdAt ASC")
                    .exec(function(error, /** sails.model.link[] */ links) {
                        callback(error, links);
                    });
            },

            // Fetch users
            users: function(callback) {
                DataService.getUsers({}, callback);
            }
        },

        /**
         * Main callback which is called after all parallel jobs are done or an
         * error has occurred while processing those.
         *
         * @param   {null|Error}    error
         * @param   {{
         *              links: sails.model.link[],
         *              users: sails.model.user[]
         *          }}              data
         */
        function(error, data) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch link data]");
                sails.log.error(error);

                next(error, null);
            } else {
                attachUsers(data);
            }
        }
    );

    /**
     * Private helper function to attach user data to each link. This is much faster than
     * fetching user data for each link separately.
     *
     * After we have added author (user) data to each link function will call callback
     * function that has been provided to service.
     *
     * @param   {{
     *              links: sails.model.link[],
     *              users: sails.model.user[]
     *          }}  data
     */
    function attachUsers(data) {
        async.map(
            data.links,

            /**
             * Iterator function which will attach user object to processed link object. Users
             * are simply searched from user array which is fetched in main async parallel call.
             *
             * @param   {sails.model.link}  link        Link object
             * @param   {Function}          callback    Callback function to call after job is done.
             */
            function(link, callback) {
                link.author = _.find(data.users, function(user) {
                    return user.id === link.createdUserId;
                });

                callback(null, link);
            },

            /**
             * Main callback function which is called after all links are mapped.
             *
             * @param   {null}                  error   In this case error is always null
             * @param   {sails.model.link[]}    links   Processed links
             */
            function(error, links) {
                next(error, links);
            }
        )
    }
};

/**
 * Service to fetch single user data from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getUser = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    User
        .findOne(where)
        .exec(function(error, /** sails.model.user */ user) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch user data]");
                sails.log.error(error);
            } else if (!user && !noExistsCheck) {
                error = new Error();

                error.message = "User not found.";
                error.status = 404;
            }

            next(error, user);
        });
};

/**
 * Service to fetch specified user sign in data from database.
 *
 * @param   {Number}    userId  User id
 * @param   {Function}  next    Callback function to call after query
 */
exports.getUserSignInData = function(userId, next) {
    UserLogin
        .find()
        .where({userId: userId})
        .sort("stamp DESC")
        .exec(function(error, /** sails.model.userLogin[] */ userLogin) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch user login data]");
                sails.log.error(error);
            }

            next(error, userLogin);
        });
};

/**
 * Service to fetch user data from database.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to call after query
 */
exports.getUsers = function(where, next) {
    User
        .find()
        .where(where)
        .sort("lastName ASC")
        .sort("firstName ASC")
        .sort("username ASC")
        .exec(function(error, users) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch user data]");
                sails.log.error(error);
            }

            next(error, users);
        });
};

/**
 * Service to fetch project users. These users are attached in some role to specified project.
 *
 * @param   {Number}    projectId   Project id
 * @param   {Function}  next        Callback function which is called after job is finished
 * @param   {Boolean}   [noViewers] Skip users that are in 'Viewer' role in this project. Defaults to false.
 */
exports.getUsersByProject = function(projectId, next, noViewers) {
    noViewers = noViewers || false;

    async.parallel(
        {
            // Fetch project user data
            projectUsers: function(callback) {
                DataService.getProjectUsers({projectId: projectId}, callback);
            },

            // Fetch project data
            project: function(callback) {
                DataService.getProject(projectId, callback);
            },

            // Fetch admin users
            adminUsers: function(callback) {
                var where = {
                    admin: true
                };

                DataService.getUsers(where, callback);
            }
        },

        /**
         * Main callback function which is called after all parallel jobs are done or
         * some error occurred while processing those.
         *
         * @param   {null|Error}    error
         * @param   {{
         *              projectUsers: sails.model.projectUser[],
         *              project: sails.model.project,
         *              adminUsers: sails.model.user[]
         *          }}              data
         */
        function(error, data) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch project users data, see errors above]");
                sails.log.error(error);

                next(error, null);
            } else {
                var userIds = [];

                // Add project users
                _.each(data.projectUsers, function(projectUser) {
                    if (!(noViewers && projectUser.role === 0)) {
                        userIds.push({id: projectUser.userId});
                    }
                });

                // Add project manager
                userIds.push({id: data.project.managerId});

                // Add admin users
                _.each(data.adminUsers, function(user) {
                    if (user.username !== "admin") {
                        userIds.push({id: user.id});
                    }
                });

                // Fetch user objects that are attached to this project
                DataService.getUsers({or: userIds}, next);
            }
        }
    )
};

/**
 * Service to fetch project users by task id. These users are attached in some role to specified project.
 * This service will eventually call 'getUsersByProject' service method to determine real users.
 *
 * @param   {Number}    taskId      Task id
 * @param   {Function}  next        Callback function which is called after job is finished
 * @param   {Boolean}   [noViewers] Skip users that are in 'Viewer' role in this project. Defaults to false.
 */
exports.getUsersByTask = function(taskId, next, noViewers) {
    noViewers = noViewers || false;

    async.waterfall(
        [
            // Fetch task data
            function(callback) {
                DataService.getTask(taskId, callback);
            },

            // Fetch story data
            function(task, callback) {
                DataService.getStory(task.storyId, callback);
            }
        ],

        /**
         * Main callback function which is called after all waterfall jobs are done or
         * some error occurred while processing them.
         *
         * @param   {null|Error}        error
         * @param   {sails.model.story} story
         */
        function(error, story) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch project users by task, see errors above]");
                sails.log.error(error);

                next(error, null);
            } else {
                DataService.getUsersByProject(story.projectId, next, noViewers);
            }
        }
    )
};
