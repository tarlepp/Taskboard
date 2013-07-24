/**
 * SprintController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
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
    }
};
