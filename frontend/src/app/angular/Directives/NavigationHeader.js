/**
 * Navigation header directive.
 *
 * Purpose of this directive is to render application header navigation. This layout section contains
 * different data depending if user is logged in or not.
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('navigationHeader', function() {
            return {
                restrict: 'E',
                replace: true,
                scope: {},
                templateUrl: '/Taskboard/partials/Directives/NavigationHeader/header.html',
                controller: [
                    '$scope', 'DataService', 'CurrentUser', 'Auth',
                    function($scope, DataService, CurrentUser, Auth) {
                        $scope.user = CurrentUser.user;
                        $scope.auth = Auth;

                        $scope.logout = function() {
                            Auth.logout();
                        };
                    }
                ]
            };
        });
}());
