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
    }
};
