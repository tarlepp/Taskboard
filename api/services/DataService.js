/**
 * /api/services/DataService.js
 *
 * Generic data service, which is used to fetch generic data and call defined callback after data fetching.
 */

var async = require("async");

/**
 * Service to fetch single project data from database.
 *
 * @param   {Number}    projectId   Project id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getProject = function(projectId, callback) {
    Project
        .findOne(projectId)
        .done(function(error, /** sails.model.project */ project) {
            if (error) {
                callback(error, null);
            } else if (!project) {
                var errorMessage = new Error();

                errorMessage.message = "Project not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, project);
            }
        });
};

/**
 * Service to fetch single sprint data from database.
 *
 * @param   {Number}    sprintId    Sprint id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getSprint = function(sprintId, callback) {
    Sprint
        .findOne(sprintId)
        .done(function(error, /** sails.model.sprint */ sprint) {
            if (error) {
                callback(error, null);
            } else if (!sprint) {
                var errorMessage = new Error();

                errorMessage.message = "Sprint not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, sprint);
            }
        });
};

/**
 * Service to fetch single milestone data from database.
 *
 * @param   {Number}    milestoneId Milestone id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getMilestone = function(milestoneId, callback) {
    Milestone
        .findOne(milestoneId)
        .done(function(error, /** sails.model.milestone */ milestone) {
            if (error) {
                callback(error, null);
            } else if (!milestone) {
                var errorMessage = new Error();

                errorMessage.message = "Milestone not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, milestone);
            }
        });
};

/**
 * Service to fetch single story data from database.
 *
 * @param   {Number}    storyId     Story id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getStory = function(storyId, callback) {
    Story
        .findOne(storyId)
        .done(function(error, /** sails.model.story */ story) {
            if (error) {
                callback(error, null);
            } else if (!story) {
                var errorMessage = new Error();

                errorMessage.message = "Story not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, story);
            }
        });
};

/**
 * Service to fetch single task data from database.
 *
 * @param   {Number}    taskId      Task id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getTask = function(taskId, callback) {
    Task
        .findOne(taskId)
        .done(function(error, /** sails.model.task */ task) {
            if (error) {
                callback(error, null);
            } else if (!task) {
                var errorMessage = new Error();

                errorMessage.message = "Task not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, task);
            }
        });
};

/**
 * Service to fetch single user data from database.
 *
 * @param   {Number}    userId      User id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getUser = function(userId, callback) {
    User
        .findOne(userId)
        .done(function(error, /** sails.model.user */ user) {
            if (error) {
                callback(error, null);
            } else if (!user) {
                var errorMessage = new Error();

                errorMessage.message = "User not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, user);
            }
        });
};

/**
 * Service to fetch single phase data from database.
 *
 * @param   {Number}    phaseId     Phase id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getPhase = function(phaseId, callback) {
    Phase
        .findOne(phaseId)
        .done(function(error, /** sails.model.phase */ phase) {
            if (error) {
                callback(error, null);
            } else if (!phase) {
                var errorMessage = new Error();

                errorMessage.message = "Phase not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, phase);
            }
        });
};

/**
 * Service to fetch single comment from database. Note that this won't fetch
 * siblings and author data
 *
 * @param   {Number}    commentId   Comment id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getComment = function(commentId, callback) {
    Comment
        .findOne(commentId)
        .done(function(error, /** sails.model.comment */ comment) {
            if (error) {
                callback(error, null);
            } else if (!comment) {
                var errorMessage = new Error();

                errorMessage.message = "Comment not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, comment);
            }
        });
};

/**
 * Service to fetch single project external link from database.
 *
 * @param   {Number}    linkId      External link id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getProjectLink = function(linkId, callback) {
    ExternalLink
        .findOne(linkId)
        .done(function(error, /** sails.model.externalLink */ link) {
            if (error) {
                callback(error, null);
            } else if (!link) {
                var errorMessage = new Error();

                errorMessage.message = "External project link not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, link);
            }
        });
};

/**
 * Service to fetch project data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getProjects = function(where, callback) {
    Project
        .find()
        .where(where)
        .sort("title ASC")
        .done(function(error, /** sails.model.project[] */ projects) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, projects);
            }
        });
};

/**
 * Service to fetch milestone data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getMilestones = function(where, callback) {
    Milestone
        .find()
        .where(where)
        .sort("deadline ASC")
        .sort("title ASC")
        .done(function(error, milestones) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, milestones);
            }
        });
};

/**
 * Service to fetch sprint data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getSprints = function(where, callback) {
    Sprint
        .find()
        .where(where)
        .sort("dateStart ASC")
        .done(function(error, sprints) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, sprints);
            }
        });
};

/**
 * Service to fetch story data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getStories = function(where, callback) {
    Story
        .find()
        .where(where)
        .sort("priority ASC")
        .sort("title ASC")
        .done(function(error, stories) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, stories);
            }
        });
};

/**
 * Service to fetch task data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getTasks = function(where, callback) {
    Task
        .find()
        .where(where)
        .sort("priority ASC")
        .done(function(error, tasks) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, tasks);
            }
        });
};

/**
 * Service to fetch phase data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getPhases = function(where, callback) {
    Phase
        .find()
        .where(where)
        .sort("order ASC")
        .done(function(error, phases) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, phases);
            }
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
         * @param   {Error|null}            error
         * @param   {sails.model.phase[]}   data
         */
        function (error, data) {
            next(error, data);
        }
    );
};

