/**
 * StoryController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 *
 * @bugs        ::  /api/controllers/StoryController.js:498:126)
 */
"use strict";

var async = require("async");
var moment = require("moment-timezone");
var numeral = require("numeral");

module.exports = {
    /**
     * Story add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        var projectId = parseInt(req.param("projectId"), 10);
        var sprintId = parseInt(req.param("sprintId"), 10);
        var formData = req.param("formData") || {};

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
             * @param   {Error} error   Error object
             * @param   {{}}    data    Object that contains 'milestones' and 'types' data
             */
            function(error, data) {
                if (error) {
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    data.projectId = projectId;
                    data.sprintId = sprintId;
                    data.formData = formData;

                    res.view(data);
                }
            }
        );
    },

    /**
     * Story edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        var storyId = parseInt(req.param("id"), 10);

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
             * @param   {Error} error   Error object
             * @param   {{}}    data    Object that contains 'story' and 'types' data
             */
            function(error, data) {
                if (error) {
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    // Fetch milestone data which are attached to story project
                    DataService.getMilestones({projectId: data.story.projectId}, function(error, milestones) {
                        if (error) {
                            res.send(error.status ? error.status : 500, error.message ? error.message : error);
                        } else {
                            data.milestones = milestones;

                            res.view(data);
                        }
                    });
                }
            }
        );
    },

    /**
     * Story split action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    split: function(req, res) {
        var storyId = parseInt(req.param("storyId"), 10);
        var sprintId = parseInt(req.param("sprintId"), 10);
        var projectId = parseInt(req.param("projectId"), 10);

        if (isNaN(storyId) || isNaN(sprintId) || isNaN(projectId)) {
            res.send(400, "Required input data missing...");
        } else {
            var data = {
                storyOld: false,
                storyNew: false,
                tasks: [],
                taskCnt: 0
            };

            // Fetch story data
            Story
                .findOne(storyId)
                .done(function(error, /** sails.model.story */story) {
                    if (error) {
                        res.send(500, error);
                    } else if (!story) {
                        res.send(404, "Story not found.");
                    } else {
                        splitStory(story);
                    }
                });
        }

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
                            .done(function(error, /** sails.model.story */story) {
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
                        // Fetch phases which tasks are wanted to move to new story
                        Phase
                            .find()
                            .where({
                                isDone: 0,
                                projectId: projectId
                            })
                            .done(function(error, /** sails.model.phase[] */phases) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    callback(null, phases);
                                }
                            });
                    }
                },

                /**
                 * Callback function that is called after all parallel jobs are done, or
                 * if those generated some error.
                 *
                 * @param   {Error} error   Error info
                 * @param   {{}}    results Result object that contains following data:
                 *                           - newStory = Created new story object
                 *                           - phases   = Array of phase objects
                 */
                function(error, results) {
                    if (error) {
                        res.send(500, error);
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
            var phaseIds = _.map(phases, function(phase) { return {phaseId: phase.id}; });
            var firstPhase = phases[0];

            // Find first phase in this project
            _.each(phases, function(phase) {
                if (phase.order < firstPhase.order) {
                    firstPhase = phase;
                }
            });

            // Fetch tasks which we want to assign to new story
            Task
                .find()
                .where({
                    storyId: storyId
                })
                .where({
                    or: phaseIds
                })
                .done(function(error, /** sails.model.task[] */tasks) {
                    if (error) {
                        res.send(500, error);
                    } else {
                        data.taskCnt = tasks.length;

                        if (data.taskCnt === 0) {
                            finalizeStorySplit();
                        }

                        async.map(
                            tasks,
                            function(task, callback) {
                                var taskId = task.id;
                                var timeStart = task.timeStart;
                                var phaseId = task.phaseId;

                                // Move to project backlog so time start is null and phase if is first phase
                                if (data.storyNew.sprintId == 0) {
                                    timeStart = null;
                                    phaseId = firstPhase.id;
                                }

                                Task
                                    .findOne(taskId)
                                    .done(function(error, task) {
                                        if (error) {
                                            res.send(500, error);
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
                            function(error, tasks) {
                                if (error) {
                                    res.send(500, error);
                                } else {
                                    data.tasks = tasks;

                                    finalizeStorySplit();
                                }
                            }
                        );
                    }
                });
        }

        /**
         * Private function to finalize story splitting.
         */
        function finalizeStorySplit() {
            async.parallel(
                [
                    function (callback) {
                        // Update old story data
                        Story
                            .update(
                            {id: storyId},
                            {
                                isDone: true,
                                timeEnd: new Date()
                            },
                            function(error, /** sails.model.story[] */stories) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    data.storyOld = stories[0];

                                    // Publish update for old story object
                                    Story.publishUpdate(storyId, data.storyOld.toJSON());

                                    callback(null, stories);
                                }
                            });
                    },
                    function(callback) {
                        var timeStart = null;

                        _.each(data.tasks, function(task) {
                            if (task.timeStart > timeStart) {
                                timeStart = task.timeStart;
                            }
                        });

                        // Update new story data
                        Story
                            .update(
                            {id: data.storyNew.id},
                            {
                                isDone: false,
                                timeStart: timeStart,
                                timeEnd: null
                            },
                            function(error, /** sails.model.story[] */stories) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    data.storyNew = stories[0];

                                    // Publish update for new story object
                                    Story.publishUpdate(data.storyNew.id, data.storyNew.toJSON());

                                    callback(error, stories);
                                }
                            });
                    }
                ],
                function(error, results) {
                    if (error) {
                        res.send(500, error);
                    } else {
                        res.send(data);
                    }
                }
            );
        }
    },

    /**
     * Story tasks
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    tasks: function(req, res) {
        var storyId = parseInt(req.param('id'), 10);

        async.parallel(
            {
                // Fetch user role in this story
                role: function(callback) {
                    AuthService.hasStoryAccess(req.user, storyId, callback, true);
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
             * @param   {Error|String}  error
             * @param   {{}}            data
             */
            function(error, data) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    DataService.getPhases({projectId: data.story.projectId}, function(error, phases) {
                        if (error) {
                            res.send(error, error.status ? error.status : 500);
                        } else {
                            data.phases = phases;

                            fetchPhaseDuration(data);
                        }
                    });
                }
            }
        );

        /**
         * Private function to fetch story task phase duration times. This will sum tasks durations
         * for each phase in this project.
         *
         * @param data
         */
        function fetchPhaseDuration(data) {
            async.map(
                data.phases,

                /**
                 * Function to determine duration in current phase.
                 *
                 * @param   {sails.model.phase} phase
                 * @param   {Function}          callback
                 */
                function (phase, callback) {
                    PhaseDuration
                        .find({
                            sum: "duration"
                        })
                        .where({phaseId: phase.id})
                        .where({storyId: data.story.id})
                        .done(function(error, result) {
                            if (error) {
                                callback(error, null);
                            } else {
                                phase.duration = result[0].duration ? result[0].duration : 0;

                                callback(null, phase.duration);
                            }
                        });
                },

                /**
                 * Main callback function which is called after all phases are processed.
                 *
                 * @param   {Error|null}    error
                 * @param   {{}}            result
                 */
                function (error, result) {
                    if (error) {
                        res.send(error, error.status ? error.status : 500);
                    } else {
                        makeView(data);
                    }
                }
            );
        }

        function makeView(data) {
            moment.lang(req.user.language);

            var totalTime = _.pluck(data.phases, "duration").reduce(function(memo, i) {return memo + i});
            var totalTimeNoFirst = _.pluck(_.reject(data.phases, function(phase) { return phase.order === 0 } ), "duration").reduce(function(memo, i) {return memo + i});

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
                task.type = _.find(data.types, function(type) { return type.id === task.typeId; });
                task.user = _.find(data.users, function(user) { return user.id === task.userId; });
                task.phase = _.find(data.phases, function(phase) { return phase.id === task.phaseId; });

                task.timeStartObjectUser = moment.isMoment(task.timeStartObject())
                    ? task.timeStartObject().tz(req.user.momentTimezone) : null;

                task.timeEndObjectUser = moment.isMoment(task.timeEndObject())
                    ? task.timeEndObject().tz(req.user.momentTimezone) : null;
            });

            data.cntTaskTotal = data.tasks.length;
            data.cntTaskDone = _.reduce(data.tasks, function (memo, task) {
                return (task.isDone) ? memo + 1 : memo;
            }, 0);

            if (data.cntTaskDone> 0) {
                data.progressTask = Math.round(data.cntTaskDone  / data.cntTaskTotal * 100);
            } else {
                data.progressTask = 0;
            }

            res.view(data);
        }
    }
};
