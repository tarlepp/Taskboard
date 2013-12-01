/**
 * StoryController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require("jquery");
var async = require("async");
var moment = require("moment-timezone");

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

        // Required view data
        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
            projectId: projectId,
            sprintId: sprintId,
            formData: formData,
            milestones: false,
            types: false
        };

        // Fetch project milestones
        Milestone
            .find()
            .where({
                projectId: projectId
            })
            .sort('deadline ASC')
            .done(function(error, milestones) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.milestones = milestones;

                    makeView();
                }
            });

        // Fetch task types
        Type
            .find()
            .sort('order ASC')
            .done(function(error, types) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.types = types;

                    makeView();
                }
            });

        /**
         * Private function to make actual view with specified data.
         */
        function makeView() {
            var ready = true;

            jQuery.each(data, function(key, data) {
                if (data === false) {
                    ready = false;
                }
            });

            if (ready) {
                res.view(data);
            }
        }
    },

    /**
     * Story edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        var storyId = parseInt(req.param('id'), 10);

        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
            story: false,
            milestones: false,
            types: false
        };

        // Fetch story data
        Story
            .findOne(storyId)
            .done(function(error, story) {
                if (error) {
                    res.send(error, 500);
                } else if (!story) {
                    res.send("Story not found.", 404);
                } else {
                    data.story = story;

                    // Fetch project milestones
                    Milestone
                        .find()
                        .where({
                            projectId: data.story.projectId
                        })
                        .sort('deadline ASC')
                        .done(function(error, milestones) {
                            if (error) {
                                res.send(error, 500);
                            } else {
                                data.milestones = milestones;

                                makeView();
                            }
                        });

                    makeView();
                }
            });

        // Fetch task types
        Type
            .find()
            .sort('order ASC')
            .done(function(error, types) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.types = types;

                    makeView();
                }
            });

        /**
         * Private function to make actual view with specified data.
         */
        function makeView() {
            var ready = true;

            jQuery.each(data, function(key, data) {
                if (data === false) {
                    ready = false;
                }
            });

            if (ready) {
                res.view(data);
            }
        }
    },

    /**
     * Story split action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    split: function(req, res) {
        var storyId = parseInt(req.param('storyId'), 10);
        var sprintId = parseInt(req.param('sprintId'), 10);
        var projectId = parseInt(req.param('projectId'), 10);

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

                        // Change story sprint data to user selected value
                        story.sprintId = sprintId;

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

                            makeView(data);
                        }
                    });
                }
            }
        );

        function makeView(data) {
            moment.lang(req.user.language);

            data.layout = req.isAjax ? "layout_ajax" : "layout";
            data.currentUser = req.user;
            data.moment = moment;

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
