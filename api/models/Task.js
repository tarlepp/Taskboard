/**
 * Task
 *
 * @module      ::  Model
 * @description ::  Model represents single task on taskboard. Tasks are attached to specified user story, phase,
 *                  type and user.
 */
var jQuery = require('jquery');

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
        isDone: {
            type:       'boolean',
            required:   true,
            defaultsTo: 0
        }
    },

    // Lifecycle Callbacks

    /**
     * Before create callback.
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          cb
     */
    beforeCreate: function(values, cb) {
        values.isDone = false;

        cb();
    },

    /**
     * Before update callback we want to check desired phase id isDone bit and
     * update task data with that.
     *
     * @param   {sails.model.task}  values
     * @param   {Function}          cb
     */
    beforeUpdate: function(values, cb) {
        Phase
            .findOne(values.phaseId)
            .done(function(error, /** sails.model.phase */phase) {
                if (error) {
                    cb(error)
                } else {
                    values.isDone = (!phase) ? 0 : phase.isDone;

                    cb();
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
        // Update story data
        Story
            .update(
                {id: values.storyId},
                {isDone: 0},
                function(error, /** sails.model.story[] */stories) {
                    if (error) {
                        cb(error);
                    } else {
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
        Task
            .find()
            .where({storyId: values.storyId})
            .done(function(error, /** sails.model.task[] */tasks) {
                var isDone = true;

                jQuery.each(tasks, function(key, /** sails.model.task */task) {
                    if (!task.isDone) {
                        isDone = false;
                    }
                });

                // Update story data
                Story
                    .update(
                        {id: values.storyId},
                        {isDone: isDone},
                        function(error, /** sails.model.story[] */stories) {
                            if (error) {
                                cb(error);
                            } else {
                                cb();
                            }
                    });
            });
    }
};
