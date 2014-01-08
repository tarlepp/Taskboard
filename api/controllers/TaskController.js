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
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
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
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    data.layout = req.isAjax ? "layout_ajax" : "layout";

                    res.view(data);
                }
            }
        );
    },

    /**
     * Task statistics action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    statistics: function(req, res) {
        var taskId = parseInt(req.param('id'), 10);

        // Make parallel jobs for task statistics view
        async.parallel(
            {
                // Fetch task data
                task: function(callback) {
                    DataService.getTask(taskId, callback);
                },

                // Fetch phase data
                phases: function(callback) {
                    DataService.getPhasesForTask(taskId, callback);
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
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    fetchDurations(data);
                }
            }
        );

        /**
         * Private function which is called after main data is fetched. This main data contains following data:
         *  - task, single task object
         *  - phases, array of phase objects
         *
         * @param   {{}}    data
         */
        function fetchDurations(data) {
            async.map(
                data.phases,

                /**
                 * Function to determine duration in current phase.
                 *
                 * @param   {sails.model.phase} phase
                 * @param   {Function}          callback
                 */
                function (phase, callback) {
                    PhaseDuration
                        .find({
                            sum: "duration"
                        })
                        .where({phaseId: phase.id})
                        .where({taskId: data.task.id})
                        .done(function(error, result) {
                            if (error) {
                                callback(error, null);
                            } else {
                                phase.duration = result[0].duration ? result[0].duration : 0;

                                callback(null, phase.duration);
                            }
                        });
                },

                /**
                 * Main callback function which is called after all phases are processed.
                 *
                 * @param   {Error|null}    error
                 * @param   {{}}            result
                 */
                function (error, result) {
                    if (error) {
                        res.send(error, error.status ? error.status : 500);
                    } else {
                        var totalTime = _.pluck(data.phases, "duration").reduce(function(memo, i) {return memo + i});
                        var totalTimeNoFirst = _.pluck(_.reject(data.phases, function(phase) { return phase.order === 0 } ), "duration").reduce(function(memo, i) {return memo + i});

                        data.phaseDuration = {
                            totalTime: totalTime,
                            totalTimeNoFirst: totalTimeNoFirst
                        };

                        _.each(data.phases, function(phase) {
                            phase.durationPercentage = (phase.duration > 0 && phase.order !== 0) ? phase.duration / totalTimeNoFirst * 100 : 0;
                            phase.durationPercentageTotal = (phase.duration > 0) ? phase.duration / totalTime * 100 : 0;
                        });

                        data.chartData = [];
                        data.chartDataTotal = [];

                        _.each(data.phases, function(phase) {
                            if (phase.durationPercentage > 0) {
                                data.chartData.push({
                                    name: phase.title,
                                    color: phase.backgroundColor,
                                    y: phase.durationPercentage,
                                    duration: phase.duration
                                });
                            }

                            if (phase.durationPercentageTotal > 0) {
                                data.chartDataTotal.push({
                                    name: phase.title,
                                    color: phase.backgroundColor,
                                    y: phase.durationPercentageTotal,
                                    duration: phase.duration
                                });
                            }
                        });

                        data.layout = req.isAjax ? "layout_ajax" : "layout";

                        res.view(data);
                    }
                }
            );
        }
    }
};
