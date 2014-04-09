/**
 * ExternalLink
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
"use strict";

var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
    attributes: {
        // Reference to project
        projectId: {
            type:       "integer",
            required:   true
        },
        // Link title
        title: {
            type:       "string",
            required:   true,
            minLength:  4
        },
        // Description of the link
        description: {
            type:       "text",
            defaultsTo: ""
        },
        // Actual link with parameters on it, like http://foo.bar/:someParam
        link: {
            type:       "string",
            required:   true
        },
        // Link parameters as an JSON object
        parameters: {
            type:       "json",
            required:   true
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.externalLink}  values
     * @param   {Function}                  next
     */
    afterCreate: function(values, next) {
        HistoryService.write("ExternalLink", values);

        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.externalLink}  values
     * @param   {Function}                  next
     */
    afterUpdate: function(values, next) {
        HistoryService.write("ExternalLink", values);

        next();
    },

    /**
     * Before validation callback.
     *
     * @param   {sails.model.externalLink}  values
     * @param   {Function}                  next
     */
    beforeValidation: function(values, next) {
        var regExp = /:\w+/g;
        var parameters = values.link.match(regExp);

        if (parameters) {
            values.parameters = parameters;

            next();
        } else {
            next("No link parameters.");
        }
    },

    /**
     * Before destroy callback.
     *
     * @param   {{}}        terms
     * @param   {Function}  next
     */
    beforeDestroy: function(terms, next) {
        ExternalLink
            .findOne(terms)
            .exec(function(error, externalLink) {
                if (error) {
                    sails.log.error(error);

                    next(error);
                } else if (externalLink) {
                    HistoryService.remove("ExternalLink", externalLink.id);

                    // Remove related links
                    Link
                        .destroy({externalLinkId: externalLink.id})
                        .exec(function(error) {
                            if (error) {
                                sails.log.error(error);
                            }

                            next(error);
                        });
                } else {
                    next();
                }
            });
    }
});
