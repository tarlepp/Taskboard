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
        .factory('Sprint',
            [
                '$sailsSocket', 'DataService',
                function($sailsSocket, DataService) {
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
                        handlers['removed'](sprint);
                        handlers['created'](sprint);
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
                            handlers[message.verb](message);
                        });

                    // Load sprints from server
                    function load(parameters) {
                        return DataService
                            .collection(endpoint, parameters)
                            .success(function(response) {
                                sprints = response;

                                return sprints;
                            });
                    }

                    // Fetch one sprint from server
                    function fetch(identifier, parameters) {
                        return DataService
                            .fetch(endpoint, identifier, parameters)
                            .success(function(response) {
                                sprint = response;

                                return sprint;
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