/**
 * Service to fetch user data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getUsers = function(where, callback) {
    User
        .find()
        .where(where)
        .sort("lastName ASC")
        .done(function(error, users) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, users);
            }
        });
};

/**
 * Service to fetch type data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getTypes = function(where, callback) {
    Type
        .find()
        .where(where)
        .sort("order ASC")
        .done(function(error, types) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, types);
            }
        });
};

/**
 * Service to fetch specified user sign in data from database.
 *
 * @param   {Number}    userId      User id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getUserSignInData = function(userId, callback) {
    UserLogin
        .find()
        .where({userId: userId})
        .sort("stamp DESC")
        .done(function(error, data) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, data);
            }
        });
};

/**
 * Service to fetch comments for specified object. Note that service calls itself
 * recursive to fetch all nested comments.
 *
 * @param   {String}    objectName  Name of the object (Project, Sprint, Story, Task, etc.)
 * @param   {Number}    objectId    Id of the specified object
 * @param   {Number}    commentId   Possible parent comment id
 * @param   {Function}  callback    Callback function which is called after comments are fetched
 */
exports.getComments = function(objectName, objectId, commentId, callback) {
    Comment
        .find()
        .where({
            objectName: objectName,
            objectId: objectId,
            commentId: commentId
        })
        .sort("createdAt ASC")
        .exec(function(error, comments) {
            if (error) {
                callback(error, null);
            } else {
                // Map all comments and fetch children(s) for those
                async.map(
                    comments,

                    /**
                     * Map function to fetch current comment children comments. Note that
                     * this will actually call service method recursively.
                     *
                     * @param   {sails.model.comment}   comment Comment object
                     * @param   {Function}              callback      Callback function
                     */
                    function(comment, callback) {
                        async.parallel(
                            {
                                // Fetch comment author data
                                author: function(callback) {
                                    DataService.getUser(comment.createdUserId, callback);
                                },

                                // Fetch children comments
                                comments: function(callback) {
                                    DataService.getComments(objectName, objectId, comment.id, callback);
                                }
                            },

                            /**
                             * Main callback function which is called after parallel jobs are done.
                             *
                             * @param   {Error|null}    error
                             * @param   {{}}            results
                             */
                            function(error, results) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    comment.author = results.author;
                                    comment.comments = results.comments;

                                    callback(null, results);
                                }
                            }
                        );
                    },

                    /**
                     * Main callback function for comment mapping.
                     *
                     * @param   {Error} error   Possible error object
                     */
                    function(error) {
                        // Just call specified service callback function
                        callback(error, comments);
                    }
                );
            }
        });
};

/**
 * Service to fetch specified project external link data from database.
 *
 * @param   {Number}    projectId   Project id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getProjectLinks = function(projectId, callback) {
    ExternalLink
        .find()
        .where({
            projectId: projectId
        })
        .sort("title ASC")
        .exec(function(error, links) {
            callback(error, links);
        });
};

/**
 * Service to fetch single link object from database.
 *
 * @param   {Number}    linkId      Link id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getLink = function(linkId, callback) {
    Link
        .findOne(linkId)
        .exec(function(error, /** sails.model.link */ link) {
            if (error) {
                callback(error, null);
            } else if (!link) {
                var errorMessage = new Error();

                errorMessage.message = "Link not found.";
                errorMessage.status = 404;

                callback(errorMessage, null);
            } else {
                callback(null, link);
            }
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
 * @param   {Function}  callback
 */
exports.getLinkObjectProject = function(objectName, objectId, callback) {
    // Make necessary jobs as waterfall
    async.waterfall(
        [
            /**
             * First job in main water fall jobs. With this we will determine project id by
             * specified object. Actual determination is done in separate processes which
             * uses own async water fall jobs to determine project id.
             *
             * @param   {Function}  next
             */
            function(next) {
                switch (objectName) {
                    case "Story":
                        // In case of story we just needed to fetch story data
                        DataService.getStory(objectId, function(error, story) {
                            next(error, story.projectId ? story.projectId : null);
                        });
                        break;
                    case "Task":
                        // With task we need to get actual task object and then story object
                        async.waterfall(
                            [
                                /**
                                 * Fetch task object.
                                 *
                                 * @param   {Function}  cb
                                 */
                                function(cb) {
                                    DataService.getTask(objectId, cb);
                                },

                                /**
                                 * Fetch story object via task object.
                                 *
                                 * @param   {sails.model.task}  task
                                 * @param   {Function}          cb
                                 */
                                function(task, cb) {
                                    DataService.getStory(task.storyId, function(error, story) {
                                        cb(error, story.projectId ? story.projectId : null);
                                    });
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
                             * @param   {null|Error}    error
                             * @param   {null|Number}   projectId
                             */
                            function(error, projectId) {
                                next(error, projectId)
                            }
                        );
                        break;
                    default:
                        next("Not supported link object '" + objectName + "' given", null);
                        break;
                }
            },

            /**
             * Callback function to fetch actual project object, this is called after we have
             * determined project id from specified object.
             *
             * @param   {Number}    projectId   Project id
             * @param   {Function}  next
             */
            function(projectId, next) {
                DataService.getProject(projectId, next);
            }
        ],

        /**
         * Main callback which is call after all main water fall jobs are done
         *
         * @param   {null|Error}                error
         * @param   {null|sails.model.project}  project
         */
        function(error, project) {
            callback(error, project);
        }
    )
};