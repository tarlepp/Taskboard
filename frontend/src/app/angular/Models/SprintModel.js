/**
 * Sprint service that maps sails.js and angular.js together. Note that this service
 * handles all 'sprint' specified CRUD operations.
 *
 * Basically there is similar service model for all sails.js objects and usage of those
 * all are the same.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('SprintModel',
            [
                '$sailsSocket', 'DataService', '_',
                function($sailsSocket, DataService, _) {
                    var endpoint = 'sprint';
                    var sprint = {};
                    var sprints = [];
                    var handlers = {};

                    // Add handler for 'created' event
                    handlers.created = function(sprint) {
                        sprints.push(sprint);
                    };

                    // Handler for 'updated' event
                    handlers.updated = function(sprint) {
                        handlers.removed(sprint);
                        handlers.created(sprint);
                    };

                    // Handler for 'removed' event
                    handlers.removed = function(sprint) {
                        _.remove(sprints, function(sprintOld) {
                            return sprintOld.id === sprint.id;
                        });
                    };

                    // Subscribe to 'sprint' endpoint and attach event handlers to it
                    $sailsSocket
                        .subscribe(endpoint, function(message) {
                            if (handlers[message.verb]) {
                                handlers[message.verb](message);
                            } else {
                                console.log('Implement handling for \'' + message.verb + '\' socket messages');
                            }
                        });

                    // Load sprints from server
                    function load(parameters) {
                        return DataService
                            .collection(endpoint, parameters)
                            .then(function(response) {
                                sprints = response.data;

                                return sprints;
                            });
                    }

                    // Fetch one sprint from server
                    function fetch(identifier, parameters) {
                        return DataService
                            .fetch(endpoint, identifier, parameters)
                            .then(function(response) {
                                sprint = response.data;

                                return sprint;
                            });
                    }

                    // Return count of sprints
                    function count(parameters) {
                        return DataService
                            .count(endpoint, parameters)
                            .then(function(response) {
                                return response.data;
                            });
                    }

                    return {
                        load: load,
                        fetch: fetch,
                        count: count
                    };
                }
            ]
        );
}());