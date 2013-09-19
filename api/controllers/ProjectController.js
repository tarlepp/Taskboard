/**
 * ProjectController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require('jquery');

module.exports = {
    /**
     * Project add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        // Fetch all users
        User
            .find()
            .sort('lastName ASC')
            .done(function(error, users) {
                if (error) {
                    res.send(error, 500);
                } else {
                    res.view({
                        layout: "layout_ajax",
                        users: users
                    });
                }
            });
    },

    /**
     * Project edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('id'), 10);

        // Specify template data to use
        var data = {
            layout: "layout_ajax",
            project: false,
            users: false
        };

        // Fetch project data.
        Project
            .findOne(projectId)
            .done(function(error, project) {
                if (error) {
                    res.send(error, 500);
                } else if (!project) {
                    res.send("Project not found.", 404);
                } else {
                    data.project = project;

                    makeView();
                }
            });

        // Fetch all users
        User
            .find()
            .sort('lastName ASC')
            .done(function(error, users) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.users = users;

                    makeView();
                }
            });

        /**
         * Function makes actual view if all necessary data is fetched
         * from database for template.
         */
        function makeView() {
            var ok = true;

            jQuery.each(data, function(key, data) {
                if (data === false) {
                    ok = false;
                }
            });

            if (ok) {
                res.view(data);
            }
        }
    },

    /**
     * Project milestones action
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    milestones: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('id'), 10);

        var data = {
            layout: "layout_ajax",
            milestones: false,
            project: false,
            progressMilestones: 0,
            progressStories: 0,
            cntMilestonesDone: 0,
            cntMilestonesTotal: 0,
            cntStoriesDone: 0,
            cntStoriesTotal: 0
        };

        // Fetch project data.
        Project
            .findOne(projectId)
            .done(function(error, project) {
                if (error) {
                    res.send(error, 500);
                } else if (!project) {
                    res.send("Project not found.", 404);
                } else {
                    data.project = project;

                    makeView();
                }
            });

        // Fetch milestone data
        Milestone
            .find()
            .where({
                projectId: projectId
            })
            .sort('deadline ASC')
            .sort('title ASC')
            .done(function(error, milestones) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.milestones = milestones;
                    data.cntMilestonesTotal = milestones.length;

                    fetchStories();
                }
            });

        /**
         * Function to fetch attached milestone stories.
         */
        function fetchStories() {
            // We have no milestones, so make view
            if (data.milestones.length === 0) {
                makeView();
            } else {
                // Iterate milestones
                jQuery.each(data.milestones, function(key, /** sails.model.milestone */milestone) {
                    // Initialize milestone stories property
                    milestone.stories = false;

                    // Find all user stories which are attached to current milestone
                    Story
                        .find()
                        .where({
                            milestoneId: milestone.id
                        })
                        .sort('title ASC')
                        .done(function(error, stories) {
                            // Add stories to milestone data
                            milestone.stories = stories;
                            milestone.doneStories = _.reduce(stories, function (memo, story) {
                                return (story.isDone) ? memo + 1 : memo;
                            }, 0);

                            data.cntStoriesTotal = data.cntStoriesTotal + milestone.stories.length;
                            data.cntStoriesDone = data.cntStoriesDone + milestone.doneStories;

                            if (milestone.doneStories > 0) {
                                if (milestone.stories.length === milestone.doneStories) {
                                    data.cntMilestonesDone = data.cntMilestonesDone + 1;
                                }

                                milestone.progress = Math.round(milestone.doneStories / stories.length * 100);
                            } else {
                                milestone.progress = 0;
                            }

                            // Call view
                            makeView();
                        });
                });
            }
        }

        /**
         * Function to make actual view for project milestone list.
         */
        function makeView() {
            var ok = true;

            jQuery.each(data, function(key, data) {
                if (data === false) {
                    ok = false;
                }
            });

            if (ok) {
                if (data.milestones.length > 0) {
                    var show = true;

                    jQuery.each(data.milestones, function(key, /** sails.model.milestone */milestone) {
                        if (milestone.stories === false) {
                            show = false;
                        }
                    });

                    if (show) {
                        if (data.cntMilestonesDone > 0) {
                            data.progressMilestones = Math.round(data.cntMilestonesDone / data.cntMilestonesTotal * 100);
                        } else {
                            data.progressMilestones = 0;
                        }

                        if (data.cntStoriesDone > 0) {
                            data.progressStories = Math.round(data.cntStoriesDone / data.cntStoriesTotal * 100);
                        } else {
                            data.progressStories = 0;
                        }

                        res.view(data);
                    }
                } else {
                    res.view(data);
                }
            }
        }
    },

    /**
     * Project planning action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    planning: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('id'), 10);

        // Specify template data to use
        var data = {
            layout: "layout_ajax",
            project: false,
            stories: false,
            sprints: false
        };

        // Fetch project data.
        Project
            .findOne(projectId)
            .done(function(error, project) {
                if (error) {
                    res.send(error, 500);
                } else if (!project) {
                    res.send("Project not found.", 404);
                } else {
                    data.project = project;

                    makeView();
                }
            });

        // Fetch project stories
        Story
            .find()
            .where({
                projectId: projectId
            })
            .sort('priority ASC')
            .done(function(error, stories) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.stories = stories;

                    makeView();
                }
            });

        // Fetch project sprints
        Sprint
            .find()
            .where({
                projectId: projectId
            })
            .sort('dateStart ASC')
            .done(function(error, sprints) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.sprints = sprints;

                    makeView();
                }
            });

        /**
         * Function makes actual view if all necessary data is fetched
         * from database for template.
         */
        function makeView() {
            var ok = true;

            jQuery.each(data, function(key, data) {
                if (data === false) {
                    ok = false;
                }
            });

            if (ok) {
                res.view(data);
            }
        }
    }
};
