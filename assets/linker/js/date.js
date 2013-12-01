/**
 * /assets/linker/js/date.js
 *
 * @file Common date and datetime javascript functions that are used in Taskboard application.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */

/**
 * Function converts specified date string to moment object. Note that returned moment
 * object is set to UTC time so you must convert data to specified timezone if needed.
 *
 * @param   {String|Object|null}    dateString
 * @returns {null|moment}
 */
function dateConvertToMoment(dateString) {
    if (typeof dateString !== "string") {
        return null;
    }

    var dateObject = new Date(dateString);

    return moment(
        new Date(
            Date.UTC(
                dateObject.getFullYear(),
                dateObject.getMonth(),
                dateObject.getDate(),
                dateObject.getHours(),
                dateObject.getMinutes(),
                dateObject.getSeconds()
            )
        )
    ).tz("Etc/Universal");
}
