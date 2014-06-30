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
        .factory('Project',
            [
                '$sailsSocket', 'DataService',
                function($sailsSocket, DataService) {
                    var endpoint = 'project';
                    var project = {};
                    var projects = [];
                    var handlers = {};

                    // Add handler for 'created' event
                    handlers.created = function(project) {
                        projects.push(project);
                    };

                    // Handler for 'updated' event
                    handlers.updated = function(project) {
                        handlers['removed'](project);
                        handlers['created'](project);
                    };

                    // Handler for 'removed' event
                    handlers.removed = function(project) {
                        _.remove(projects, function(projectOld) {
                            return projectOld.id === project.id;
                        });
                    };

                    // Subscribe to 'project' endpoint and attach event handlers to it
                    $sailsSocket
                        .subscribe(endpoint, function(message) {
                            handlers[message.verb](message);
                        });

                    // Load projects from server
                    function load(parameters) {
                        return DataService
                            .collection(endpoint, parameters)
                            .success(function(response) {
                                projects = response;

                                return projects;
                            });
                    }

                    // Fetch one project from server
                    function fetch(identifier, parameters) {
                        return DataService
                            .fetch(endpoint, identifier, parameters)
                            .success(function(response) {
                                project = response;

                                return project;
                            });
                    }

                    return {
                        load: load,
                        fetch: fetch
                    };
                }
            ]
        );
}());