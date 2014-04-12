/**
 * StoryController
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
var numeral = require("numeral");

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to StoryController)
     */
    _config: {},

    /**
     * Story add action. This will render a GUI where user and add new story to specified sprint.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    add: function(request, response) {
        var projectId = parseInt(request.param("projectId"), 10);
        var sprintId = parseInt(request.param("sprintId"), 10);
        var formData = request.param("formData") || {};

        // Make parallel jobs for add action
        async.parallel(
            {
                // Fetch milestone data
                milestones: function(callback) {
                    DataService.getMilestones({projectId: projectId}, callback);
                },

                // Fetch task types
                types: function(callback) {
                    DataService.getTypes({}, callback);
                }
            },

            /**
             * Callback function which is called after all parallel jobs have been processed.
             *
             * @param   {null|Error}    error   Error object
             * @param   {{
             *              milestones: sails.model.milestone[],
             *              type: sails.model.type[]
             *          }}              data    Object that contains 'milestones' and 'types' data
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    data.projectId = projectId;
                    data.sprintId = sprintId;
                    data.formData = formData;

                    response.view(data);
                }
            }
        );
    },

    /**
     * Story edit action. This will render a GUI where user can edit specified story.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    edit: function(request, response) {
        var storyId = parseInt(request.param("id"), 10);

        // Make parallel jobs for edit action
        async.parallel(
            {
                // Fetch story data
                story: function(callback) {
                    DataService.getStory(storyId, callback);
                },

                // Fetch task types
                types: function(callback) {
                    DataService.getTypes({}, callback);
                }
            },

            /**
             * Callback function which is called after all parallel jobs have been processed.
             *
             * @param   {null|Error}    error   Error object
             * @param   {{
             *              story: sails.model.story,
             *              types: sails.model.type[]
             *          }}              data    Object that contains 'story' and 'types' data
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    // Fetch milestone data which are attached to story project
                    DataService.getMilestones({projectId: data.story.projectId}, function(error, milestones) {
                        if (error) {
                            ResponseService.makeError(error, request, response);
                        } else {
                            data.milestones = milestones;

                            response.view(data);
                        }
                    });
                }
            }
        );
    },

    /**
     * Story split action. This will render a GUI where user can pick a existing sprint or project backlog
     * where to split specified story.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    split: function(request, response) {
        var storyId = parseInt(request.param("storyId"), 10);
        var sprintId = parseInt(request.param("sprintId"), 10);
        var projectId = parseInt(request.param("projectId"), 10);

        var data = {
            storyOld: false,
            storyNew: false,
            tasks: [],
            taskCnt: 0
        };

        // Get story data
        DataService.getStory(storyId, function(error, story) {
            if (error) {
                ResponseService.makeError(error, request, response);
            } else {
                splitStory(story);
            }
        });

        /**
         * Private function to split specified story to new one.
         *
         * @param   {sails.model.story} story
         */
        function splitStory(story) {
            async.parallel(
                {
                    // Create new story
                    newStory: function(callback) {
                        // Remove story specified data, that we don't want to pass to new story
                        delete story.id;
                        delete story.createdAt;
                        delete story.updatedAt;
                        delete story.timeStart;
                        delete story.timeEnd;

                        // Change story sprint data to user selected value and set the parent story id
                        story.sprintId = sprintId;
                        story.parentId = storyId;

                        // Create new story
                        Story
                            .create(story.toJSON())
                            .exec(function(error, /** sails.model.story */story) {
                                if (error) {
                                    callback(error, null);
                                } else  {
                                    // Send socket message about new story
                                    Story.publishCreate(story.toJSON());

                                    callback(null, story);
                                }
                            });
                    },

                    // Fetch phases data that may contain tasks that we must move to new story
                    phases: function(callback) {
                        var where = {
                            isDone: 0,
                            projectId: projectId
                        };

                        DataService.getPhases(where, callback);
                    }
                },

                /**
                 * Callback function that is called after all parallel jobs are done, or
                 * if those generated some error.
                 *
                 * @param   {null|Error}    error   Error info
                 * @param   {{
                 *              newStory: sails.model.story,
                 *              phases: sails.model.phase[]
                 *          }}              results Result object that contains following data:
                 *                                   - newStory = Created new story object
                 *                                   - phases   = Array of phase objects
                 */
                function(error, results) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        data.storyNew = results.newStory;

                        if (results.phases.length > 0) {
                            changeTasks(results.phases);
                        } else {
                            finalizeStorySplit();
                        }
                    }
                }
            );
        }

        /**
         * Private function to change tasks story id to new one. Note that
         * we only change tasks which are in specified phase.
         *
         * @param   {sails.model.phase[]}   phases
         */
        function changeTasks(phases) {
            var phaseIds = _.map(phases, function(phase) {
                return { phaseId: phase.id };
            });

            var firstPhase = phases[0];

            // Find first phase in this project
            _.each(phases, function(phase) {
                if (phase.order < firstPhase.order) {
                    firstPhase = phase;
                }
            });

            async.waterfall(
                [
                    // Waterfall job to fetch all tasks, that should be assigned to new story
                    function(callback) {
                        var where = {
                            storyId: storyId,
                            or: phaseIds
                        };

                        DataService.getTasks(where, callback);
                    },

                    // Move tasks to new story
                    function(tasks, callback) {
                        moveTasks(tasks, callback);
                    }
                ],

                /**
                 * Main callback function for async waterfall job.
                 *
                 * @param   {null|Error}            error
                 * @param   {sails.model.task[]}    tasks
                 */
                function(error, tasks) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        data.tasks = tasks;
                        data.taskCnt = tasks.length;

                        finalizeStorySplit();
                    }
                }
            );

            /**
             * Private function to move actual tasks to another story.
             *
             * @param   {sails.model.task[]}    tasks   Tasks to move
             * @param   {Function}              next    Callback function to call after all tasks are processed
             */
            function moveTasks(tasks, next) {
                async.map(
                    tasks,

                    /**
                     * Iterator function to move task to another story.
                     *
                     * @param   {sails.model.task}  task
                     * @param   {Function}          callback
                     */
                    function(task, callback) {
                        var taskId = task.id;
                        var timeStart = task.timeStart;
                        var phaseId = task.phaseId;

                        // Move to project backlog so time start is null and phase if is first phase
                        if (data.storyNew.sprintId == 0) {
                            timeStart = null;
                            phaseId = firstPhase.id;
                        }

                        // Fetch task object
                        DataService.getTask(taskId, function(error, task) {
                            if (error) {
                                callback(error, null);
                            } else {
                                task.storyId = data.storyNew.id;
                                task.phaseId = phaseId;
                                task.timeStart = timeStart;

                                task.save(function(error) {
                                    if (error) {
                                        callback(error, null)
                                    } else {
                                        /**
                                         * Send socket message about task update, this is a small hack.
                                         * First we must publish destroy for "existing" task and after
                                         * that publish create for the same task.
                                         */
                                        Task.publishDestroy(task.id);
                                        Task.publishCreate(task.toJSON());

                                        callback(null, task);
                                    }
                                });
                            }
                        });
                    },

                    /**
                     * Main callback function for async.map process. This is called when all tasks
                     * are mapped or an error occurred while processing those.
                     *
                     * @param   {null|Error}            error
                     * @param   {sails.model.task[]}    tasks
                     */
                    function(error, tasks) {
                        next(error, tasks);
                    }
                );
            }
        }

        /**
         * Private function to finalize story splitting. This function will do following jobs:
         *
         *  1) Update old story data
         *  2) Update new story data
         *  3) Copy links of old story to new one
         *  3) Copy comments of old story to new one
         *
         * All of these jobs are done parallel and after all jobs are done send response to client.
         */
        function finalizeStorySplit() {
            async.parallel(
                {
                    // Parallel job to update old story data
                    storyOld: function (callback) {
                        updateOldStoryData(storyId, callback);
                    },

                    // Parallel job to update new story data
                    storyNew: function(callback) {
                        updateNewStoryData(data.storyNew.id, callback);
                    },

                    // Job to copy attached story links to new story
                    links: function(callback) {
                        copyObjectLinks("Story", storyId, data.storyNew.id, callback);
                    },

                    // Job to copy attached story comments to new story
                    comments: function(callback) {
                        copyObjectComments("Story", storyId, data.storyNew.id, callback);
                    }
                },

                function(error, results) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        data.storyNew = results.storyNew;
                        data.storyOld = results.storyOld;

                        // Publish update for old and new story object
                        Story.publishUpdate(data.storyOld.id, data.storyOld.toJSON());
                        Story.publishUpdate(data.storyNew.id, data.storyNew.toJSON());

                        response.send(data);
                    }
                }
            );
        }

        /**
         * Private function to update old story data.
         *
         * @param   {Number}    storyId Story id to update
         * @param   {Function}  next    Callback function to call after job is done
         */
        function updateOldStoryData(storyId, next) {
            var where = {
                id: storyId
            };

            var update = {
                isDone: true,
                timeEnd: new Date()
            };

            // Update old story data
            Story
                .update(where, update, function(error, /** sails.model.story[] */stories) {
                    var story = null;

                    if (!error && stories[0]) {
                        story = stories[0];
                    }

                    next(error, story);
                });
        }

        /**
         * Private function to update new story data.
         *
         * @param   {Number}    storyId Story id to update
         * @param   {Function}  next    Callback function to call after job is done
         */
        function updateNewStoryData(storyId, next) {
            var timeStart = null;

            if (data.tasks.length > 0) {
                var tasks = _.filter(data.tasks, function(task) {
                    return task.timeStartObject() !== null;
                });

                if (tasks.length > 0) {
                    timeStart = _.min(_.pluck(tasks, "timeStart"));
                }
            }

            var where = {
                id: storyId
            };

            var update = {
                isDone: false,
                timeStart: timeStart,
                timeEnd: null
            };

            // Update new story data
            Story
                .update(where, update, function(error, /** sails.model.story[] */ stories) {
                    var story = null;

                    if (!error && stories[0]) {
                        story = stories[0];
                    }

                    next(error, story);
                });
        }

        /**
         * Private function to copy specified object links to new one
         *
         * @param   {String}    objectName      Name of the object
         * @param   {Number}    objectId        Object id
         * @param   {Number}    destinationId   Destination object id
         * @param   {Function}  next            Callback function to call after copy is done
         */
        function copyObjectLinks(objectName, objectId, destinationId, next) {
            DataService.getLinks(objectName, objectId, function(error, links) {
                if (!error && links && links.length > 0) {
                    async.map(
                        links,

                        function(link, callback) {
                            delete link.id;

                            link.objectId = destinationId;

                            Link
                                .create(link.toJSON())
                                .exec(function(error, /** sails.model.link */ link) {
                                    callback(error, link);
                                });
                        },

                        function(error, links) {
                            next(error, links);
                        }
                    )
                } else {
                    next(error, null);
                }
            });
        }

        /**
         * Private function to copy specified object comments to new one. This function will just
         * fetch comments that are attached to specified object.
         *
         * @param   {String}    objectName      Name of the object
         * @param   {Number}    objectId        Object id
         * @param   {Number}    destinationId   Destination object id
         * @param   {Function}  next            Callback function to call after copy is done
         */
        function copyObjectComments(objectName, objectId, destinationId, next) {
            DataService.getComments(objectName, objectId, 0, function(error, comments) {
                if (!error && comments && comments.length > 0) {
                    processCommentCopy(comments, destinationId, 0, function(error) {
                        if (!error) {
                            DataService.getComments(objectName, destinationId, 0, next);
                        } else {
                            next(error, null);
                        }
                    });
                } else {
                    next(error, null);
                }
            });
        }

        /**
         * Private function to iterate comments and attach those to destination object. Note that
         * this function will call itself recursively to attach possible comment siblings right.
         * Basically we need to reserve parent comment relations right.
         *
         * @param   {sails.model.comment[]} comments        Array of comment objects
         * @param   {Number}                destinationId   Destination object id
         * @param   {Number}                parentCommentId Parent comment id
         * @param   {Function}              next            Callback function to call after comments are processed
         */
        function processCommentCopy(comments, destinationId, parentCommentId, next) {
            async.each(
                comments,

                /**
                 * Iterator function to create new comment and process possible sibling comments.
                 *
                 * @param   {sails.model.comment}   comment     Single comment object
                 * @param   {Function}              callback    Callback function which
                 */
                function(comment, callback) {
                    delete comment.id;

                    // Change necessary comment data
                    comment.objectId = destinationId;
                    comment.commentId = parentCommentId;

                    // Create new comment
                    Comment
                        .create(comment.toJSON())
                        .exec(function(error, newComment) {
                            if (!error && comment.comments && comment.comments.length > 0) {
                                processCommentCopy(comment.comments, destinationId, newComment.id, callback);
                            } else {
                                callback(error);
                            }
                        });
                },

                function(error) {
                    next(error);
                }
            );
        }
    },

    /**
     * Story tasks action. This will render a GUI where user can see all tasks that belongs to
     * specified story.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    tasks: function(request, response) {
        var storyId = parseInt(request.param('id'), 10);

        async.parallel(
            {
                // Fetch user role in this story
                role: function(callback) {
                    AuthService.hasStoryAccess(request.user, storyId, callback, true);
                },

                // Fetch story data
                story: function(callback) {
                    DataService.getStory(storyId, callback);
                },

                // Fetch task data for story
                tasks: function(callback) {
                    DataService.getTasks({storyid: storyId}, callback);
                },

                // Fetch user data
                users: function(callback) {
                    DataService.getUsers({}, callback);
                },

                // Fetch types
                types: function(callback) {
                    DataService.getTypes({}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error
             * @param   {{
             *              role: sails.helper.role,
             *              story: sails.model.story,
             *              tasks: sails.model.task[],
             *              users: sails.model.user[],
             *              types: sails.model.type[]
             *          }}              data
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    DataService.getPhases({projectId: data.story.projectId}, function(error, phases) {
                        if (error) {
                            ResponseService.makeError(error, request, response);
                        } else {
                            fetchPhaseDuration(phases, data);
                        }
                    });
                }
            }
        );

        /**
         * Private function to fetch story task phase duration times. This will sum tasks durations
         * for each phase in this project.
         *
         * @param   {sails.model.phase[]}   phases
         * @param   {{
         *              role: sails.helper.role,
         *              story: sails.model.story,
         *              tasks: sails.model.task[],
         *              users: sails.model.user[],
         *              types: sails.model.type[]
         *          }}                      data
         */
        function fetchPhaseDuration(phases, data) {
            async.map(
                phases,

                /**
                 * Function to determine duration in current phase.
                 *
                 * @param   {sails.model.phase} phase
                 * @param   {Function}          callback
                 */
                function (phase, callback) {
                    var where = {
                        phaseId: phase.id,
                        storyId: data.story.id
                    };

                    PhaseDuration
                        .find({
                            sum: "duration"
                        })
                        .where(where)
                        .exec(function(error, result) {
                            if (error) {
                                callback(error, null);
                            } else {
                                phase.duration = result[0].duration ? result[0].duration : 0;

                                callback(null, phase);
                            }
                        });
                },

                /**
                 * Main callback function which is called after all phases are processed.
                 *
                 * @param   {null|Error}            error
                 * @param   {sails.model.phase[]}   phases
                 */
                function(error, phases) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        data.phases = phases;

                        makeView(data);
                    }
                }
            );
        }

        /**
         * Private function to make some calculations about data and render a GUI.
         *
         * @param   {{
         *              role: sails.helper.role,
         *              story: sails.model.story,
         *              tasks: sails.model.task[],
         *              users: sails.model.user[],
         *              types: sails.model.type[]
         *              phases: sails.model.phase[]
         *          }}  data
         */
        function makeView(data) {
            moment.lang(request.user.language);

            var totalTime = 0;
            var totalTimeNoFirst = 0;

            if (data.phases.length > 0) {
                totalTime = _.pluck(data.phases, "duration").reduce(function(memo, i) {
                    return memo + i;
                });

                var temp = _.pluck(_.reject(data.phases, function(phase) {
                    return phase.order === 0;
                }), "duration");

                if (temp.length > 0) {
                    totalTimeNoFirst = temp.reduce(function(memo, i) {
                        return memo + i;
                    });
                }
            }

            data.phaseDuration = {
                totalTime: totalTime,
                totalTimeNoFirst: totalTimeNoFirst
            };

            _.each(data.phases, function(phase) {
                phase.durationPercentage = (phase.duration > 0 && phase.order !== 0) ? phase.duration / totalTimeNoFirst * 100 : 0;
                phase.durationPercentageTotal = (phase.duration > 0) ? phase.duration / totalTime * 100 : 0;
            });

            // Add relation data to each tasks
            _.each(data.tasks, function(task) {
                task.type = _.find(data.types, function(type) {
                    return type.id === task.typeId;
                });

                task.user = _.find(data.users, function(user) {
                    return user.id === task.userId;
                });

                task.phase = _.find(data.phases, function(phase) {
                    return phase.id === task.phaseId;
                });

                task.timeStartObjectUser = moment.isMoment(task.timeStartObject())
                    ? task.timeStartObject().tz(request.user.momentTimezone) : null;

                task.timeEndObjectUser = moment.isMoment(task.timeEndObject())
                    ? task.timeEndObject().tz(request.user.momentTimezone) : null;
            });

            data.cntTaskTotal = data.tasks.length;
            data.cntTaskDone = _.reduce(data.tasks, function(memo, task) {
                return (task.isDone) ? memo + 1 : memo;
            }, 0);

            if (data.cntTaskDone> 0) {
                data.progressTask = Math.round(data.cntTaskDone  / data.cntTaskTotal * 100);
            } else {
                data.progressTask = 0;
            }

            response.view(data);
        }
    }
};
