/**
 * /api/services/DateService.js
 *
 * Generic date service.
 */
"use strict";

var moment = require("moment-timezone");
var fs = require("fs");

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
 * @param   {Date}      date        Date object convert
 * @param   {Boolean}   [noTime]    Set true if you're handling only dates
 *
 * @returns {Date}
 */
exports.convertDateObjectToUtc = function(date, noTime) {
    noTime = noTime || false;

    return moment(date).tz("Etc/Universal");
};

/**
 * Helper method to return current time as an UTC time.
 *
 * @returns {Date}
 */
exports.getCurrentDateAsUtc = function() {
    var now = new Date();

    return new Date(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
    );
};

/**
 * Method returns available timezones. Data is read from moment-timezone.json and parsed to array of
 * objects which can be used easily every where in application!
 *
 * @returns {Array}
 */
exports.getTimezones = function() {
    var timezoneData = JSON.parse(fs.readFileSync('node_modules/moment-timezone/moment-timezone.json', 'utf8'));
    var timezones = [];

    _.each(timezoneData.links, function(value, key) {
        timezones.push({
            key: key,
            name: value
        });
    });

    return _.uniq(_.sortBy(timezones, "name"), false, function(timezone) { return timezone.name; } );
};
