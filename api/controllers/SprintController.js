/**
 * SprintController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require("jquery");
var async = require("async");

module.exports = {
    /**
     * Sprint add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

        var projectId = parseInt(req.param("projectId"), 10);

        res.view({
            layout: "layout_ajax",
            projectId: projectId
        });

    },

    /**
     * Sprint edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

        var sprintId = parseInt(req.param("id"), 10);

        async.parallel(
            {
                // Fetch single sprint data
                sprint: function(callback) {
                    DataService.getSprint(sprintId, callback);
                },

                // Determine user role in this sprint
                role: function(callback) {
                    AuthService.hasSprintAccess(req.user, sprintId, callback, true);
                }
            },
            function (error, data) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.layout = "layout_ajax";

                    res.view(data);
                }
            }
        );
    },

    /**
     * Sprint backlog action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    backlog: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

        var sprintId = parseInt(req.param("id"), 10);

        var data = {
            layout: "layout_ajax",
            stories: false,
            role: 0,
            sprint: {
                data: false,
                progressStory: 0,
                progressTask: 0,
                cntStoryDone: 0,
                cntStoryNotDone: 0,
                cntStoryTotal: 0,
                cntTaskDone: 0,
                cntTaskNotDone: 0,
                cntTaskTotal: 0
            }
        };

        async.parallel(
            {
                // Fetch sprint data.
                sprint: function(callback) {
                    DataService.getSprint(sprintId, callback);
                },

                // Fetch sprint stories data.
                stories: function(callback) {
                    DataService.getStories({sprintId: sprintId}, callback);
                },

                // Determine user role in this sprint
                role: function(callback) {
                    AuthService.hasSprintAccess(req.user, sprintId, callback, true);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error|String}  error
             * @param   {{}}            results
             */
            function(error, results) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.sprint.data = results.sprint;
                    data.stories = results.stories;
                    data.role = results.role;

                    fetchTaskData();
                }
            }
        );

        /**
         * Function to fetch task data for each story
         *
         * @return  void
         */
        function fetchTaskData() {
            // We have no stories, so make view
            if (data.stories.length === 0) {
                makeView();
            } else {
                data.sprint.cntStoryTotal = data.stories.length;
                data.sprint.cntStoryDone = _.reduce(data.stories, function(memo, story) { return (story.isDone) ? memo + 1 : memo; }, 0);
                data.sprint.cntStoryNotDone = data.sprint.cntStoryTotal - data.sprint.cntStoryDone;

                if (data.sprint.cntStoryDone > 0) {
                    data.sprint.progressStory = Math.round(data.sprint.cntStoryDone / data.sprint.cntStoryTotal * 100);
                } else {
                    data.sprint.progressStory = 0;
                }

                // Iterate stories
                jQuery.each(data.stories, function(key, /** sails.model.story */story) {
                    // Initialize story tasks property
                    story.tasks = false;

                    // Find all tasks which are attached to current user story
                    Task
                        .find()
                        .where({
                            storyId: story.id
                        })
                        .sort("title ASC")
                        .done(function(error, tasks) {
                            // Add tasks to story data
                            story.tasks = tasks;
                            story.doneTasks = _.reduce(tasks, function(memo, task) { return (task.isDone) ? memo + 1 : memo; }, 0);

                            if (story.doneTasks > 0) {
                                story.progress = Math.round(story.doneTasks / tasks.length * 100);
                            } else {
                                story.progress = 0;
                            }

                            // Add task counts to sprint
                            data.sprint.cntTaskTotal += story.tasks.length;
                            data.sprint.cntTaskDone += story.doneTasks;

                            // Call view
                            makeView();
                        });
                });
            }
        }

        /**
         * Function to make actual view for sprint backlog.
         */
        function makeView() {
            if (data.stories.length > 0) {
                var show = true;

                // Check that we all tasks for story
                jQuery.each(data.stories, function(key, /** sails.model.story */story) {
                    // All tasks are not yet fetched
                    if (story.tasks === false) {
                        show = false;
                    }
                });

                if (show) {
                    data.sprint.cntTaskNotDone = data.sprint.cntTaskTotal - data.sprint.cntTaskDone;

                    if (data.sprint.cntTaskDone > 0) {
                        data.sprint.progressTask = Math.round(data.sprint.cntTaskDone / data.sprint.cntTaskTotal * 100);
                    } else {
                        data.sprint.progressTask = 0;
                    }

                    res.view(data);
                }
            } else {
                res.view(data);
            }
        }
    }
};
