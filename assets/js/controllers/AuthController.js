/**
 * Auth controller that is used on sign in page on Taskboard application. Basically this
 * controller just handles login / logout functionality on application.
 */
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

                // Logout
                if ($location.$$path == "/logout") {
                    $rootScope.logout();
                }

                $scope.user = {};

                /**
                 * Function to make user sign in to Taskboard application. Actual login is done in
                 * backend side on "/Auth/login" action.
                 */
                $scope.login = function() {
                    $http
                        .post("/Auth/login", $scope.user)
                        .success(function() {
                            $rootScope.message = "Signed in successfully";

                            $location.url("/");
                        })
                        .error(function(response) {
                            $rootScope.currentUser = "";

                            if (response.message && response.status) {
                                $rootScope.message = {
                                    text: response.message,
                                    type: "error"
                                };
                            } else {
                                $rootScope.message = response;
                            }

                            $location.url("/login");
                        });
                };
            }
        ]
    );