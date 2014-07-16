/**
 * TimeZone data service which fetched available timezones from backend.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('TimeZone',
            [
                'DataService',
                function(DataService) {
                    var endpoint = 'TimeZone';
                    var timezones = [];

                    // Load timezones from server
                    function get(parameters) {
                        return DataService
                            .collection(endpoint, parameters)
                            .success(function(response) {
                                timezones = response;

                                return timezones;
                            });
                    }

                    return {
                        get: get
                    };
                }
            ]
        );
}());
