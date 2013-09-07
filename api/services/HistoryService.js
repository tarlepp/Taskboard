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
 */
exports.write = function(objectName, object) {
    var objectId = object.id;
    var objectData = _.clone(object);

    // Remove not needed "waste" data
    delete objectData.id;
    delete objectData.createdAt;
    delete objectData.updatedAt;

    // Create new history row
    History
        .create({
            objectId: objectId,
            objectName: objectName,
            objectData: JSON.stringify(objectData)
        })
        .done(function(error, data) {
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
        .done(function(error, data) {
        });
};
