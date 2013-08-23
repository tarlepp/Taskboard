/**
 * StoryController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require('jquery');

module.exports = {
    /**
     * Story add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('projectId'), 10);
        var sprintId = parseInt(req.param('sprintId'), 10);

        res.view({
            layout: "layout_ajax",
            projectId: projectId,
            sprintId: sprintId
        });
    },

    /**
     * Story edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var storyId = parseInt(req.param('id'), 10);

        // Fetch story data
        Story
            .findOne(storyId)
            .done(function(error, story) {
                if (error) {
                    res.send(error, 500);
                } else if (!story) {
                    res.send("Story not found.", 404);
                } else {
                    res.view({
                        layout: "layout_ajax",
                        story: story
                    });
                }
            });
    },

    /**
     * Story split action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    split: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var storyId = parseInt(req.param('storyId'), 10);
        var sprintId = parseInt(req.param('sprintId'), 10);
        var projectId = parseInt(req.param('projectId'), 10);

        if (isNaN(storyId) || isNaN(sprintId) || isNaN(projectId)) {
            res.send("Required input data missing...", 400);
        }

        var data = {
            story: false,
            tasks: [],
            taskCnt: 0
        };

        // Fetch story data
        Story
            .findOne(storyId)
            .done(function(error, /** sails.model.story */story) {
                if (error) {
                    res.send(error, 500);
                } else if (!story) {
                    res.send("Story not found.", 404);
                } else {
                    cloneStory(story)
                }
            });

        /**
         * Private function to clone given story
         *
         * @param   {sails.model.story} story
         */
        function cloneStory(story) {
            // Remove story specified data
            delete story.id;
            delete story.createdAt;
            delete story.updatedAt;

            // Change story sprint data to user selected value
            story.sprintId = sprintId;

            // Create new story
            Story
                .create(story.toJSON())
                .done(function(error, /** sails.model.story */story) {
                    if (error) {
                        res.send(error, 500);
                    } else  {
                        data.story = story;

                        // Fetch phases which tasks are wanted to move to new story
                        Phase
                            .find()
                            .where({
                                split: 1,
                                projectId: projectId
                            })
                            .done(function(error, /** sails.model.phase[] */phases) {
                                if (error) {
                                    res.send(error, 500);
                                } else {
                                    var phaseIds = [];

                                    jQuery.each(phases, function(key, /** sails.model.phase */phase) {
                                        phaseIds.push({phaseId: phase.id});
                                    });

                                    if (phaseIds.length > 0) {
                                        changeTasks(phaseIds);
                                    } else {
                                        res.send(data);
                                    }
                                }
                            });
                    }
                });
        }

        /**
         * Private function to change tasks story id to new one. Note that
         * we only change tasks which are in specified phase.
         *
         * @param   {Array} phaseIds
         */
        function changeTasks(phaseIds) {
            // Fetch tasks which we want to assign to new story
            Task
                .find()
                .where({
                    storyId: storyId
                })
                .where({
                    or: phaseIds
                })
                .done(function(error, /** sails.model.task[] */tasks) {
                    if (error) {
                        res.send(error, 500);
                    } else {
                        data.taskCnt = tasks.length;

                        jQuery.each(tasks, function(key, /** sails.model.task */task) {
                            task.storyId = data.story.id;

                            // Update existing task data, basically just change story id to new one
                            Task
                                .update({
                                    id: task.id
                                },{
                                    storyId: data.story.id
                                }, function(err, task) {
                                    // Error handling
                                    if (err) {
                                        res.send(error, 500);
                                    } else {
                                        data.tasks.push(task);

                                        if (data.taskCnt === data.tasks.length) {
                                            console.log("send data");
                                            res.send(data);
                                        }
                                    }
                                });
                        });
                    }
                });
        }
    }
};
