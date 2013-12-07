/**
 * BoardController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */

module.exports = {
    /**
     * Taskboard main action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    index: function(req, res) {
        var projectId = req.route.params.projectId || 0;
        var sprintId = req.route.params.sprintId || 0;
        var sprintCookie = '';

        // Project id not given, but user has cookie that contains last selected project
        if (projectId === 0 && req.cookies.projectId) {
            projectId = req.cookies.projectId;

            // Specify sprint cookie
            sprintCookie = 'sprintId_' + projectId;

            // Sprint cookie exists for current project
            if (req.cookies[sprintCookie]) {
                sprintId = req.cookies[sprintCookie];
            }
        }

        // Project id given and sprint id not, check cookie for sprint id
        if (sprintId === 0 && projectId > 0) {
            sprintCookie = 'sprintId_' + projectId;

            // Cookie founded
            if (req.cookies[sprintCookie]) {
                sprintId = req.cookies[sprintCookie];
            }
        }

        projectId = isNaN(parseInt(projectId)) ? 0 : projectId;
        sprintId = isNaN(parseInt(sprintId)) ? 0 : sprintId;

        // Make view
        res.view({
            projectId: projectId,
            sprintId: sprintId
        });
    }
};
