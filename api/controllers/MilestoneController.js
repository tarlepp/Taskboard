/**
 * MilestoneController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
var jQuery = require('jquery');

module.exports = {
    /**
     * Milestone list action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    list: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('projectId'), 10);

        var data = {
            layout: "layout_ajax",
            milestones: false
        };

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
            if (data.milestones.length > 0) {
                var show = true;

                jQuery.each(data.milestones, function(key, /** sails.model.milestone */milestone) {
                    if (milestone.stories === false) {
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
    },

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

        // Fetch story data
        Milestone
            .findOne(milestoneId)
            .done(function(error, milestone) {
                if (error) {
                    res.send(error, 500);
                } else if (!story) {
                    res.send("Milestone not found.", 404);
                } else {
                    res.view({
                        layout: "layout_ajax",
                        milestone: milestone
                    });
                }
            });
    }
};
