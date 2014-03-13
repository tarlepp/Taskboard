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
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    index: function(request, response) {
        var objectId = request.param("objectId");
        var objectName = request.param("objectName");

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
                 * Fetch project external links, that can be attached to current object. These
                 * external links are attached to project.
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
                    ResponseService.makeError(error, request, response);
                } else {
                    response.view({
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
     * Action to fetch object links that are attached to specified sprint.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    getLinks: function(request, response) {
        var sprintId = parseInt(request.param("sprintId"), 10);
        var projectId = parseInt(request.param("projectId"), 10);

        /**
         * Make waterfall job to determine specified sprint stories and tasks of those.
         * These will be used to fetch actual attached link data for those objects.
         */
        async.waterfall(
            [
                // Fetch sprint stories
                function(callback) {
                    DataService.getStories({sprintId: sprintId}, callback);
                },

                /**
                 * Waterfall job to fetch tasks of founded stories in specified sprint.
                 *
                 * @param   {sails.model.story[]}   stories     Story object
                 * @param   {Function}              callback    Callback function
                 */
                function(stories, callback) {
                    var where = [];
                    var whereLinks = [];

                    // Iterate stories and make necessary where conditions
                    _.each(stories, function(story) {
                        where.push({storyId: story.id});
                        whereLinks.push({objectId: story.id, objectName: "Story"});
                    });

                    // Fetch tasks for founded stories
                    DataService.getTasks({or: where}, function(error, tasks) {
                        // Iterate tasks and add task queries to main where array
                        _.each(tasks, function(task) {
                            whereLinks.push({objectId: task.id, objectName: "Task"});
                        });

                        callback(error, whereLinks);
                    });
                }
            ],

            /**
             * Main callback function which is called after all waterfall jobs are done
             * or an error occurred while processing those.
             *
             * @param   {null|Error}    error
             * @param   {{}}            where
             */
            function(error, where) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    fetchAttachedLinks(where)
                }
            }
        );

        /**
         * Private function to fetch actual links that are attached to specified sprint
         * stories and tasks.
         *
         * @param   {{}}    where   Used where parameters for links fetch.
         */
        function fetchAttachedLinks(where) {
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
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        // Iterate each attached link and add external link data to it
                        _.each(results.attachedLinks, function(link) {
                            link.externalLink = _.find(results.externalLinks, function(externalLink) {
                                return externalLink.id === link.externalLinkId;
                            });
                        });

                        response.json(results.attachedLinks);
                    }
                }
            );
        }
    }
};
