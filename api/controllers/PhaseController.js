/**
 * PhaseController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */

module.exports = {
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('id'), 10);

        Project.findOne(projectId)
        .done(function(error, project) {
            if (error) {
                res.send(error, 500);
            } else {
                fetchPhases(project);
            }
        });

        function fetchPhases(project) {
            Phase.find()
            .where({
                projectId: project.id
            })
            .sort('order ASC')
            .done(function(error, phases) {
                if (error) {
                    res.send(error, 500);
                } else {
                    makeView(project, phases);
                }
            });
        }

        function makeView(project, phases) {
            return res.view({
                layout: "layout_ajax",
                project: project,
                phases: phases
            });
        }
    }
};
