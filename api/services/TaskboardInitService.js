/**
 * /api/services/TaskboardInitService.js
 *
 * Taskboard init service. This is called only from config/bootstrap.js file on lifting sails.
 */
"use strict";

var async = require("async");

/**
 * Main taskboard app initialize method. Basically this will do following jobs:
 *
 *  - Create admin user, if he/she doesn't exists
 *  - Task types, if those doesn't exists already
 *
 * Each of these jobs are done in separate TaskboardInitService methods.
 *
 * @param   {Function}  next    Callback function that must be called after all jobs.
 */
exports.init = function(next) {
    // Call all necessary init jobs parallel
    async.parallel(
        {
            // Create admin user account
            admin: function(callback) {
                TaskboardInitService.createAdmin(callback);
            },

            // Create default task types
            types: function(callback) {
                TaskboardInitService.createTypes(callback);
            }
        },

        /**
         * Callback function which is been called after all parallel jobs are processed.
         *
         * @param   {Error} error
         * @param   {{}}    results
         */
        function(error, results) {
            next(error);
        }
    );
};

/**
 * This method creates admin user to database if it doesn't exists already.
 *
 * @param   {Function}  next    Callback function to call after jobs
 */
exports.createAdmin = function(next) {
    User
        .findOne({username: "admin"})
        .done(function(error, user) {
            if (error) {
                next(error, null);
            } else if (!user) {
                User
                    .create({
                        username: "admin",
                        firstName: "John",
                        lastName: "Doe",
                        email: "john.doe@localhost.com",
                        admin: true,
                        password: "johndoeistheadmin"
                    })
                    .done(function(error, user) {
                        next(error, user);
                    });
            } else {
                next(null, true);
            }
        });
};

/**
 * This method creates admin user to database if it doesn't exists already.
 *
 * @param   {Function}  next    Callback function to call after jobs
 */
exports.createTypes = function(next) {
    Type
        .find()
        .done(function(error, types) {
            if (error) {
                next(error, null);
            } else if (_.size(types) === 0) {
                // Specify "default" type data
                var defaultTypes = [
                    {title: "Task", order: "1", class: "alert alert-warning", classText: "text-warning"},
                    {title: "Test", order: "2", class: "alert alert-success", classText: "text-success"},
                    {title: "Bug",  order: "3", class: "alert alert-danger",  classText: "text-danger"}
                ];

                // Create default types and pass those to callback function
                async.map(
                    defaultTypes,
                    function(type, callback) {
                        Type
                            .create(type)
                            .done(function(error, type) {
                                callback(error, type);
                            });
                    },
                    function(error, types) {
                        next(error, types)
                    }
                )
            } else {
                next(null, types);
            }
        });
};