/**
 * Service to inject CSRF token to $rootScope, this is needed with every $http and $sailSocket request
 * otherwise those will fail at sails.js endpoint. Service set provided CSRF token to $rootScope.csrfToken
 * attribute where it's usable from anywhere in the application.
 *
 * Service is called with route resolve callbacks within necessary routes.
 *
 * @todo It's not recommend to store data in services, figure this out.
 */
"use strict";

angular.module("TaskBoardServices")
    .factory("CsrfTokenService",
        [
            "$q", "$http", "$rootScope",
            function($q, $http, $rootScope) {
                // Initialize a new promise
                var deferred = $q.defer();

                // Fetch CSRF token for this session
                $http
                    .get("/csrfToken")
                    .success(function(data) {
                        $rootScope.csrfToken = data._csrf;

                        deferred.resolve(data._csrf);
                    })
                    .error(function(data) {
                        $rootScope.csrfToken = "";

                        $rootScope.makeMessage({
                            text: data,
                            type: "error"
                        });

                        deferred.reject(data);
                    });

                return deferred.promise;
            }
        ]
    );