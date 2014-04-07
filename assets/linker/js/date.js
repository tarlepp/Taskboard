/**
 * /assets/linker/js/date.js
 *
 * @file Common date and datetime javascript functions that are used in Taskboard application.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */
"use strict";

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

    return moment(new Date(dateString)).tz("Etc/Universal");
}
