/**
 * Project service that maps sails.js and angular.js together. Note that this service
 * handles all 'project' specified CRUD operations.
 *
 * Basically there is similar service model for all sails.js objects and usage of those
 * all are the same.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('ProjectModel',
            [
                '$sailsSocket',
                '_',
                'DataService', 'HelperService',
                function($sailsSocket,
                         _,
                         DataService, HelperService
                ) {
                    // Determine used service variables
                    var endpoint = 'project';
                    var handlers = {};
                    var service = {};

                    // Subscribe to specified endpoint for socket messages
                    $sailsSocket
                        .subscribe(endpoint, function(message) {
                            if (handlers[message.verb]) {
                                handlers[message.verb](message);
                            } else {
                                console.log('Implement handling for \'' + message.verb + '\' socket messages');
                            }
                        });

                    // Initialize used service cache
                    service.project = {};
                    service.projects = [];

                    /**
                     * Add handler for 'created' event
                     *
                     * @param   {socket.message.create} data
                     */
                    handlers.created = function(data) {
                        service.projects.push(data);
                    };

                    /**
                     * Handler for 'updated' event.
                     *
                     * @param   {socket.message.update} data
                     */
                    handlers.updated = function(data) {
                        // Determine updated project item data
                        var project = _.find(service.projects, function(project) {
                            if (project.id == data.id) {
                                return _.assign(project, data.data);
                            }
                        });

                        // Remove updated item from current project collection
                        _.remove(service.projects, function(project) {
                            return project.id == data.id;
                        });

                        // And finally add updated project object back to collection
                        service.projects.push(project);

                        // We need to refresh project select component
                        HelperService.refreshSelectPicker('#projectSelect');
                    };

                    /**
                     * Handler for 'removed' event
                     *
                     * @param   {socket.message.remove} data
                     */
                    handlers.removed = function(data) {
                        _.remove(service.projects, function(projectOld) {
                            return projectOld.id === data.id;
                        });
                    };

                    /**
                     * Actual public service methods below:
                     */

                    /**
                     * Service load method. Note that calling this multiple times will overwrite
                     * existing service project cache.
                     *
                     * @param   {{}}        [parameters]    Used search parameters
                     * @param   {Boolean}   [noStore]       No store on data service
                     *
                     * @returns {Promise|models.project[]}
                     */
                    service.load = function(parameters, noStore) {
                        noStore = noStore || false;

                        return DataService
                            .collection(endpoint, parameters)
                            .then(function(response) {
                                if (!_.isArray(response.data) && _.isObject(response.data)) {
                                    response.data = [response.data];
                                }

                                if (noStore) {
                                    return response.data;
                                } else {
                                    service.projects = response.data;

                                    return service.projects;
                                }
                            });
                    };

                    /**
                     * Method to fetch single project object from backend with specified
                     * parameters.
                     *
                     * @param   {Number}    identifier      Project id
                     * @param   {{}}        [parameters]    Extra parameters for query
                     *
                     * @returns {Promise|models.project}
                     */
                    service.fetch = function(identifier, parameters) {
                        return DataService
                            .fetch(endpoint, identifier, parameters)
                            .then(function(response) {
                                service.project = response.data;

                                return service.project;
                            });
                    };

                    /**
                     * Service method to get project count with specified parameters.
                     *
                     * @param   {{}}    [parameters]    Extra parameters for query
                     *
                     * @returns {Promise|models.count}
                     */
                    service.count = function(parameters) {
                        return DataService
                            .count(endpoint, parameters)
                            .then(function(response) {
                                return response.data;
                            });
                    };

                    /**
                     * Service method to update specified project model.
                     *
                     * @param   {Number}            projectId   Project id to update
                     * @param   {models.project}    data        Data to update
                     *
                     * @returns {Promise|models.project}
                     */
                    service.update = function(projectId, data) {
                        return DataService
                            .update(endpoint, projectId, data)
                            .then(function(response) {
                                // Make necessary update actions on service
                                handlers.updated({data: response.data, id: response.data.id});

                                return response;
                            });
                    };

                    return service;
                }
            ]
        );
}());
