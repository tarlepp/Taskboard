/**
 * SprintController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require('jquery');

module.exports = {
    /**
     * Sprint add action.
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
     * Sprint edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var sprintId = parseInt(req.param('id'), 10);

        // Fetch sprint data
        Sprint
            .findOne(sprintId)
            .done(function(error, sprint) {
                if (error) {
                    res.send(error, 500);
                } else if (!sprint) {
                    res.send("Sprint not found.", 404);
                } else {
                    res.view({
                        layout: "layout_ajax",
                        sprint: sprint
                    });
                }
            });
    },

    /**
     * Sprint backlog action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    backlog: function(req, res) {
        if (!req.isAjax) {
        //    res.send('Only AJAX request allowed', 403);
        }

        var sprintId = parseInt(req.param('id'), 10);

        var data = {
            layout: "layout_ajax",
            stories: false
        };

        // Fetch story data
        Story
            .find()
            .where({sprintId: sprintId})
            .sort('priority ASC')
            .done(function(error, stories) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.stories = stories;

                    fetchTaskData();
                }
            });

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

                            story.doneTasks = _.reduce(tasks, function(memo, task) { return (task.isDone) ? memo + 1 : memo; }, 0);

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
         * Function to make actual view for sprint backlog.
         */
        function makeView() {
            if (data.stories.length > 0) {
                var show = true;

                // Check that we all tasks for story
                jQuery.each(data.stories, function(key, /** sails.model.story */story) {
                    if (story.tasks === false) {
                        show = false;
                    }
                });

                if (show) {
                    res.view(data);
                }
            } else {
                res.view(data);
            }
        }
    }
};
