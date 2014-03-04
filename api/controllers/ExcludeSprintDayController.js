/**
 * ExcludeSprintDayController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
"use strict";

var async = require("async");

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ExcludeSprintDayController)
     */
    _config: {},

    /**
     * Main action for sprint exclude days GUI. Within this GUI project managers can add
     * specified days to be ignored in specified sprint. These days will affect mainly to
     * sprint burndown chart and task duration calculations.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    index: function(request, response) {
        var sprintId = parseInt(request.param("sprintId"), 10);

        // Make parallel jobs to fetch needed data
        async.parallel(
            {
                // Fetch sprint data
                sprint: function(callback) {
                    DataService.getSprint(sprintId, callback);
                },

                // Fetch sprint exclude days
                excludeDays: function(callback) {
                    DataService.getSprintExcludeDays(sprintId, callback);
                },

                // Fetch users
                users: function(callback) {
                    DataService.getUsers({}, callback);
                },

                // Fetch admin right
                hasAdmin: function(callback) {
                    AuthService.hasSprintAdmin(request.user, sprintId, callback);
                }
            },

            /**
             * Main callback function which is called after all parallel jobs are processed.
             *
             * @param   {Error} error   Possible error object
             * @param   {{}}    data    Data object that contains all parallel fetched data
             */
            function(error, data) {
                if (error) {
                    response.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    // Add author to each sprint exclude day object
                    _.each(data.excludeDays, function(day) {
                        day.author = _.find(data.users, function(user) { return user.id === day.createdUserId; });
                    });

                    response.view(data);
                }
            }
        );
    }
};
