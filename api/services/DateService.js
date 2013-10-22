/**
 * /api/services/DateService.js
 *
 * Generic date service.
 */
"use strict";

var moment = require("moment-timezone");

/**
 * Method converts UTC date object to local date object
 *
 * @todo    refactor this...
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

/**
 * Method converts given date object to real UTC date object. This is required
 * for moment.js library to work.
 *
 * @param   {Date}  date    Date object convert
 *
 * @returns {Date}
 */
exports.convertDateObjectToUtc = function(date) {
    return moment(new Date(
            Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
            )
        )
    );
};