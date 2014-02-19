/**
 * MilestoneController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
"use strict";

var async = require("async");

module.exports = {
    /**
     * Milestone add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        var projectId = parseInt(req.param("projectId"), 10);

        // Fetch user role and project data
        async.parallel(
            {
                // Determine user role in this project
                role: function(callback) {
                    AuthService.hasProjectAccess(req.user, projectId, callback, true);
                },
                // Fetch project data
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                }
            },

            /**
             * Main callback function which is called after all parallel jobs are processed.
             *
             * @param   {Error} error   Possible error object
             * @param   {{}}    data    Data object that contains 'role' and 'project' data
             */
            function(error, data) {
                if (error) {
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    data.projectId = projectId;

                    res.view(data);
                }
            }
        );
    },

    /**
     * Milestone edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        var milestoneId = parseInt(req.param("id"), 10);

        // Fetch role and milestone data
        async.parallel(
            {
                // Determine user role in this milestone
                role: function(callback) {
                    AuthService.hasMilestoneAccess(req.user, milestoneId, callback, true);
                },

                // Fetch milestone data
                milestone: function(callback) {
                    DataService.getMilestone(milestoneId, callback)
                }
            },

            /**
             * Callback function which is called after all parallel jobs are processed.
             *
             * @param   {Error} error   Possible error object
             * @param   {{}}    data    Data object that contains 'role' and 'milestone' data
             */
            function (error, data) {
                if (error) {
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    res.view(data);
                }
            }
        );
    },

    /**
     * Milestone stories action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    stories: function(req, res) {
        var milestoneId = parseInt(req.param("id"), 10);

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

        // Fetch role and milestone data
        async.parallel(
            {
                // Determine user role in this milestone
                role: function(callback) {
                    AuthService.hasMilestoneAccess(req.user, milestoneId, callback, true);
                },

                // Fetch milestone data
                milestone: function(callback) {
                    DataService.getMilestone(milestoneId, callback)
                }
            },

            /**
             * Callback function which is called after all parallel jobs are processed.
             *
             * @param   {Error} error   Possible error object
             * @param   {{}}    results Data object that contains 'role' and 'milestone' data
             */
            function (error, results) {
                if (error) {
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    data.role = results.role;
                    data.milestone.data = results.milestone;

                    // Find all user stories which are attached to milestone
                    Story
                        .find()
                        .where({
                            milestoneId: data.milestone.data.id
                        })
                        .sort('title ASC')
                        .done(function(error, stories) {
                            data.stories = stories;

                            fetchTasks();
                        });
                }
            }
        );

        /**
         * Private function to fetch tasks of stories in current milestone.
         */
        function fetchTasks() {
            data.milestone.cntStoryTotal = data.stories.length;
            data.milestone.cntStoryDone = _.reduce(data.stories, function (memo, story) {
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
                        .sort('title ASC')
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
                 * @param   {Error}     error   Possible error object
                 * @param   {Boolean}   result  Result data
                 */
                function(error, result) {
                    if (data.milestone.cntTaskDone > 0) {
                        data.milestone.progressTask = Math.round(data.milestone.cntTaskDone  / data.milestone.cntTaskTotal * 100);
                    }

                    res.view(data);
                }
            );
        }
    }
};
