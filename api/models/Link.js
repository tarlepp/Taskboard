/**
 * Link
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
"use strict";

module.exports = {
    attributes: {
        // Name of the object where link is attached
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
        },
        createdUserId: {
            type:       "integer",
            required:   true
        },
        updatedUserId: {
            type:       "integer",
            required:   true
        },
        createdAtObject: function () {
            return (this.createdAt && this.createdAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        updatedAtObject: function () {
            return (this.updatedAt && this.updatedAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.externalLink}  values
     * @param   {Function}                  callback
     */
    afterCreate: function(values, callback) {
        var message = "Added link <a hreg='" + values.link + "' target='_blank'>" + values.link + "</a>";

        switch (values.objectName) {
            case "Story":
                DataService.getStory(values.objectId, function(error, story) {
                    if (error) {
                        callback(error);
                    } else {
                        Story.publishUpdate(story.id, story.toJSON());

                        HistoryService.write("Story", story.toJSON(), message);

                        callback();
                    }
                });
                break;
            case "Task":
                DataService.getTask(values.objectId, function(error, task) {
                    if (error) {
                        callback(error);
                    } else {
                        Task.publishUpdate(task.id, task.toJSON());

                        HistoryService.write("Task", task.toJSON(), message);

                        callback();
                    }
                });
                break;
            default:
                callback();
                break;
        }
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.externalLink}  values
     * @param   {Function}                  callback
     */
    afterUpdate: function(values, callback) {
        var message = "Updated link <a hreg='" + values.link + "' target='_blank'>" + values.link + "</a>";

        switch (values.objectName) {
            case "Story":
                DataService.getStory(values.objectId, function(error, story) {
                    if (error) {
                        callback(error);
                    } else {
                        Story.publishUpdate(story.id, story.toJSON());

                        HistoryService.write("Story", story.toJSON(), message);

                        callback();
                    }
                });
                break;
            case "Task":
                DataService.getTask(values.objectId, function(error, task) {
                    if (error) {
                        callback(error);
                    } else {
                        Task.publishUpdate(task.id, task.toJSON());

                        HistoryService.write("Task", task.toJSON(), message);

                        callback();
                    }
                });
                break;
            default:
                callback();
                break;
        }
    },

    /**
     * Before validation callback.
     *
     * @param   {sails.model.link}  values
     * @param   {Function}          callback
     */
    beforeValidation: function(values, callback) {
        // Fetch external link object
        DataService.getProjectLink(values.externalLinkId, function(error, linkObject) {
            if (error) {
                callback(error);
            } else {
                var link = linkObject.link;
                var bits = [];

                // Iterate parameters and make necessary replaces in actual link
                _.each(values.parameters, function(value, search) {
                    link = link.replace(search, value);

                    bits.push(value);
                });

                values.link = link;
                values.name = bits.join(",");

                callback();
            }
        });
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  callback
     */
    beforeDestroy: function(terms, callback) {
        Link
            .findOne(terms)
            .exec(function(error, link) {
                if (error) {
                    sails.log.error(error);

                    callback(error);
                } else if (link) {
                    var message = "Removed link <a hreg='" + link.link + "' target='_blank'>" + link.link + "</a>";

                    switch (link.objectName) {
                        case "Story":
                            DataService.getStory(link.objectId, function(error, story) {
                                if (error) {
                                    callback(error);
                                } else {
                                    Story.publishUpdate(story.id, story.toJSON());

                                    HistoryService.write("Story", story.toJSON(), message);

                                    callback();
                                }
                            });
                            break;
                        case "Task":
                            DataService.getTask(link.objectId, function(error, task) {
                                if (error) {
                                    callback(error);
                                } else {
                                    Task.publishUpdate(task.id, task.toJSON());

                                    HistoryService.write("Task", task.toJSON(), message);

                                    callback();
                                }
                            });
                            break;
                        default:
                            callback();
                            break;
                    }
                } else {
                    callback();
                }
            });
    }
};
