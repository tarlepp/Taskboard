'use strict';

var _ = require('lodash');

/**
 * /api/services/History.js
 *
 * History service which handles object history write / delete to database. Note that these
 * services are called from models lifecycle callbacks.
 */

/**
 * Method writes new history data. Note that we have to clone actual object otherwise we will
 * mess things up.
 *
 * @param   {String}    objectName  Name of the object eg. Task
 * @param   {{}}        data        Actual object data
 * @param   {String}    message     Extra message for history row
 * @param   {Number}    userId      User id of history row, if not given will user updatedUserId from objectData
 * @param   {Function}  next        Callback function
 */
exports.write = function(objectName, data, message, userId, next) {
    var objectId = data.id;
    var objectData = _.clone(data);

    if (!userId) {
        userId = objectData.updatedUser ? objectData.updatedUser : -1;
    }

    // Remove not needed 'waste' data
    delete objectData.id;
    delete objectData.createdAt;
    delete objectData.updatedAt;

    // Remove all configured data from
    _.each(sails.config.history.ignoreValues, function(value) {
        delete objectData[value];
    });

    // Create new history row
    sails.models['history']
        .create({
            objectId: objectId,
            objectName: objectName,
            objectData: JSON.stringify(objectData),
            user: userId,
            message: message
        })
        .exec(function(error) {
            if (error) {
                sails.log.error(__filename + ':' + __line + ' [Failed to write object history data]');
                sails.log.error(error);
            }

            next(error);
        });
};

/**
 * Method removes all history data of specified object.
 *
 * @param   {String}    objectName  Name of the object eg. Task
 * @param   {Number}    objectId    ID of the object
 * @param   {Function}  next        Callback function
 */
exports.remove = function(objectName, objectId, next) {
    // Remove all history rows
    sails.models['history']
        .destroy({
            objectId: objectId,
            objectName: objectName
        })
        .exec(function(error) {
            if (error) {
                sails.log.error(__filename + ':' + __line + ' [Failed to remove object history data]');
                sails.log.error(error);
            }

            next(error);
        });
};