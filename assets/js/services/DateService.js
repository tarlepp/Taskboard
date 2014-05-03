/**
 * Generic date service class for date manipulation services.
 */
"use strict";

angular.module("TaskBoardServices")
    .factory("DateService",
        [
            "$http", "$q",
            function($http, $q) {
                return {
                    /**
                     * Method to fetch all moment timezone data adn parse that to "proper" format for GUIs.
                     *
                     * @returns {Deferred.promise}
                     */
                    getTimezones: function() {
                        // Initialize a new promise
                        var deferred = $q.defer();

                        // Fetch moment timezone data
                        $http
                            .get("/bower_components/moment-timezone/moment-timezone.json")
                            .success(function(data) {
                                var timezones = [];

                                _.each(data.links, function(value, key) {
                                    timezones.push({
                                        id: key,
                                        name: value
                                    });
                                });

                                timezones = _.uniq(_.sortBy(timezones, "name"), false, function(timezone) {
                                    return timezone.name;
                                });

                                deferred.resolve(timezones);
                            })
                            .error(function(data) {
                                deferred.reject(data);
                            });

                        return deferred.promise;
                    }
                };
            }
        ]
    );