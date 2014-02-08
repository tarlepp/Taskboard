/**
 * LinkController
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
     * (specific to LinkController)
     */
    _config: {},

    /**
     * Main object link action. This will show attached links and new link add form for user.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    index: function(req, res) {
        var objectId = req.param("objectId");
        var objectName = req.param("objectName");

        // Async water fall job to fetch all necessary data for link object view
        async.waterfall(
            [
                /**
                 * Determine project object by given object name and id.
                 *
                 * @param   {Function}  callback
                 */
                function(callback) {
                    DataService.getLinkObjectProject(objectName, objectId, callback);
                },

                /**
                 * Fetch project external links, that can be attached to current object.
                 *
                 * @param   {sails.model.project}   project     Project object
                 * @param   {Function}              callback
                 */
                function(project, callback) {
                    DataService.getProjectLinks(project.id, function(error, externalLinks) {
                        callback(error, project, externalLinks);
                    });
                },

                /**
                 * Fetch attached links for current object.
                 *
                 * @param   {sails.model.project}           project
                 * @param   {sails.model.externalLink[]}    externalLinks
                 * @param   {Function}                      callback
                 */
                function(project, externalLinks, callback) {
                    DataService.getLinks(objectName, objectId, function(error, links) {
                        callback(error, project, externalLinks, links);
                    });
                }
            ],

            /**
             * Main callback function which is called after all water fall jobs are processed
             * or an error occurred while processing those jobs.
             *
             * @param   {null|Error}                        error
             * @param   {null|sails.model.project}          project
             * @param   {null|sails.model.externalLink[]}   externalLinks
             * @param   {null|sails.model.link[]}           attachedLinks
             */
            function(error, project, externalLinks, attachedLinks) {
                if (error) {
                    res.send(error.status ? error.status : 500, error.message ? error.message : error);
                } else {
                    res.view({
                        layout: req.isAjax ? "layout_ajax" : "layout",
                        objectId: objectId,
                        objectName: objectName,
                        project: project,
                        externalLinks: externalLinks,
                        attachedLinks: attachedLinks
                    });
                }
            }
        );
    },

    /**
     * Action to fetch object links.
     *
     * @todo    Make this only to require projectId parameter, so make all necessary
     *          data determination within this action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    getLinks: function(req, res) {
        var where       = req.param("where");
        var projectId   = parseInt(req.param("projectId"), 10);

        // Make parallel job to fetch all necessary data
        async.parallel(
            {
                // Fetch attached links
                attachedLinks: function(callback) {
                    Link
                        .find()
                        .where({or: where})
                        .sort("link ASC")
                        .exec(function(error, links) {
                            callback(error, links);
                        });
                },

                // Fetch external link data
                externalLinks: function(callback) {
                    DataService.getProjectLinks(projectId, callback);
                }
            },

            /**
             * Main callback function which is processed after all parallel jobs are done.
             *
             * @param   {null|Error}    error
             * @param   {{}}            results
             */
            function(error, results) {
                // Iterate each attached link and add external link data to it
                _.each(results.attachedLinks, function(link) {
                    link.externalLink = _.find(results.externalLinks, function(externalLink) {
                        return externalLink.id === link.externalLinkId;
                    });
                });

                res.json(results.attachedLinks);
            }
        );
    }
};
