/**
 * Navigation header directive.
 *
 * Purpose of this directive is to render application header navigation. This layout section contains
 * different data depending if user is logged in or not.
 *
 * Also note that selected project + current user combination can has different access role to selected
 * project.
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
                    '$scope', '$filter',
                    'CurrentUser', 'Auth', 'SharedData',
                    'Project', 'Sprint',
                    function($scope, $filter,
                             CurrentUser, Auth, SharedData,
                             Project, Sprint
                    ) {
                        $scope.sharedData = SharedData.data;
                        $scope.user = CurrentUser.user;
                        $scope.auth = Auth;
                        $scope.projects = [];
                        $scope.sprints = [];

                        // Function to logout current user from taskboard
                        $scope.logout = function() {
                            // Reset common data
                            $scope.projects = [];
                            $scope.sprints = [];

                            Auth.logout();
                        };

                        /**
                         * Helper function to format sprint name to 'standard' format.
                         *
                         * @todo    make service for there?
                         *
                         * @param   {models.sprint} sprint
                         *
                         * @returns {string}
                         */
                        $scope.getSprintTitle = function(sprint) {
                            var bits = [
                                $filter('amDateFormat')(sprint.dateStart, 'L'),
                                $filter('amDateFormat')(sprint.dateEnd, 'L'),
                                sprint.title
                            ];

                            return bits.join(' - ');
                        };

                        /**
                         * Watcher for user id data, if this is not undefined then we have a real
                         * user on the other end.
                         *
                         * Note that this load() will also subscribe user to listen socket messages
                         * from 'Sprint' endpoint.
                         *
                         * @todo    Do we need Auth check also?
                         */
                        $scope.$watch('user().id', function(valueNew) {
                            if (!_.isUndefined(valueNew)) {
                                Project
                                    .load()
                                    .success(function(projects) {
                                        $scope.projects = projects;
                                    });
                            }
                        });

                        /**
                         * Watcher for selected project. If value is changed we need to load project
                         * specified sprint data from server.
                         *
                         * Note that this load() will also subscribe user to listen socket messages
                         * from 'Sprint' endpoint.
                         *
                         * @todo    Do we need Auth check also?
                         */
                        $scope.$watch('sharedData.projectId', function(valueNew, valueOld) {
                            $scope.sprint = {};
                            $scope.sharedData.sprintId = 0;

                            if (valueNew !== valueOld) {
                                Sprint
                                    .load({projectId: valueNew})
                                    .success(function(sprints) {
                                        $scope.sprints = sprints;
                                    });
                            }
                        });
                    }
                ]
            };
        });
}());
