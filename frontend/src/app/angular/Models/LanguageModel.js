/**
 * Language data service which fetched available languages from backend.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('LanguageModel',
            [
                'DataService',
                function(DataService) {
                    var endpoint = 'Language';
                    var languages = [];

                    // Load languages from server
                    function get(parameters) {
                        return DataService
                            .collection(endpoint, parameters)
                            .then(function(response) {
                                languages = response.data;

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
