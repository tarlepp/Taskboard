"use strict";

angular.module("TaskBoardControllers")
    .controller("AuthController",
        [
            "$scope", "$rootScope", "$http", "$location",
            function($scope, $rootScope, $http, $location) {
                $scope.user = {};

                $scope.login = function() {
                    $http
                    .post('/login', $scope.user)
                    .success(function(user) {
                        // No error: authentication OK
                        $rootScope.message = 'Authentication successful!';
                        $location.url("/");
                    })
                    .error(function() {
                        // Error: authentication failed
                        $rootScope.message = 'Authentication failed.';
                        $location.url("/login");
                    });
                };
            }
        ]
    );