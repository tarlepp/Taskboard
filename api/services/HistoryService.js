/**
 * /api/services/HistoryService.js
 *
 * History service which handles object history write / delete to database. Note that these
 * services just "run" when
 */
"use strict";

/**
 * Method writes new history data. Note that we have to clone actual object otherwise we will mess things up.
 *
 * @param   {String}    objectName  Name of the object eg. Task
 * @param   {{}}        object      Actual object data
 * @param   {String}    [message]   Extra message for history row
 * @param   {Number}    [userId]    User id of history row, if not given will user updatedUserId from objectData
 */
exports.write = function(objectName, object, message, userId) {
    var objectId = object.id;
    var objectData = _.clone(object);

    if (!userId) {
        userId = objectData.updatedUserId ? objectData.updatedUserId : -1;
    }

    // Remove not needed "waste" data
    delete objectData.id;
    delete objectData.createdAt;
    delete objectData.updatedAt;

    // Remove all configured data from
    _.each(sails.config.history.ignoreValues, function(value) {
        delete objectData[value];
    });

    // Create new history row
    History
        .create({
            objectId: objectId,
            objectName: objectName,
            objectData: JSON.stringify(objectData),
            userId: userId,
            message: message
        })
        .exec(function(error) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to write object history data]");
                sails.log.error(error);
            }
        });
};

/**
 * Method removes all history data of specified object.
 *
 * @param   {String}    objectName  Name of the object eg. Task
 * @param   {Number}    objectId    ID of the object
 */
exports.remove = function(objectName, objectId) {
    // Remove all history rows
    History
        .destroy({
            objectId: objectId,
            objectName: objectName
        })
        .exec(function(error) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to remove object history data]");
                sails.log.error(error);
            }
        });
};
