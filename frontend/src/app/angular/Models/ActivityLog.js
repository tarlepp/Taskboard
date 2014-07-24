/**
 * Activity log service that maps sails.js 'History' API and angular.js together.
 *
 * Note that this service has only GET methods, history data is write automatic
 * and never updated. Also note that this service will not subscribe 'History'
 * API to any events.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('ActivityLog',
            [
                'DataService',
                function(DataService) {
                    var endpoint = 'history';
                    var histories = [];

                    // Load history rows from server
                    function load(parameters) {
                        return DataService
                            .collection(endpoint, parameters)
                            .success(function(response) {
                                histories = response;

                                return histories;
                            });
                    }

                    // Return count of history rows
                    function count(parameters) {
                        return DataService
                            .count(endpoint, parameters)
                            .success(function(response) {
                                return response;
                            });
                    }

                    return {
                        load: load,
                        count: count
                    };
                }
            ]
        );
}());
