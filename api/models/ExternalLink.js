/**
 * ExternalLink
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
"use strict";

module.exports = {
    schema: true,
    attributes: {
        projectId: {
            type:       "integer",
            required:   true
        },
        title: {
            type:       "string",
            required:   true,
            minLength:  4
        },
        description: {
            type:       "text",
            defaultsTo: ""
        },
        link: {
            type:       "string",
            required:   true
        },
        parameters: {
            type:       "json",
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

        // Dynamic model data attributes

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
        HistoryService.write("ExternalLink", values);

        callback();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.externalLink}  values
     * @param   {Function}                  callback
     */
    afterUpdate: function(values, callback) {
        HistoryService.write("ExternalLink", values);

        callback();
    },

    /**
     * Before validation callback.
     *
     * @param   {sails.model.externalLink}  values
     * @param   {Function}                  callback
     */
    beforeValidation: function(values, callback) {
        var regExp = /:\w+/g;
        var parameters = values.link.match(regExp);

        if (parameters) {
            values.parameters = parameters;

            callback();
        } else {
            callback("No link parameters.");
        }
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  callback
     */
    beforeDestroy: function(terms, callback) {
        ExternalLink
            .findOne(terms)
            .exec(function(error, externalLink) {
                if (error) {
                    sails.log.error(error);
                } else {
                    HistoryService.remove("ExternalLink", externalLink.id);
                }

                callback();
            });
    }
};
