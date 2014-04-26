"use strict";

angular.module("TaskBoardControllers")
    .controller("AuthController",
        [
            "$scope", "$rootScope", "$http", "$location",
            function($scope, $rootScope, $http, $location) {
                // User has already signed in so redirect back to board
                if ($rootScope.currentUser) {
                    $location.url("/board");
                }

                $scope.user = {};

                if ($location.$$path == "/logout") {
                    $rootScope.logout();
                }

                /**
                 * Function to make user sign in to Taskboard application. Actual login is done in
                 * backend side on "/Auth/login" action.
                 */
                $scope.login = function() {
                    $http
                        .post("/Auth/login", {
                            username: $scope.user.username,
                            password: $scope.user.password,
                            rememberMe: $scope.user.rememberMe,
                            _csrf: $rootScope.csrfToken
                        })
                        .success(function() {
                            $rootScope.message = "Signed in successfully";

                            $location.url("/board");
                        })
                        .error(function(data) {
                            $rootScope.message = data;

                            $location.url("/login");
                        });
                };
            }
        ]
    );