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
        .factory('UserLoginModel',
            [
                '$sailsSocket',
                '_',
                'DataService', 'BackendConfig',
                function($sailsSocket,
                         _,
                         DataService, BackendConfig
                ) {
                    var endpoint = 'UserLogin';

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
                        return DataService.collection(endpoint, parameters);
                    }

                    // Load items (IP) from server
                    function loadIp(parameters) {
                        return $sailsSocket.get(
                            BackendConfig.url + '/' + endpoint + '/dataIp/',
                            parseParameters(parameters)
                        );
                    }

                    // Load items (User-agent) from server
                    function loadAgent(parameters) {
                        return $sailsSocket.get(
                            BackendConfig.url + '/' + endpoint + '/dataAgent/',
                            parseParameters(parameters)
                        );
                    }

                    // Load items (Browser family) from server
                    function loadBrowserFamily(parameters) {
                        return $sailsSocket.get(
                            BackendConfig.url + '/' + endpoint + '/dataBrowserFamily/',
                            parseParameters(parameters)
                        );
                    }

                    // Load items (OS family) from server
                    function loadOsFamily(parameters) {
                        return $sailsSocket.get(
                            BackendConfig.url + '/' + endpoint + '/dataOsFamily/',
                            parseParameters(parameters)
                        );
                    }

                    // Return count of items
                    function count(parameters) {
                        return DataService.count(endpoint, parameters);
                    }

                    // Return count of items (IP)
                    function countIp(parameters) {
                        return $sailsSocket.get(
                            BackendConfig.url + '/' + endpoint + '/countIp/',
                            parseParameters(parameters)
                        );
                    }

                    // Return count of items (User-agent)
                    function countAgent(parameters) {
                        return $sailsSocket.get(
                            BackendConfig.url + '/' + endpoint + '/countAgent/',
                            parseParameters(parameters)
                        );
                    }

                    // Return count of items (Browser family)
                    function countBrowserFamily(parameters) {
                        return $sailsSocket.get(
                            BackendConfig.url + '/' + endpoint + '/countBrowserFamily/',
                            parseParameters(parameters)
                        );
                    }

                    // Return count of items (OS family)
                    function countOsFamily(parameters) {
                        return $sailsSocket.get(
                            BackendConfig.url + '/' + endpoint + '/countOsFamily/',
                            parseParameters(parameters)
                        );
                    }

                    return {
                        load: load,
                        loadIp: loadIp,
                        loadAgent: loadAgent,
                        loadBrowserFamily: loadBrowserFamily,
                        loadOsFamily: loadOsFamily,
                        count: count,
                        countIp: countIp,
                        countAgent: countAgent,
                        countBrowserFamily: countBrowserFamily,
                        countOsFamily: countOsFamily
                    };
                }
            ]
        );
}());
