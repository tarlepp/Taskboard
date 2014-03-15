/**
 * PhaseController
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
     * (specific to PhaseController)
     */
    _config: {},

    /**
     * Project phase edit action.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    edit: function(request, response) {
        var projectId = parseInt(request.param("id"), 10);

        // Fetch project and project phases data async
        async.parallel(
            {
                // Get project data
                project: function(callback) {
                    DataService.getProject(projectId, callback)
                },

                // Get project phases data
                phases: function(callback) {
                    DataService.getPhases({projectId: projectId}, callback)
                }
            },

            /**
             * Main callback function which is called after all parallel jobs are processed.
             *
             * @param   {Error} error   Possible error object
             * @param   {{}}    data    Data object that contains 'project' and 'phases' data
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.view(data);
                }
            }
        );
    }
};
