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

        // Parallel jobs to fetch project and actual external link data.
        async.parallel(
            {
                // Get project data
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                // Get external links for current project
                links: function(callback) {
                    DataService.getProjectLinks(projectId, callback);
                }
            },

            /**
             * Main callback function which is called after all parallel jobs are done.
             *
             * @param   {null|Error}    error
             * @param   {{}}            results
             */
            function(error, results) {
                if (error) {
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    // Map founded links
                    async.map(
                        results.links,

                        /**
                         * Iterator function which is called to every link in array. This will just add
                         * attached link count to each link object.
                         *
                         * @param   {sails.model.link}  link
                         * @param   {Function}          callback
                         */
                        function(link, callback) {
                            Link
                                .count({externalLinkId: link.id})
                                .exec(function (error, count) {
                                    link.attachedLinksCount = count;

                                    callback(error, link);
                                });
                        },

                        /**
                         * Main callback function which is called after all array values are processed.
                         *
                         * @param error
                         * @param data
                         */
                        function(error, data) {
                            if (error) {
                                res.send(error.status ? error.status : 500, error.message ? error.message : error);
                            } else {
                                res.view(_.extend({
                                    layout: req.isAjax ? "layout_ajax" : "layout",
                                    projectId: projectId
                                }, results));
                            }
                        }
                    );
                }
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
