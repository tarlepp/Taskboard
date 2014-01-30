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

module.exports = {
    schema: true,
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
        title: {
            type:       "string",
            required:   true,
            minLength:  5
        },
        description: {
            type:       "text",
            defaultsTo: ""
        },
        priority: {
            type:       "integer",
            defaultsTo: 0
        },
        isDone: {
            type:       "boolean",
            required:   true,
            defaultsTo: 0
        },
        timeStart: {
            type:       "datetime"
        },
        timeEnd: {
            type:       "datetime"
        },
        createdUserId: {
            type:       "integer",
            required:   true
        },
        updatedUserId: {
            type:       "integer",
            required:   true
        },

        // Dynamic data attributes

        objectTitle: function() {
            return this.title;
        },
        createdAtObject: function () {
            return (this.createdAt && this.createdAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        updatedAtObject: function () {
            return (this.updatedAt && this.updatedAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        },
        timeStartObject: function() {
            return (this.timeStart && this.timeStart != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.timeStart) : null;
        },
        timeEndObject: function() {
            var date = (this.timeEnd && this.timeEnd != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.timeEnd) : null;

            // This check is needed for avoid broken data, see this
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
     * @param   {Function}          cb
     */
    beforeCreate: function(values, cb) {
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

                    cb(error);
                } else {
                    values.priority = (task[0]) ? task[0].priority + 1 : 1;

                    cb();
                }
            });
    },

    /**
     * Before update callback we want to check desired phase id isDone bit and
     * update task data with that.
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          cb
     */
    beforeUpdate: function(values, cb) {
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
                 * Main callback function which is called after all specified parallel
                 * jobs are done.
                 *
                 * @param   {Error|null}    error
                 * @param   {{}}            data
                 */
                function (error, data) {
                    if (error) {
                        sails.log.error(error);

                        cb(error);
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

                        cb();
                    }
                }
            );
        } else {
            cb();
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
     * @param   {Function}  cb
     */
    beforeDestroy: function(taskId, cb) {
        async.waterfall(
            [
                /**
                 * Fetch task data.
                 *
                 * @param   {Function}  callback
                 */
                function(callback) {
                    DataService.getTask(taskId, function(error, task) {
                        callback(error, task);
                    });
                },

                /**
                 * Fetch all task data
                 *
                 * @param   {sails.model.task}  task
                 * @param   {Function}          callback
                 */
                function(task, callback) {
                    var where = {
                        storyId: task.storyId,
                        id: {"!": task.id}
                    };

                    DataService.getTasks(where, function(error, tasks) {
                        callback(error, task, tasks);
                    })
                }
            ],

            /**
             * Main callback function which is called after all waterfall jobs are done.
             *
             * @param   {Error|null}            error
             * @param   {sails.model.task}      task
             * @param   {sails.model.task[]}    tasks
             */
            function(error, task, tasks) {
                if (error) {
                    sails.log.error(error);

                    cb(error);
                } else {
                    HistoryService.remove("Task", task.id);
                    PhaseDurationService.remove({taskId: task.id});

                    var isDone = true;
                    var timeEnd = null;

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

                    if (isDone) {
                        timeEnd = new Date();
                    }

                    Story
                        .update(
                            {id: task.storyId},
                            {isDone: isDone, timeEnd: timeEnd},
                            function(error, /** sails.model.story[] */stories) {
                                if (error) {
                                    sails.log.error(error);

                                    cb(error);
                                } else {
                                    _.each(stories, function(story) {
                                        Story.publishUpdate(story.id, story.toJSON());
                                    });

                                    cb();
                                }
                            }
                        );
                }
            }
        );
    },

    /**
     * After task creation we can set current story automatic to not done status (isDone = false).
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write("Task", values);

        PhaseDurationService.write(values);

        // Update story data
        Story
            .update(
                {id: values.storyId},
                {isDone: 0, timeEnd: null, updatedUserId: values.updatedUserId ? values.updatedUserId : -1},
                function(error, /** sails.model.story[] */stories) {
                    if (error) {
                        sails.log.error(error);

                        cb(error);
                    } else {
                        _.each(stories, function(story) {
                            Story.publishUpdate(story.id, story.toJSON());
                        });

                        cb();
                    }
                }
            );
    },

    /**
     * After update callback. In this we want to check 'isDone' bit for all task which
     * are attached to same user story as updated.
     *
     * If all task are done (isDone === true) we can update current story as done.
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          cb
     */
    afterUpdate: function(values, cb) {
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
             * @param   {Error|null}    error
             * @param   {{}}            data
             */
            function (error, data) {
                if (error) {
                    sails.log.error(error);

                    cb(error);
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
                        updatedUserId: values.updatedUserId ? values.updatedUserId : -1
                    };

                    if (taskPhases.length === 1) {
                        DataService.getPhase(taskPhases[0], function(error, phase) {
                            if (error) {
                                cb(error);
                            } else if (phase.order == 0) {
                                updateData["timeStart"] = null;
                            }

                            processRelatedData(data, updateData);
                        });
                    } else if ((!data.story.timeStart || data.story.timeStart == "0000-00-00 00:00:00")
                        && data.task.timeStart && data.task.timeStart != "0000-00-00 00:00:00") {
                        updateData["timeStart"] = new Date();

                        processRelatedData(data, updateData);
                    } else {
                        processRelatedData(data, updateData);
                    }
                }
            }
        );

        /**
         * Private function to process all related data which is attached to current
         * task main. These are following jobs:
         *  1) Update story data and publish updates via socket.
         *  2) Release possible task ownerships
         *
         * @param   {{}}    data
         * @param   {{}}    updateData
         */
        function processRelatedData(data, updateData) {
            // Make parallel jobs
            async.parallel(
                {
                    // Update story data
                    stories: function(callback) {
                        Story
                            .update({id: data.story.id}, updateData, function(error, stories) {
                                if (error) {
                                    sails.log.error(error);

                                    callback(error, null);
                                } else {
                                    _.each(stories, function(story) {
                                        Story.publishUpdate(story.id, story.toJSON());
                                    });

                                    callback(null, stories);
                                }
                            });
                    },

                    // Release tasks
                    tasks: function(callback) {
                        if (data.task.currentUserId) {
                            releaseTasks(data, callback);
                        } else {
                            callback(null, true);
                        }
                    }
                },

                /**
                 * Main callback function which is called after all parallel
                 * jobs are processed
                 *
                 * @param   {null|Error}    error
                 * @param   {null|{}}       data
                 */
                function(error, data) {
                    cb(error);
                }
            );
        }

        /**
         * Private function to release task(s) ownership from this sprint. This is only
         * called if task currentUserId is !== 0
         *
         * @param   {{}}        data    Main data set
         * @param   {Function}  next    Callback function to call after releases are done
         */
        function releaseTasks(data, next) {
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
                                callback(error, stories, tasks);
                            }
                        );
                    }
                ],

                /**
                 * Main callback function which is called after all waterfall jobs
                 * are processed.
                 *
                 * @param   {null|Error}            error
                 * @param   {sails.model.story[]}   stories
                 * @param   {sails.model.task[]}    tasks
                 */
                function(error, stories, tasks) {
                    if (error) {
                        next(error, null);
                    } else {
                        var taskIds = _.map(tasks, function(task) { return {id: task.id}; });

                        // We have some task(s) to update
                        if (taskIds.length > 0) {
                            Task
                                .update(
                                {or: taskIds},
                                {currentUserId: 0, updatedUserId: data.task.currentUserId},
                                function(error, tasks) {
                                    if (error) {
                                        next(error, null);
                                    } else {
                                        // Iterate updated tasks and publish updates for those
                                        _.each(tasks, function(task) {
                                            Task.publishUpdate(task.id, task.toJSON());
                                        });

                                        next(null, tasks);
                                    }
                                }
                            );
                        } else {
                            next(null, []);
                        }
                    }
                }
            );
        }
    }
};
