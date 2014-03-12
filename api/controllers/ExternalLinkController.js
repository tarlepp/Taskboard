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
     * External links list action. This action will show user project specified external link list
     * GUI and user can interact with those.
     *
     * @param   {Request}   request Request object
     * @param   {Response}  response Response object
     */
    list: function(request, response) {
        var projectId = parseInt(request.param("projectId"), 10);

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
                    ResponseService.makeError(error, request, response);
                } else {
                    processLinks(results);
                }
            }
        );

        /**
         * Private function to process links. Basically this will just map all founded links
         * and fetch actual count for those.
         *
         * @param   {{}}    results Project and links data
         */
        function processLinks(results) {
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
                 * @param   {null|Error}    error
                 */
                function(error) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        response.view(_.extend({
                            projectId: projectId
                        }, results));
                    }
                }
            );
        }
    },

    /**
     * External link add action. This will render GUI for adding new link.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    add: function(request, response) {
        var projectId = parseInt(request.param("projectId"), 10);

        // Fetch project data
        DataService.getProject(projectId, function(error, project) {
            if (error) {
                ResponseService.makeError(error, request, response);
            } else {
                response.view({
                    project: project,
                    projectId: projectId
                });
            }
        });
    },

    /**
     * External link edit action. This will render GUI for editing specified link.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    edit: function(request, response) {
        var linkId = parseInt(request.param("linkId"), 10);

        // Fetch project data
        DataService.getProjectLink(linkId, function(error, link) {
            if (error) {
                ResponseService.makeError(error, request, response);
            } else {
                response.view({
                    link: link
                });
            }
        });
    },

    /**
     * Action to show all links that area attached to specified external link.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    links: function(request, response) {
        var linkId = parseInt(request.param("id"), 10);

        // Make parallel jobs to fetch basic data
        async.parallel(
            {
                // Fetch external link data
                externalLink: function(callback) {
                    DataService.getProjectLink(linkId, callback);
                },

                // Fetch user data
                users: function(callback) {
                    DataService.getUsers({}, callback);
                },

                // Fetch attached links
                links: function(callback) {
                    Link
                        .find()
                        .where({ externalLinkId: linkId })
                        .sort("objectName ASC")
                        .sort("objectId ASC")
                        .sort("link ASC")
                        .exec(function(error, links) {
                            callback(error, links);
                        });
                }
            },

            /**
             * Main callback function which is called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error
             * @param   {{}}            results
             */
            function(error, results) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    processData(results);
                }
            }
        );

        /**
         * Private function to process actual link data for GUI render.
         *
         * @param   {{}}    results Object that contains all necessary data for rendering view
         */
        function processData(results) {
            // Map founded links
            async.map(
                results.links,

                /**
                 * Iterator function which is called with every link.
                 *
                 * @param   {sails.model.link}  link
                 * @param   {Function}          callback
                 */
                function(link, callback) {
                    // Set author to link
                    link.author = _.find(results.users, function(user) {
                        return user.id === link.createdUserId;
                    });

                    switch (link.objectName) {
                        case "Story":
                            DataService.getStory(link.objectId, function(error, story) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    link.objectTitle = story.objectTitle();

                                    callback(null, link);
                                }
                            });
                            break;
                        case "Task":
                            DataService.getTask(link.objectId, function(error, task) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    link.objectTitle = task.objectTitle();

                                    callback(null, link);
                                }
                            });
                            break;
                    }
                },

                /**
                 * Callback function which is called after all links are mapped.
                 *
                 * @param   {null|Error}    error
                 */
                function(error) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        response.view(_.extend({
                            linkId: linkId
                        }, results));
                    }
                }
            );
        }
    }
};
