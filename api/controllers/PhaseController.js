/**
 * PhaseController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require('jquery');

module.exports = {
    /**
     * Project phase edit action.
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
            phases: false
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

        // Fetch project phases
        Phase
            .find()
            .where({
                projectId: projectId
            })
            .sort('order ASC')
            .done(function(error, phases) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.project = phases;

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
