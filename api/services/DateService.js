/**
 * /api/services/DateService.js
 *
 * Generic date service.
 */

/**
 * Method converts UTC date object to local date object
 *
 * @param   {Date}  date
 *
 * @returns {Date}
 */
exports.convertUTCDateToLocalDate = function(date) {
    var newDate = new Date(date.getTime());
    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
};