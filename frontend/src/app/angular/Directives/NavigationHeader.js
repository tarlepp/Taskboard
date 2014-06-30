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
                        $scope.sprintSelectText = 'Choose project to show';

                        // Function to logout current user from taskboard
                        $scope.logout = function() {
                            // Reset common data
                            $scope.projects = [];
                            $scope.sprints = [];

                            Auth.logout();
                        };

                        // Todo: this sucks add some modal service to handle all this shit...

                        // Function to open user profile modal
                        $scope.openUserProfile = function() {
                            console.log('todo: openUserProfile');
                        };

                        // Function to open user profile modal
                        $scope.openUsers = function() {
                            console.log('todo: openUsers');
                        };

                        // Function to open general settings modal
                        $scope.openGeneralSettings = function() {
                            console.log('todo: openGeneralSettings');
                        };

                        // Function to open general settings modal
                        $scope.openAuthenticationServers = function() {
                            console.log('todo: openAuthenticationServers');
                        };

                        $scope.openProjectAdd = function() {
                            console.log('todo: openProjectAdd');
                        };

                        $scope.openProjectEdit = function() {
                            console.log('todo: openProjectEdit');
                        };

                        $scope.openProjectBacklog = function() {
                            console.log('todo: openProjectBacklog');
                        };

                        $scope.openProjectSprints = function() {
                            console.log('todo: openProjectSprints');
                        };

                        $scope.openProjectEpics = function() {
                            console.log('todo: openProjectEpics');
                        };

                        $scope.openProjectMilestones = function() {
                            console.log('todo: openProjectMilestones');
                        };

                        $scope.openProjectUsers = function() {
                            console.log('todo: openProjectUsers');
                        };

                        $scope.openProjectPhases = function() {
                            console.log('todo: openProjectPhases');
                        };

                        $scope.openProjectPlanning = function() {
                            console.log('todo: openProjectPlanning');
                        };

                        $scope.openProjectExternalLinks = function() {
                            console.log('todo: openProjectExternalLinks');
                        };

                        $scope.openProjectDelete = function() {
                            console.log('todo: openProjectDelete');
                        };

                        $scope.openSprintAdd = function() {
                            console.log('todo: openSprintAdd');
                        };

                        $scope.openSprintEdit = function() {
                            console.log('todo: openSprintEdit');
                        };

                        $scope.openSprintBacklog = function() {
                            console.log('todo: openSprintBacklog');
                        };

                        $scope.openSprintCharts = function() {
                            console.log('todo: openSprintCharts');
                        };

                        $scope.openSprintDelete = function() {
                            console.log('todo: openSprintDelete');
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
                                        $scope.sprintSelectText = sprints.length > 0
                                            ? 'Choose sprint to show'
                                            : 'No sprints in this project'
                                        ;

                                        $scope.sprints = sprints;
                                    });
                            }
                        });
                    }
                ]
            };
        });
}());
