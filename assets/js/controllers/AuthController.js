"use strict";

angular.module("TaskBoardControllers")
    .controller("AuthController",
        [
            "$scope", "$rootScope", "$http", "$location",
            function($scope, $rootScope, $http, $location) {
                $scope.user = {};

                if ($location.$$path == "/logout") {
                    $rootScope.logout();
                }

                $scope.login = function() {
                    $http
                        .post("/Auth/login", {
                            username: $scope.user.username,
                            password: $scope.user.password,
                            rememberMe: $scope.user.rememberMe,
                            _csrf: $rootScope.csrfToken
                        })
                        .success(function(user) {
                            // No error: authentication OK
                            $rootScope.message = "Signed in successfully";
                            $location.url("/");
                        })
                        .error(function(data, status, headers, config) {
                            // Error: authentication failed
                            $rootScope.message = data;

                            $location.url("/login");
                        });
                };
            }
        ]
    );