/**
 * /api/services/DateService.js
 *
 * Generic date service which contains helper methods for date and time handling.
 */
"use strict";

var moment = require("moment-timezone");
var fs = require("fs");

/**
 * Method converts given date object to real UTC date (actually moment) object.
 *
 * @param   {Date}  date    Date object convert
 *
 * @returns {moment}
 */
exports.convertDateObjectToUtc = function(date) {
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
 * objects which can be used easily everywhere in application!
 *
 * @returns {[]}    Array of timezone data
 */
exports.getTimezones = function() {
    var timezoneData = JSON.parse(fs.readFileSync("node_modules/moment-timezone/moment-timezone.json", "utf8"));
    var timezones = [];

    _.each(timezoneData.links, function(value, key) {
        timezones.push({
            key: key,
            name: value
        });
    });

    return _.uniq(_.sortBy(timezones, "name"), false, function(timezone) {
        return timezone.name;
    });
};
