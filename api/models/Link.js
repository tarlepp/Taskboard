/**
 * Link
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
"use strict";

var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
    attributes: {
        // Name of the object where link is attached, Story or Task
        objectName: {
            type:       "string",
            required:   true
        },
        // Object id where link is attached
        objectId: {
            type:       "integer",
            required:   true
        },
        // Source external link id
        externalLinkId: {
            type:       "integer",
            required:   true
        },
        // Used parameters for external link
        parameters: {
            type:       "json",
            required:   true
        },
        // Parsed link name
        name: {
            type:       "string",
            required:   true
        },
        // Parsed link URL
        link: {
            type:       "string",
            required:   true
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.link}  values
     * @param   {Function}          next
     */
    afterCreate: function(values, next) {
        var message = "Added link <a hreg='" + values.link + "' target='_blank'>" + values.link + "</a>";

        switch (values.objectName) {
            case "Story":
                DataService.getStory(values.objectId, function(error, story) {
                    if (!error) {
                        Story.publishUpdate(story.id, story.toJSON());

                        HistoryService.write("Story", story.toJSON(), message, values.updatedUserId);
                    }

                    next(error);
                });
                break;
            case "Task":
                DataService.getTask(values.objectId, function(error, task) {
                    if (!error) {
                        Task.publishUpdate(task.id, task.toJSON());

                        HistoryService.write("Task", task.toJSON(), message, values.updatedUserId);
                    }

                    next(error);
                });
                break;
            default:
                next();
                break;
        }
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.link}  values
     * @param   {Function}          next
     */
    afterUpdate: function(values, next) {
        var message = "Updated link <a hreg='" + values.link + "' target='_blank'>" + values.link + "</a>";

        switch (values.objectName) {
            case "Story":
                DataService.getStory(values.objectId, function(error, story) {
                    if (!error) {
                        Story.publishUpdate(story.id, story.toJSON());

                        HistoryService.write("Story", story.toJSON(), message, values.updatedUserId);
                    }

                    next(error);
                });
                break;
            case "Task":
                DataService.getTask(values.objectId, function(error, task) {
                    if (!error) {
                        Task.publishUpdate(task.id, task.toJSON());

                        HistoryService.write("Task", task.toJSON(), message, values.updatedUserId);
                    }

                    next(error);
                });
                break;
            default:
                next();
                break;
        }
    },

    /**
     * Before validation callback.
     *
     * @param   {sails.model.link}  values
     * @param   {Function}          next
     */
    beforeValidation: function(values, next) {
        // Fetch external link object
        DataService.getProjectLink(values.externalLinkId, function(error, linkObject) {
            if (!error) {
                var link = linkObject.link;
                var bits = [];

                // Iterate parameters and make necessary replaces in actual link
                _.each(values.parameters, function(value, search) {
                    link = link.replace(search, value);

                    bits.push(value);
                });

                values.link = link;
                values.name = bits.join(",");
            }

            next(error);
        });
    },

    /**
     * Before destroy callback.
     *
     * @param   {{}}        terms
     * @param   {Function}  next
     */
    beforeDestroy: function(terms, next) {
        DataService.getLink(terms, function(error, link) {
            if (!error) {
                var message = "Removed link <a hreg='" + link.link + "' target='_blank'>" + link.link + "</a>";

                switch (link.objectName) {
                    case "Story":
                        DataService.getStory(link.objectId, function(error, story) {
                            if (!error) {
                                Story.publishUpdate(story.id, story.toJSON());

                                HistoryService.write("Story", story.toJSON(), message, link.updatedUserId);
                            }

                            next(error);
                        });
                        break;
                    case "Task":
                        DataService.getTask(link.objectId, function(error, task) {
                            if (!error) {
                                Task.publishUpdate(task.id, task.toJSON());

                                HistoryService.write("Task", task.toJSON(), message, link.updatedUserId);
                            }

                            next(error);
                        });
                        break;
                    default:
                        next();
                        break;
                }
            } else {
                next(error);
            }
        });
    }
});
