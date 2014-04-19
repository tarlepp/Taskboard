"use strict";

// Specify TaskBoard application dependencies
angular.module("TaskBoardApplication", ["TaskBoard"]);

angular.module("TaskBoardApplication")
    .config(
        [
            "$routeProvider", "$routeSegmentProvider", "$locationProvider", "$httpProvider",
            function($routeProvider, $routeSegmentProvider, $locationProvider, $httpProvider) {

                var checkAuthStatus = function($q, $timeout, $http, $location, $rootScope) {
                    console.log("checkAuthStatus");
                    // Initialize a new promise
                    var deferred = $q.defer();

                    $http
                        .get("/Auth/Authenticated")
                        .success(function(data, status, headers, config) {
                            // Authenticated
                            if (data != "false") {
                                $timeout(deferred.resolve, 0);

                                $rootScope.currentUser = data;
                            } else { // Not Authenticated
                                console.log(" - Not authenticated");
                                $rootScope.message = "You need to log in.";

                                $timeout(function() {
                                    deferred.reject();
                                }, 0);

                                $location.url("/login");
                            }
                        })
                        .error(function(data, status, headers, config) {
                            $rootScope.message = "You need to log in.";
                            $timeout(function() {
                                deferred.reject();
                            }, 0);
                            $location.url("/login");
                         });


                    return deferred.promise;
                };

                $httpProvider.responseInterceptors.push(function($q, $location) {
                    return function(promise) {
                        return promise.then(
                            // Success: just return the response
                            function(response) {
                                return response;
                            },

                            // Error: check the error status to get only the 401
                            function(response) {
                                if (response.status === 401) {
                                    $location.url("/login");
                                }

                                return $q.reject(response);
                            }
                        );
                    }
                });


                $routeSegmentProvider.options.autoLoadTemplates = true;

                $routeSegmentProvider
                    .when("/login", "auth.login")

                    .when("/",      "board.main")
                    .when("/board", "board.main")

                    .segment("auth", {
                        templateUrl: "templates/auth/index.html",
                        controller: "AuthController"
                    })

                    .within()
                        .segment("login", {
                            templateUrl: "templates/auth/login.html"
                        })

                    .up()

                    .segment("board", {
                        templateUrl: "templates/board/index.html",
                        controller: "BoardController",
                        resolve: {
                            authStatus: checkAuthStatus
                        },
                        resolveFailed: {}
                    })

                    .within()
                        .segment("main", {
                            templateUrl: "templates/board/board.html"
                        })

                    .up()
                ;

                $routeProvider
                    .otherwise({
                        redirectTo: "/"
                    })
                ;
            }
        ]
    );

angular.module("TaskBoardApplication")
    .run(
        [
            "$rootScope", "$http",
            function($rootScope, $http) {
                $rootScope.message = "";
                $rootScope.currentUser = "";

                // Logout function is available in any pages
                $rootScope.logout = function(){
                    $rootScope.message = "Logged out.";
                    $http.post("/logout");
                };
            }
        ]
    );