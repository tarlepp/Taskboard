/**
 * UserLogin service that maps sails.js and angular.js together. Note that this endpoint
 * has only GET methods.
 *
 * Basically there is similar service model for all sails.js objects and usage of those
 * all are the same.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('UserLogin',
            [
                '$sailsSocket',
                '_',
                'DataService', 'BackendConfig',
                function($sailsSocket,
                         _,
                         DataService, BackendConfig
                ) {
                    var endpoint = 'UserLogin';
                    var items = [];
                    var handlers = {};

                    // Add handler for 'created' event
                    handlers.created = function(response) {
                        items.push(response);
                    };

                    // Subscribe to 'UserLogin' endpoint and attach event handlers to it
                    $sailsSocket
                        .subscribe(endpoint, function(message) {
                            if (handlers[message.verb]) {
                                handlers[message.verb](message);
                            } else {
                                console.log('todo: implement \'' + message.verb + '\' handler to \'UserLogin\' service.');
                            }
                        });

                    /**
                     * Helper function to parse used parameters in 'get' and 'count' methods.
                     *
                     * @param   {{}}    parameters  Used query parameters
                     *
                     * @returns {{params: {}}}
                     */
                    function parseParameters(parameters) {
                        parameters = parameters || {};

                        return {params: parameters};
                    }

                    // Load items from server
                    function load(parameters) {
                        return DataService
                            .collection(endpoint, parameters)
                            .success(function(response) {
                                items = response;

                                return items;
                            });
                    }

                    // Load items (IP) from server
                    function loadIp(parameters) {
                        return $sailsSocket.get(BackendConfig.url + '/' + endpoint + '/dataIp/', parseParameters(parameters));
                    }

                    // Load items (User-agent) from server
                    function loadAgent(parameters) {
                        return $sailsSocket.get(BackendConfig.url + '/' + endpoint + '/dataAgent/', parseParameters(parameters));
                    }

                    // Return count of items
                    function count(parameters) {
                        return DataService
                            .count(endpoint, parameters)
                            .success(function(response) {
                                return response;
                            });
                    }

                    // Return count of items (IP)
                    function countIp(parameters) {
                        return $sailsSocket.get(BackendConfig.url + '/' + endpoint + '/countIp/', parseParameters(parameters));
                    }

                    // Return count of items (User-agent)
                    function countAgent(parameters) {
                        return $sailsSocket.get(BackendConfig.url + '/' + endpoint + '/countAgent/', parseParameters(parameters));
                    }

                    return {
                        load: load,
                        loadIp: loadIp,
                        loadAgent: loadAgent,
                        count: count,
                        countIp: countIp,
                        countAgent: countAgent
                    };
                }
            ]
        );
}());
