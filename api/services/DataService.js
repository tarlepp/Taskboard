/**
 * /api/services/DataService.js
 *
 * Generic data service, which is used to fetch generic data and call defined callback after data fetching.
 * This contains basically all data fetch that Taskboard needs. Services contains fetch of one and multiple
 * objects.
 *
 * Single object fetch:
 *  get{ObjectName}(terms, next, [noExistCheck])
 *
 * Multiple object fetch
 *  get{ObjectName}s(terms, next)
 *
 * All data service methods will write error log if some error occurs. In all cases callback function 'next'
 * is called with two arguments: possible error and actual result.
 *
 * Note that with multiple object fetch service will attach "default" sort conditions for results.
 *
 * @todo    how about .populate("foo") these should be handled someway...
 */
"use strict";

/**
 * Service to fetch single user data from database.
 *
 * @param   {Number|{}} where           Used query conditions
 * @param   {Function}  next            Callback function to call after query
 * @param   {Boolean}   [noExistsCheck] If data is not found, skip error
 */
exports.getUser = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    User
        .findOne(where)
        .exec(function(error, /** sails.model.user */ user) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch user data]");
                sails.log.error(error);
            } else if (!user && !noExistsCheck) {
                error = new Error();

                error.message = "User not found.";
                error.status = 404;
            }

            next(error, user);
        });
};

/**
 * Service to fetch user data from database.
 *
 * @param   {{}}        where   Used query conditions
 * @param   {Function}  next    Callback function to call after query
 */
exports.getUsers = function(where, next) {
    User
        .find()
        .where(where)
        .sort("lastName ASC")
        .sort("firstName ASC")
        .sort("username ASC")
        .exec(function(error, users) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch user data]");
                sails.log.error(error);
            }

            next(error, users);
        });
};
