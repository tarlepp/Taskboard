/**
 * /api/services/HistoryService.js
 *
 * History service.
 */

/**
 * Method writes new history data. Note that we have to clone actual object
 * otherwise we will mess things up.
 *
 * @param   {String}    objectName  Name of the object eg. Task
 * @param   {Object}    object      Actual object
 * @param   {String}    message     Extra message for history row
 */
exports.write = function(objectName, object, message) {
    var objectId = object.id;
    var objectData = _.clone(object);
    var userId = objectData.updatedUserId ? objectData.updatedUserId : -1;

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
        .exec(function(error, data) {
            if (error) {
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
        .exec(function(error, data) {
            if (error) {
                sails.log.error(error);
            }
        });
};
