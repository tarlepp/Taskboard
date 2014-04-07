/**
 * TaskController
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

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to TaskController)
     */
    _config: {},

    /**
     * Task add action. This will render a GUI for new task add.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    add: function(request, response) {
        var projectId = parseInt(request.param("projectId"), 10);
        var storyId = parseInt(request.param("storyId"), 10);

        // Make parallel jobs for task add
        async.parallel(
            {
                // Determine first phase in this project
                phaseId: function(callback) {
                    Phase
                        .find()
                        .where({
                            projectId: projectId
                        })
                        .sort("order ASC")
                        .limit(1)
                        .done(function(error, phases) {
                            if (error) {
                                callback(error, null)
                            } else if (phases.length > 0) {
                                callback(null, phases[0].id);
                            } else {
                                var errorMessage = new Error();

                                errorMessage.message = "Phase data not found.";
                                errorMessage.status = 404;

                                callback(errorMessage, null);
                            }
                        });
                },

                // Fetch story data
                story: function(callback) {
                    DataService.getStory(storyId, callback);
                },

                // Fetch task types
                types: function(callback) {
                    DataService.getTypes({}, callback);
                },

                // Fetch users that can contribute for this project
                users: function(callback) {
                    DataService.getUsersByProject(projectId, callback, true);
                }
            },

            /**
             * Callback function which is called after all specified parallel jobs are done.
             *
             * @param   {null|Error}    error   Error object
             * @param   {{
             *              phaseId: {Number},
             *              story:  sails.model.story,
             *              types: sails.model.type[],
             *              users: sails.model.user[]
             *          }}              data    Object that contains all necessary data for task add
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    data.projectId = projectId;
                    data.storyId = storyId;

                    response.view(data);
                }
            }
        );
    },

    /**
     * Task edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        var taskId = parseInt(req.param("id"), 10);

        // Make parallel jobs for task edit
        async.parallel(
            {
                // Fetch task data
                task: function(callback) {
                    DataService.getTask(taskId, callback);
                },

                // Fetch task types
                types: function(callback) {
                    DataService.getTypes({}, callback);
                },

                // Fetch users
                users: function(callback) {
                    DataService.getUsersByTask(taskId, callback, true);
                }
            },

            /**
             * Callback function which is called after all specified parallel jobs are done.
             *
             * @param   {null|Error}    error   Error object
             * @param   {{
             *              task: sails.model.task,
             *              types: sails.model.type[],
             *              users: sails.model.users[]
             *          }}              data    Object that contains all necessary data for task edit
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    res.view(data);
                }
            }
        );
    },

    /**
     * Task statistics action. This will render a simple GUI where user can see statistics of
     * specified task in different phases.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    statistics: function(request, response) {
        var taskId = parseInt(request.param("id"), 10);

        // Make parallel jobs for task statistics view
        async.parallel(
            {
                // Fetch task data
                task: function(callback) {
                    DataService.getTask(taskId, callback);
                },

                // Fetch phase data
                phases: function(callback) {
                    DataService.getPhasesForTask(taskId, callback);
                }
            },

            /**
             * Callback function which is called after all specified parallel jobs are done.
             *
             * @param   {null|Error}    error   Error object
             * @param   {{
             *              task: sails.model.task,
             *              phases: sails.model.phase[]
             *          }}              data    Object that contains all necessary data for task edit
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    fetchDurations(data);
                }
            }
        );

        /**
         * Private function which is called after main data is fetched. This main data contains following data:
         *  - task, single task object
         *  - phases, array of phase objects
         *
         * @param   {{
         *              task: sails.model.task,
         *              phases: sails.model.phase[]
         *          }}  data
         */
        function fetchDurations(data) {
            async.map(
                data.phases,

                /**
                 * Function to determine duration in current phase.
                 *
                 * @param   {sails.model.phase} phase
                 * @param   {Function}          callback
                 */
                function(phase, callback) {
                    var where = {
                        taskId: data.task.id,
                        phaseId: phase.id
                    };

                    PhaseDuration
                        .find({
                            sum: "duration"
                        })
                        .where(where)
                        .done(function(error, result) {
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
         * Private function to make actual render of GUI and some statistics data calculations.
         *
         * @param   {{
         *              task: sails.model.task,
         *              phases: sails.model.phase[]
         *          }}  data
         */
        function makeView(data) {
            var totalTime = _.pluck(data.phases, "duration").reduce(function(memo, i) {
                return memo + i;
            });

            var totalTimeNoFirst = _.pluck(_.reject(data.phases, function(phase) {
                return phase.order === 0;
            }), "duration").reduce(function(memo, i) {
                return memo + i;
            });

            data.phaseDuration = {
                totalTime: totalTime,
                totalTimeNoFirst: totalTimeNoFirst
            };

            _.each(data.phases, function(phase) {
                phase.durationPercentage = (phase.duration > 0 && phase.order !== 0) ? phase.duration / totalTimeNoFirst * 100 : 0;
                phase.durationPercentageTotal = (phase.duration > 0) ? phase.duration / totalTime * 100 : 0;
            });

            data.chartData = [];
            data.chartDataTotal = [];

            _.each(data.phases, function(phase) {
                if (phase.durationPercentage > 0) {
                    data.chartData.push({
                        name: phase.title,
                        color: phase.backgroundColor,
                        y: phase.durationPercentage,
                        duration: phase.duration
                    });
                }

                if (phase.durationPercentageTotal > 0) {
                    data.chartDataTotal.push({
                        name: phase.title,
                        color: phase.backgroundColor,
                        y: phase.durationPercentageTotal,
                        duration: phase.duration
                    });
                }
            });

            response.view(data);
        }
    },

    /**
     * Release task owner action. This will just simple update task's current user value to 0 and
     * change current update user id value.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    releaseTask: function(request, response) {
        var taskId = parseInt(request.param("id"), 10);

        // Fetch single task data and remove currentUserId (release task) value from it
        DataService.getTask(taskId, function(error, task) {
            if (error) {
                ResponseService.makeError(error, request, response);
            } else {
                task.currentUserId = 0;
                task.updatedUserId = request.user.id;

                // Save task data
                task.save(function(error) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        // Publish update for this task
                        Task.publishUpdate(taskId, task.toJSON());

                        response.send(task);
                    }
                });
            }
        });
    },

    /**
     * Action to take task ownership. This will also release all existing
     * owned task(s) which are in same sprint.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    takeTask: function(request, response) {
        var taskId = parseInt(request.param("id"), 10);

        // Fetch needed data
        async.waterfall(
            [
                // Current task data
                function(callback) {
                    DataService.getTask(taskId, callback);
                },

                // Fetch task story, this is needed to determine sprint
                function(task, callback) {
                    DataService.getStory(task.storyId, function(error, story) {
                        callback(error, task, story);
                    });
                },

                // Fetch all stories that are attached to this sprint
                function(task, story, callback) {
                    DataService.getStories({sprintId: story.sprintId}, function(error, stories) {
                        callback(error, task, stories);
                    });
                },

                // Fetch all tasks that are attached to this sprint and current user is owner
                function(task, stories, callback) {
                    var storyIds = _.map(stories, function(story) {
                        return {storyId: story.id};
                    });

                    var where = {
                        or: storyIds,
                        currentUserId: request.user.id,
                        id: {"!": task.id}
                    };

                    DataService.getTasks(where, function(error, tasks) {
                        callback(error, task, tasks);
                    });
                }
            ],

            /**
             * Main callback function which is called after all waterfall jobs are processed.
             *
             * @param   {null|Error}            error   Possible error
             * @param   {sails.model.task}      task    Main task, which owner current user wants to be
             * @param   {sails.model.task[]}    tasks   All tasks that belongs to same sprint as main task AND current
             *                                          owner is currently signed in user
             */
            function(error, task, tasks) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    processTasks(task, tasks);
                }
            }
        );

        /**
         * Private function to process necessary task updates on board.
         *
         * @param   {sails.model.task}      task    Main task, which owner current user wants to be
         * @param   {sails.model.task[]}    tasks   All tasks that belongs to same sprint as main task AND current
         *                                          owner is currently signed in user
         */
        function processTasks(task, tasks) {
            // Make necessary updates as parallel
            async.parallel(
                {
                    // Update possible existing tasks those ownership is currently signed in user
                    tasks: function(callback) {
                        var taskIds = _.map(tasks, function(task) {
                            return {id: task.id};
                        });

                        // We have some task(s) to update
                        if (taskIds.length > 0) {
                            var where = {
                                or: taskIds
                            };

                            var data = {
                                currentUserId: 0,
                                updatedUserId: request.user.id
                            };

                            // Update task data
                            Task
                                .update(where, data, function(error, tasks) {
                                    if (error) {
                                        callback(error, null);
                                    } else {
                                        // Iterate updated tasks and publish updates for those
                                        _.each(tasks, function(task) {
                                            Task.publishUpdate(task.id, task.toJSON());
                                        });

                                        callback(null, tasks);
                                    }
                                }
                            );
                        } else {
                            callback(null, []);
                        }
                    },

                    // Update main task
                    task: function(callback) {
                        // Set update data
                        task.createdUserId = task.createdUserId || request.user.id;
                        task.updatedUserId = request.user.id;
                        task.currentUserId = request.user.id;

                        task.save(function(error) {
                            if (error) {
                                callback(error, null);
                            } else {
                                Task.publishUpdate(taskId, task.toJSON());

                                callback(null, task);
                            }
                        });
                    }
                },

                /**
                 * Main callback function which is called after all parallel jobs
                 * are done. This is the final callback in this action.
                 *
                 * @param   {null|Error}    error
                 * @param   {{}}            data
                 */
                function(error, data) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        response.send(200, data);
                    }
                }
            )
        }
    }
};
