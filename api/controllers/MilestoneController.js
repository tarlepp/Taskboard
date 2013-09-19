/**
 * MilestoneController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
var jQuery = require('jquery');

module.exports = {
    /**
     * Milestone add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('projectId'), 10);

        res.view({
            layout: "layout_ajax",
            projectId: projectId
        });
    },

    /**
     * Milestone edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var milestoneId = parseInt(req.param('id'), 10);

        // Fetch milestone data
        Milestone
            .findOne(milestoneId)
            .done(function(error, milestone) {
                if (error) {
                    res.send(error, 500);
                } else if (!milestone) {
                    res.send("Milestone not found.", 404);
                } else {
                    res.view({
                        layout: "layout_ajax",
                        milestone: milestone
                    });
                }
            });
    },

    /**
     * Milestone stories action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    stories: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var milestoneId = parseInt(req.param('id'), 10);

        var data = {
            layout: "layout_ajax",
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

        // Fetch story data
        Milestone
            .findOne(milestoneId)
            .done(function(error, milestone) {
                if (error) {
                    res.send(error, 500);
                } else if (!milestone) {
                    res.send("Milestone not found.", 404);
                } else {
                    data.milestone.data = milestone;

                    // Find all user stories which are attached to milestone
                    Story
                        .find()
                        .where({
                            milestoneId: milestoneId
                        })
                        .sort('title ASC')
                        .done(function(error, stories) {
                            data.stories = stories;

                            fetchTasks();
                        });
                }
            });

        /**
         * Function to fetch tasks of stories
         */
        function fetchTasks() {
            // We have no stories, so make view
            if (data.stories.length === 0) {
                makeView();
            } else {
                data.milestone.cntStoryTotal = data.stories.length;
                data.milestone.cntStoryDone = _.reduce(data.stories, function (memo, story) {
                    return (story.isDone) ? memo + 1 : memo;
                }, 0);

                if (data.milestone.cntStoryDone > 0) {
                    data.milestone.progressStory = Math.round(data.milestone.cntStoryDone  / data.milestone.cntStoryTotal * 100);
                }

                // Iterate milestones
                jQuery.each(data.stories, function(key, /** sails.model.story */story) {
                    // Initialize milestone stories property
                    story.tasks = false;

                    // Find all user stories which are attached to current milestone
                    Task
                        .find()
                        .where({
                            storyId: story.id
                        })
                        .sort('title ASC')
                        .done(function(error, tasks) {
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

                            // Call view
                            makeView();
                        });
                });
            }
        }

        /**
         * Function to make actual view for milestone edit
         */
        function makeView() {
            if (data.stories.length > 0) {
                var show = true;

                jQuery.each(data.stories, function(key, /** sails.model.story */story) {
                    if (story.tasks === false) {
                        show = false;
                    }
                });

                if (show) {
                    if (data.milestone.cntTaskDone > 0) {
                        data.milestone.progressTask = Math.round(data.milestone.cntTaskDone  / data.milestone.cntTaskTotal * 100);
                    }

                    res.view(data);
                }
            } else {
                res.view(data);
            }
        }
    }
};
