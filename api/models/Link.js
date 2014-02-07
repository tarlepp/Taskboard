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
    }
};
