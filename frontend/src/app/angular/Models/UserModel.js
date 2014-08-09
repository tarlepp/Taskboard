/**
 * User service that maps sails.js and angular.js together. Note that this service
 * handles all 'user' specified CRUD operations.
 *
 * Basically there is similar service model for all sails.js objects and usage of those
 * all are the same.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('UserModel',
            [
                '$sailsSocket', 'DataService',
                function($sailsSocket, DataService) {
                    var endpoint = 'user';
                    var user = {};
                    var users = [];
                    var handlers = {};

                    // Subscribe to 'user' endpoint and attach event handlers to it
                    $sailsSocket
                        .subscribe(endpoint, function(message) {
                            if (handlers[message.verb]) {
                                handlers[message.verb](message);
                            } else {
                                console.log('Implement handling for \'' + message.verb + '\' socket messages');
                            }
                        });

                    // Load users from server
                    function load(parameters) {
                        return DataService
                            .collection(endpoint, parameters)
                            .then(function(response) {
                                users = response.data;

                                return users;
                            });
                    }

                    // Fetch one user from server
                    function fetch(identifier, parameters) {
                        return DataService
                            .fetch(endpoint, identifier, parameters)
                            .then(function(response) {
                                user = response.data;

                                return user;
                            });
                    }

                    // Return count of users
                    function count(parameters) {
                        return DataService
                            .count(endpoint, parameters)
                            .then(function(response) {
                                return response;
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
