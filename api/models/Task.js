/**
 * Task
 *
 * @module      ::  Model
 * @description ::  Model represents single task on taskboard. Tasks are attached to specified user story, phase,
 *                  type and user.
 */
var jQuery = require("jquery");
var async = require("async");
var moment = require("moment-timezone");

module.exports = {
    schema: true,
    attributes: {
        // Relation to Story model
        storyId: {
            type:       'integer',
            required:   true
        },
        // Relation to User model
        userId: {
            type:       'integer',
            defaultsTo: 0
        },
        // Relation to Phase model
        phaseId: {
            type:       'integer',
            required:   true,
            defaultsTo: 0
        },
        // Relation to Type model
        typeId: {
            type:       'integer',
            required:   true,
            defaultsTo: 1
        },
        title: {
            type:       'string',
            required:   true,
            minLength:  5
        },
        description: {
            type:       'text',
            defaultsTo: ''
        },
        priority: {
            type:       'integer',
            defaultsTo: 0
        },
        isDone: {
            type:       'boolean',
            required:   true,
            defaultsTo: 0
        },
        timeStart: {
            type:       'datetime'
        },
        timeEnd: {
            type:       'datetime'
        },

        objectTitle: function() {
            return this.title;
        },
        createdAtObject: function () {
            return (this.createdAt && this.createdAt != '0000-00-00')
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        updatedAtObject: function () {
            return (this.updatedAt && this.updatedAt != '0000-00-00')
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        },
        timeStartObject: function() {
            return (this.timeStart && this.timeStart != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.timeStart) : null;
        },
        timeEndObject: function() {
            return (this.timeEnd && this.timeEnd != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.timeEnd) : null;
        },
        timeDuration: function() {
            var output;

            if (moment.isMoment(this.timeStartObject()) && moment.isMoment(this.timeEndObject())) {
                output = this.timeEndObject().diff(this.timeStartObject(), 'seconds');
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
     * Before create callback. Basically we just want to make sure that isDone bit is set to false.
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
            .done(function(error, task) {
                if (error) {
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
                function (error, data) {
                    if (error) {
                        cb(error);
                    } else {
                        values.isDone = data.phase.isDone;
                        values.timeEnd = values.isDone ? new Date() : null;

                        // Task is updated to first phase, so set start and end times to null
                        if (data.phase.order === 0) {
                            values.timeStart = null;
                            values.timeEnd = null;
                        } else if (values.phaseId !== data.task.phaseId // We can assume that this update is from the board, so set start time if needed
                            && (!data.task.timeStart || data.task.timeStart == '0000-00-00 00:00:00')
                        ) {
                            values.timeStart = new Date();
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
        Task
            .findOne(taskId)
            .done(function(error, /** sails.model.task */task) {
                if (error) {
                    cb(error)
                } else {
                    HistoryService.remove('Task', task.id);

                    Task
                        .find()
                        .where({storyId: task.storyId})
                        .where({id: {'!': task.id}})
                        .done(function(error, /** sails.model.task[] */tasks) {
                            var isDone = true;
                            var timeEnd = null;

                            if (_.size(tasks) > 0) {
                                // Iterate story tasks
                                jQuery.each(tasks, function(key, /** sails.model.task */task) {
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

                            // Update story data
                            Story
                                .update(
                                    {id: task.storyId},
                                    {isDone: isDone, timeEnd: timeEnd},
                                    function(error, /** sails.model.story[] */stories) {
                                        if (error) {
                                            cb(error);
                                        } else {
                                            _.each(stories, function(story) {
                                                Story.publishUpdate(story.id, story.toJSON());
                                            });

                                            cb();
                                        }
                                });
                        });
                }
            });
    },

    /**
     * After task creation we can set current story automatic to not done status (isDone = false).
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write('Task', values);

        // Update story data
        Story
            .update(
                {id: values.storyId},
                {isDone: 0, timeEnd: null},
                function(error, /** sails.model.story[] */stories) {
                    if (error) {
                        cb(error);
                    } else {
                        _.each(stories, function(story) {
                            Story.publishUpdate(story.id, story.toJSON());
                        });

                        cb();
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
     * @param   {Function}          cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write('Task', values);

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
            function (error, data) {
                if (error) {
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
                        timeEnd: timeEnd
                    };

                    if (taskPhases.length === 1) {
                        DataService.getPhase(taskPhases[0], function(error, phase) {
                            if (error) {
                                cb(error);
                            } else if (phase.order == 0) {
                                updateData['timeStart'] = null;
                            }

                            updateStory(data, updateData);
                        });
                    } else if ((!data.story.timeStart || data.story.timeStart == '0000-00-00 00:00:00')
                        && data.task.timeStart && data.task.timeStart != '0000-00-00 00:00:00') {
                        updateData['timeStart'] = new Date();

                        updateStory(data, updateData);
                    } else {
                        updateStory(data, updateData);
                    }
                }
            }
        );

        function updateStory(data, updateData) {
            var where = {id: data.story.id};

            Story
                .update(where, updateData, function(error, stories) {
                    if (error) {
                        cb(error);
                    } else {
                        _.each(stories, function(story) {
                            Story.publishUpdate(story.id, story.toJSON());
                        });

                        cb();
                    }
                });
        }
    }
};
