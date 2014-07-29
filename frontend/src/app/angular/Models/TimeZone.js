/**
 * TimeZone data service which fetched available timezones from backend.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('TimeZone',
            [
                '$q', 'DataService',
                function($q, DataService) {
                    var endpoint = 'TimeZone';
                    var timezones = [];

                    // Load timezones from server
                    function get(parameters) {
                        if (timezones.length > 0) {
                            var deferred = $q.defer();

                            deferred.resolve({data: timezones});

                            return deferred.promise;
                        } else {
                            return DataService
                                .collection(endpoint, parameters)
                                .success(function(response) {
                                    timezones = response;

                                    return timezones;
                                });
                        }
                    }

                    return {
                        get: get
                    };
                }
            ]
        );
}());
