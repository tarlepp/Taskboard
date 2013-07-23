/**
 * SprintController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */

module.exports = {
    add: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('projectId'), 10);

        return res.view({
            layout: "layout_ajax",
            projectId: projectId
        });
    },
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var sprintId = parseInt(req.param('id'), 10);

        Sprint.findOne(sprintId)
        .done(function(error, sprint) {
            if (error) {
                res.send(error, 500);
            } else {
                res.view({
                    layout: "layout_ajax",
                    sprint: sprint
                });
            }
        });
    }
};
