/**
 * TaskController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var async = require("async");

module.exports = {
    /**
     * Task add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        var projectId = parseInt(req.param("projectId"), 10);
        var storyId = parseInt(req.param("storyId"), 10);

        // Make parallel jobs for task add
        async.parallel(
            {
                // Determine first phase in this project
                phaseId: function(callback) {
                    Phase
                        .find()
                        .where({
                            projectId: projectId
                        })
                        .sort('order ASC')
                        .limit(1)
                        .done(function(error, phases) {
                            if (error) {
                                callback(error, null)
                            } else if (phases.length > 0) {
                                callback(null, phases[0].id);
                            } else {
                                var errorMessage = new Error();

                                errorMessage.message = "Phase data not found.";
                                errorMessage.status = 404;

                                callback(errorMessage, null);
                            }
                        });
                },

                // Fetch story data
                story: function(callback) {
                    DataService.getStory(storyId, callback);
                },

                // Fetch task types
                types: function(callback) {
                    DataService.getTypes({}, callback);
                },

                // Fetch users
                users: function(callback) {
                    DataService.getUsers({}, callback);
                }
            },

            /**
             * Callback function which is called after all specified parallel jobs are done.
             *
             * @param   {Error} error   Error object
             * @param   {{}}    data    Object that contains all necessary data for task add
             */
            function(error, data) {
                if (error) {
                    res.send(error.status ? error.status : 500, error);
                } else {
                    data.layout = req.isAjax ? "layout_ajax" : "layout";
                    data.projectId = projectId;
                    data.storyId = storyId;

                    res.view(data);
                }
            }
        );
    },

    /**
     * Task edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        var taskId = parseInt(req.param('id'), 10);

        // Make parallel jobs for task edit
        async.parallel(
            {
                // Fetch task data
                task: function(callback) {
                    DataService.getTask(taskId, callback);
                },

                // Fetch task types
                types: function(callback) {
                    DataService.getTypes({}, callback);
                },

                // Fetch users
                users: function(callback) {
                    DataService.getUsers({}, callback);
                }
            },

            /**
             * Callback function which is called after all specified parallel jobs are done.
             *
             * @param   {Error} error   Error object
             * @param   {{}}    data    Object that contains all necessary data for task edit
             */
            function(error, data) {
                if (error) {
                    res.send(error.status ? error.status : 500, error);
                } else {
                    data.layout = req.isAjax ? "layout_ajax" : "layout";

                    res.view(data);
                }
            }
        );
    }
};
