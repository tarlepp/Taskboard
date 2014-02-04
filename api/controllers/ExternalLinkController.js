/**
 * ExternalLinkController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
"use strict";

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ExternalLinkController)
     */
    _config: {},

    /**
     * External links list action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    list: function(req, res) {
        var projectId = parseInt(req.param("projectId"), 10);

        res.view({
            layout: req.isAjax ? "layout_ajax" : "layout",
            projectId: projectId
        });
    },

    /**
     * External link add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        var projectId = parseInt(req.param("projectId"), 10);

        // Fetch project data
        DataService.getProject(projectId, function(error, project) {
            if (error) {
                res.send(error.status ? error.status : 500, error.message ? error.message : error);
            } else {
                res.view({
                    layout: req.isAjax ? "layout_ajax" : "layout",
                    project: project,
                    projectId: projectId
                });
            }
        });
    }
};
