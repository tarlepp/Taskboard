/**
 * Task
 *
 * @module      ::  Model
 * @description ::  Model represents single task on taskboard. Tasks are attached to specified user story, phase,
 *                  type and user.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

var async = require("async");
var moment = require("moment-timezone");
var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
    attributes: {
        // Relation to Story model
        storyId: {
            type:       "integer",
            required:   true
        },
        // Relation to User model
        userId: {
            type:       "integer",
            defaultsTo: 0
        },
        // Relation to User model, this is used to show Gravatar image in board
        currentUserId: {
            type:       "integer",
            defaultsTo: 0
        },
        // Relation to Phase model
        phaseId: {
            type:       "integer",
            required:   true,
            defaultsTo: 0
        },
        // Relation to Type model
        typeId: {
            type:       "integer",
            required:   true,
            defaultsTo: 1
        },
        // Task title
        title: {
            type:       "string",
            required:   true,
            minLength:  4
        },
        // Description of the task
        description: {
            type:       "text",
            defaultsTo: ""
        },
        // Task priority on story
        priority: {
            type:       "integer",
            defaultsTo: 0
        },
        // Is task done, this is updated automatic within life cycle callbacks
        isDone: {
            type:       "boolean",
            required:   true,
            defaultsTo: false
        },
        // Task start time, this is updated automatic when task is moved from phase to another one
        timeStart: {
            type:       "datetime"
        },
        // Task end time, this is updated automatic when task is moved to "done" phase
        timeEnd: {
            type:       "datetime"
        },

        // Dynamic data attributes

        timeStartObject: function() {
            return (this.timeStart && this.timeStart != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.timeStart) : null;
        },
        timeEndObject: function() {
            var date = (this.timeEnd && this.timeEnd != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.timeEnd) : null;

            // This check is needed for avoid broken data
            if (this.isDone && !moment.isMoment(date)) {
                date = this.timeStartObject();
            }

            return date;
        },
        timeDuration: function() {
            var output;

            if (moment.isMoment(this.timeStartObject()) && moment.isMoment(this.timeEndObject())) {
                output = this.timeEndObject().diff(this.timeStartObject(), "seconds");
            } else {
                output = 0;
            }

            return output;
        },
        timeDurationHuman: function() {
            var output;

            if (moment.isMoment(this.timeStartObject()) && this.timeStartObject().isValid()
                && moment.isMoment(this.timeEndObject()) && this.timeEndObject().isValid()
            ) {
                output = this.timeStartObject().from(this.timeEndObject(), true);
            } else {
                output = "";
            }

            return output;
        }
    },

    // Lifecycle Callbacks

    /**
     * Before create callback. Basically we just want to make sure that isDone bit is set to false
     * and new task gets right priority value according to existing tasks in this story.
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          next
     */
    beforeCreate: function(values, next) {
        values.isDone = false;

        // Fetch latest task and determine new task priority from that
        Task
            .find()
            .where({storyId: values.storyId})
            .sort("priority DESC")
            .limit(1)
            .exec(function(error, task) {
                if (error) {
                    sails.log.error(error);
                } else {
                    values.priority = (task[0]) ? task[0].priority + 1 : 1;
                }

                next(error);
            });
    },

    /**
     * Before update callback we want to check desired phase id isDone bit and
     * update task data with that.
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          next
     */
    beforeUpdate: function(values, next) {
        if (values.phaseId) {
            async.parallel(
                {
                    // Fetch phase data
                    phase: function(callback) {
                        DataService.getPhase(values.phaseId, callback);
                    },

                    // Fetch task data
                    task: function(callback) {
                        DataService.getTask(values.id, callback);
                    }
                },

                /**
                 * Main callback function which is called after all specified parallel jobs are done.
                 *
                 * @param   {null|Error}    error
                 * @param   {{
                 *              phase: sails.model.phase[],
                 *              task: sails.model.task
                 *          }}              data
                 */
                function(error, data) {
                    if (error) {
                        sails.log.error(error);
                    } else {
                        values.isDone = data.phase.isDone;

                        // Task is done so clear current user data
                        if (values.isDone || data.phase.order === 0) {
                            values.currentUserId = 0;
                        }

                        // Task is updated to first phase, so set start and end times to null
                        if (data.phase.order === 0) {
                            values.timeStart = null;
                            values.timeEnd = null;
                        } else if (values.phaseId !== data.task.phaseId
                            && (!data.task.timeStart || data.task.timeStart == "0000-00-00 00:00:00")
                        ) { // We can assume that this update is from the board, so set start time if needed
                            values.timeStart = new Date();

                            // This will prevent false data occurs to db in case of direct move to "done" phase
                            if (values.isDone) {
                                values.timeEnd = new Date();
                            } else { // Set timeEnd to null and currentUserId values
                                values.timeEnd = null;
                                values.currentUserId = values.updatedUserId;
                                values.userId = values.updatedUserId;
                            }
                        } else if (values.isDone !== data.task.isDone) { // Task isDone attribute has changed
                            delete values.timeStart;

                            values.timeEnd = values.isDone ? new Date() : null;
                        } else { // Other
                            delete values.timeStart;
                            delete values.timeEnd;
                        }
                    }

                    next(error);
                }
            );
        } else {
            next();
        }
    },

    /**
     * Before destroy callback. In this we want to check 'isDone' bit for all task which
     * are attached to same user story as task which is going to be deleted.
     *
     * If all task are done (isDone === true) we can update current story as done. Note
     * that if story hasn't any task it cannot be "done".
     *
     * @param   {Number}    taskId
     * @param   {Function}  next
     */
    beforeDestroy: function(taskId, next) {
        async.waterfall(
            [
                // Fetch task data which is going to be deleted
                function(callback) {
                    DataService.getTask(taskId, function(error, task) {
                        callback(error, task);
                    });
                },

                // Fetch all another tasks that belongs to same story
                function(task, callback) {
                    var where = {
                        storyId: task.storyId,
                        id: {"!": task.id}
                    };

                    DataService.getTasks(where, function(error, tasks) {
                        callback(error, task, tasks);
                    })
                },

                // Fetch story data
                function(task, tasks, callback) {
                    DataService.getStory(task.storyId, function(error, story) {
                        callback(error, task, tasks, story);
                    });
                }
            ],

            /**
             * Main callback function which is called after all waterfall jobs are done.
             *
             * @param   {null|Error}            error
             * @param   {sails.model.task}      task
             * @param   {sails.model.task[]}    tasks
             * @param   {sails.model.story}     story
             */
            function(error, task, tasks, story) {
                if (error) {
                    sails.log.error(error);

                    next(error);
                } else {
                    HistoryService.remove("Task", task.id);
                    PhaseDurationService.remove({taskId: task.id});

                    var isDone = true;

                    if (_.size(tasks) > 0) {
                        // Iterate story tasks
                        _.each(tasks, function(/** sails.model.task */task) {
                            if (!task.isDone) {
                                isDone = false;
                            }
                        });
                    } else { // If there are no tasks, story cannot be done
                        isDone = false;
                    }

                    // Determine time end value
                    var timeEnd = (isDone) ? new Date() : null;

                    // We need to update story data
                    if (timeEnd !== story.timeEnd || isDone !== story.isDone) {
                        Story
                            .update(
                            {id: task.storyId},
                            {isDone: isDone, timeEnd: timeEnd},
                            function(error, /** sails.model.story[] */stories) {
                                if (error) {
                                    sails.log.error(error);
                                } else {
                                    _.each(stories, function(story) {
                                        Story.publishUpdate(story.id, story.toJSON());
                                    });
                                }

                                next(error);
                            }
                        );
                    } else { // No need to update story.
                        next();
                    }
                }
            }
        );
    },

    /**
     * After task creation we can set current story automatic to not done status (isDone = false).
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          next
     */
    afterCreate: function(values, next) {
        HistoryService.write("Task", values);

        PhaseDurationService.write(values);

        // Fetch story data
        DataService.getStory(values.storyId, function(error, story) {
            if (error) {
                sails.log.error(error);

                next(error);
            } else if (story.isDone) { // Story is done, so we must change it
                // Update story data
                Story
                    .update(
                    {id: values.storyId},
                    {isDone: 0, timeEnd: null, updatedUserId: values.updatedUserId ? values.updatedUserId : -1},
                    function(error, /** sails.model.story[] */stories) {
                        if (error) {
                            sails.log.error(error);
                        } else {
                            _.each(stories, function(story) {
                                Story.publishUpdate(story.id, story.toJSON());
                            });
                        }

                        next(error);
                    }
                );
            } else { // No need to update task story data
                next();
            }
        });
    },

    /**
     * After update callback. In this we want to check 'isDone' bit for all task which
     * are attached to same user story as updated.
     *
     * If all task are done (isDone === true) we can update current story as done.
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          next
     */
    afterUpdate: function(values, next) {
        HistoryService.write("Task", values);

        PhaseDurationService.write(values);

        async.parallel(
            {
                // Fetch phase data
                story: function(callback) {
                    DataService.getStory(values.storyId, callback);
                },

                // Fetch task data
                task: function(callback) {
                    DataService.getTask(values.id, callback);
                },

                // Fetch tasks that are attached to same story
                tasks: function(callback) {
                    DataService.getTasks({storyId: values.storyId}, callback);
                },

                // Fetch phases
                phases: function(callback) {
                    DataService.getPhases({}, callback);
                }
            },

            /**
             * Main callback function which is called after all parallel jobs are done.
             *
             * @param   {null|Error}    error
             * @param   {{
             *              story: sails.model.story,
             *              task: sails.model.task,
             *              tasks: sails.model.task[],
             *              phases: sails.model.phase[]
             *          }}              data
             */
            function(error, data) {
                if (error) {
                    sails.log.error(error);

                    next(error);
                } else {
                    var isDone = true;
                    var timeEnd = new Date();
                    var taskPhases = [];

                    _.each(data.tasks, function(task) {
                        if (!task.isDone) {
                            isDone = false;
                            timeEnd = null;
                        }

                        taskPhases.push(task.phaseId);
                    });

                    taskPhases = _.uniq(taskPhases);

                    var updateData = {
                        isDone: isDone,
                        timeEnd: timeEnd,
                        timeStart: data.story.timeStart,
                        updatedUserId: values.updatedUserId ? values.updatedUserId : -1
                    };

                    if (taskPhases.length === 1) {
                        var phase = _.find(data.phases, function(phase) {
                            return phase.id === taskPhases[0];
                        });

                        if (phase && phase.order === 0) {
                            updateData["timeStart"] = null;
                        } else if (!data.story.timeStart || data.story.timeStart == "0000-00-00 00:00:00") {
                            updateData["timeStart"] = new Date();
                        }
                    } else if ((!data.story.timeStart || data.story.timeStart == "0000-00-00 00:00:00")
                        && data.task.timeStart && data.task.timeStart != "0000-00-00 00:00:00") {
                        updateData["timeStart"] = new Date();
                    }

                    processRelatedData(data, updateData);
                }
            }
        );

        /**
         * Private function to process all related data which is attached to current
         * task main. These are following jobs:
         *  1) Update story data and publish updates via socket.
         *  2) Release possible task ownerships
         *
         * @param   {{
         *              story: sails.model.story,
         *              task: sails.model.task,
         *              tasks: sails.model.task[],
         *              phases: sails.model.phase[]
         *          }}      data
         * @param   {{
         *              isDone: Boolean,
         *              timeEnd: null|Date,
         *              timeStart: null|Date,
         *              updatedUserId: Number
         *          }}      updateData
         */
        function processRelatedData(data, updateData) {
            // Make parallel jobs
            async.parallel(
                {
                    // Update story data
                    stories: function(callback) {
                        updateStory(data, updateData, callback);
                    },

                    // Release tasks
                    tasks: function(callback) {
                        releaseTasks(data, callback);
                    }
                },

                /**
                 * Main callback function which is called after all parallel jobs are processed
                 *
                 * @param   {null|Error}    error
                 */
                function(error) {
                    if (error) {
                        sails.log.error(error);
                    }

                    next(error);
                }
            );
        }

        /**
         * Private function to update story data if it needs to be updated.
         *
         * @param   {{
         *              story: sails.model.story,
         *              task: sails.model.task,
         *              tasks: sails.model.task[],
         *              phases: sails.model.phase[]
         *          }}          data
         * @param   {{
         *              isDone: Boolean,
         *              timeEnd: null|Date,
         *              timeStart: null|Date,
         *              updatedUserId: Number
         *          }}          updateData
         * @param   {Function}  next    Callback function to call after releases are done
         */
        function updateStory(data, updateData, next) {
            // We need to update story because data has been changed
            if (data.story.isDone !== updateData.isDone
                || data.story.timeEnd !== updateData.timeEnd
                || data.story.timeStart !== updateData.timeStart
            ) {
                Story
                    .update({id: data.story.id}, updateData, function(error, stories) {
                        if (!error) {
                            _.each(stories, function(story) {
                                Story.publishUpdate(story.id, story.toJSON());
                            });
                        }

                        next(error);
                    });
            } else {
                next(null);
            }
        }

        /**
         * Private function to release task(s) ownership from this sprint. This is only
         * called if task currentUserId is !== 0
         *
         * @param   {{
         *              story: sails.model.story,
         *              task: sails.model.task,
         *              tasks: sails.model.task[],
         *              phases: sails.model.phase[]
         *          }}          data
         * @param   {Function}  next    Callback function to call after releases are done
         */
        function releaseTasks(data, next) {
            if (data.task.currentUserId) {
                // Fetch needed data for release
                async.waterfall(
                    [
                        // Fetch all stories that are attached to this sprint
                        function(callback) {
                            DataService.getStories({sprintId: data.story.sprintId}, function(error, stories) {
                                callback(error, stories);
                            });
                        },

                        // Fetch all tasks that are attached to this sprint and current user is owner
                        function(stories, callback) {
                            var storyIds = _.map(stories, function(story) { return {storyId: story.id}; });

                            DataService.getTasks(
                                {or: storyIds, currentUserId: data.task.currentUserId, id: {'!': data.task.id}},
                                function(error, tasks) {
                                    callback(error, tasks);
                                }
                            );
                        }
                    ],

                    /**
                     * Main callback function which is called after all waterfall jobs
                     * are processed.
                     *
                     * @param   {null|Error}            error   Possible error
                     * @param   {sails.model.task[]}    tasks   Array of tasks that belongs to user
                     */
                    function(error, tasks) {
                        if (error) {
                            next(error);
                        } else {
                            var taskIds = _.map(tasks, function(task) {
                                return {id: task.id};
                            });

                            // We have some task(s) to update
                            if (taskIds.length > 0) {
                                Task
                                    .update(
                                    {or: taskIds},
                                    {currentUserId: 0, updatedUserId: data.task.currentUserId},
                                    function(error, tasks) {
                                        if (!error) {
                                            // Iterate updated tasks and publish updates for those
                                            _.each(tasks, function(task) {
                                                Task.publishUpdate(task.id, task.toJSON());
                                            });
                                        }

                                        next(error);
                                    }
                                );
                            } else {
                                next(null);
                            }
                        }
                    }
                );
            } else {
                next(null);
            }
        }
    }
});
