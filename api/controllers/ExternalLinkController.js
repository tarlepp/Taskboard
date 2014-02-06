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

var async = require("async");

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

        async.parallel(
            {
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                links: function(callback) {
                    DataService.getProjectLinks(projectId, callback);
                }
            },

            function(error, results) {
                res.view(_.extend({
                    layout: req.isAjax ? "layout_ajax" : "layout",
                    projectId: projectId
                }, results));
            }
        );
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
    },

    /**
     * External link edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        var linkId = parseInt(req.param("linkId"), 10);

        // Fetch project data
        DataService.getProjectLink(linkId, function(error, link) {
            if (error) {
                res.send(error.status ? error.status : 500, error.message ? error.message : error);
            } else {
                res.view({
                    layout: req.isAjax ? "layout_ajax" : "layout",
                    link: link
                });
            }
        });
    }
};
