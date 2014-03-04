/**
 * BoardController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
"use strict";

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to BoardController)
     */
    _config: {
        blueprints: {
            actions: false,
            rest: false,
            shortcuts: false
        }
    },

    /**
     * Taskboard main action.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    index: function(request, response) {
        var projectId = parseInt(request.route.params.projectId, 10);
        var sprintId = parseInt(request.route.params.sprintId, 10);

        projectId = isNaN(projectId) ? 0 : projectId;
        sprintId = isNaN(sprintId) ? 0 : sprintId;

        // Project id not given, but user has cookie that contains last selected project
        if (projectId === 0 && request.cookies.projectId) {
            projectId = request.cookies.projectId;
        }

        // Project id given and sprint id not, check cookie for sprint id
        if (sprintId === 0 && projectId > 0) {
            var sprintCookie = "sprintId_" + projectId;

            // Cookie founded
            if (request.cookies[sprintCookie]) {
                sprintId = request.cookies[sprintCookie];
            }
        }

        projectId = isNaN(parseInt(projectId, 10)) ? 0 : projectId;
        sprintId = isNaN(parseInt(sprintId, 10)) ? 0 : sprintId;

        // Make view
        response.view({
            projectId: projectId,
            sprintId: sprintId
        });
    }
};
