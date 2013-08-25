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
