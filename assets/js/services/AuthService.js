/**
 * Taskboard angular service to check if current user is authenticated or not. This service
 * is called with route resolve method with specified routes. After successfully authentication
 * service will attach user object to $rootScope.currentUser where it's usable all over the
 * application.
 *
 * Note that you have to add this function call to all routes which needs to be authenticated on
 * server side.
 *
 * @todo It's not recommend to store data in services, figure this out.
 */
"use strict";

angular.module("TaskBoardServices")
    .factory("AuthService",
        [
            "$q", "$http", "$rootScope",
            function($q, $http, $rootScope) {
                // Initialize a new promise
                var deferred = $q.defer();

                $http
                    .get("/Auth/authenticate")
                    .success(function(data) { // Authenticated
                        $rootScope.currentUser = data;

                        deferred.resolve(data);
                    })
                    .error(function() {
                        $rootScope.message = {
                            text: "You need to sign in",
                            type: "error"
                        };

                        $rootScope.logout(true);

                        deferred.reject();
                    });

                return deferred.promise;
            }
        ]
    );
