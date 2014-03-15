/**
 * MilestoneController
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
     * (specific to MilestoneController)
     */
    _config: {},

    /**
     * Milestone add action. This will render GUI for new milestone add. This GUI is shown
     * in bootstrap modal in board.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    add: function(request, response) {
        var projectId = parseInt(request.param("projectId"), 10);

        // Fetch user role and project data
        async.parallel(
            {
                // Determine user role in this project
                role: function(callback) {
                    AuthService.hasProjectAccess(request.user, projectId, callback, true);
                },

                // Fetch project data
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                }
            },

            /**
             * Main callback function which is called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error   Possible error object
             * @param   {null|{}}       data    Data object that contains 'role' and 'project' data
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    data.projectId = projectId;

                    response.view(data);
                }
            }
        );
    },

    /**
     * Milestone edit action. This will render GUI for specified milestone object edit.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    edit: function(request, response) {
        var milestoneId = parseInt(request.param("id"), 10);

        // Fetch role and milestone data
        async.parallel(
            {
                // Determine user role in this milestone
                role: function(callback) {
                    AuthService.hasMilestoneAccess(request.user, milestoneId, callback, true);
                },

                // Fetch milestone data
                milestone: function(callback) {
                    DataService.getMilestone(milestoneId, callback)
                }
            },

            /**
             * Callback function which is called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error   Possible error object
             * @param   {null|{}}       data    Data object that contains 'role' and 'milestone' data
             */
            function (error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.view(data);
                }
            }
        );
    },

    /**
     * Milestone stories action.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    stories: function(request, response) {
        var milestoneId = parseInt(request.param("id"), 10);

        var data = {
            role: 0,
            milestone: {
                data: false,
                progressStory: 0,
                progressTask: 0,
                cntStoryDone: 0,
                cntStoryTotal: 0,
                cntTaskDone: 0,
                cntTaskTotal: 0
            },
            stories: false
        };

        // Fetch role, milestone and stories data
        async.parallel(
            {
                // Determine user role in this milestone
                role: function(callback) {
                    AuthService.hasMilestoneAccess(request.user, milestoneId, callback, true);
                },

                // Fetch milestone data
                milestone: function(callback) {
                    DataService.getMilestone(milestoneId, callback)
                },

                // Fetch stories that are attached to this milestone
                stories: function(callback) {
                    DataService.getStories({milestoneId: milestoneId}, callback);
                }
            },

            /**
             * Callback function which is called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error   Possible error object
             * @param   {{}}            results Data object that contains 'role', 'milestone' and 'stories' data
             */
            function (error, results) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    data.role = results.role;
                    data.milestone.data = results.milestone;
                    data.stories = results.stories;

                    fetchTasks();
                }
            }
        );

        /**
         * Private function to fetch tasks of stories in current milestone.
         *
         * This will make also required calculations for milestone total and story
         * specified task statistics data.
         */
        function fetchTasks() {
            data.milestone.cntStoryTotal = data.stories.length;
            data.milestone.cntStoryDone = _.reduce(data.stories, function(memo, story) {
                return (story.isDone) ? memo + 1 : memo;
            }, 0);

            if (data.milestone.cntStoryDone > 0) {
                data.milestone.progressStory = Math.round(data.milestone.cntStoryDone  / data.milestone.cntStoryTotal * 100);
            }

            // Map each stories and fetch task data for those
            async.map(
                data.stories,

                /**
                 * Iterator function to process single story object and fetch task data for that.
                 *
                 * @param   {sails.model.story} story       Story object
                 * @param   {Function}          callback    Callback function to call after story is processed
                 */
                function(story, callback) {
                    Task
                        .find()
                        .where({
                            storyId: story.id
                        })
                        .sort("title ASC")
                        .done(function(error, tasks) {
                            if (error) {
                                callback(error, null);
                            } else {
                                // Add tasks to story data
                                story.tasks = tasks;

                                story.doneTasks = _.reduce(tasks, function (memo, task) {
                                    return (task.isDone) ? memo + 1 : memo;
                                }, 0);

                                // Add milestone task counter
                                data.milestone.cntTaskTotal = data.milestone.cntTaskTotal + story.tasks.length;
                                data.milestone.cntTaskDone = data.milestone.cntTaskDone + story.doneTasks;

                                if (story.doneTasks > 0) {
                                    story.progress = Math.round(story.doneTasks / tasks.length * 100);
                                } else {
                                    story.progress = 0;
                                }

                                callback(null, true);
                            }
                        });
                },

                /**
                 * Callback function which is call after are stories are processed.
                 *
                 * @param   {null|Error}    error   Possible error object
                 * @param   {null|Boolean}  result  Result data
                 */
                function(error, result) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        if (data.milestone.cntTaskDone > 0) {
                            data.milestone.progressTask = Math.round(data.milestone.cntTaskDone  / data.milestone.cntTaskTotal * 100);
                        }

                        response.view(data);
                    }
                }
            );
        }
    }
};
