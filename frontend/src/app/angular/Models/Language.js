/**
 * Language data service which fetched available languages from backend.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('Language',
            [
                'DataService',
                function(DataService) {
                    var endpoint = 'Language';
                    var languages = [];

                    // Load languages from server
                    function get(parameters) {
                        return DataService
                            .collection(endpoint, parameters)
                            .success(function(response) {
                                languages = response;

                                return languages;
                            });
                    }

                    return {
                        get: get
                    };
                }
            ]
        );
}());
