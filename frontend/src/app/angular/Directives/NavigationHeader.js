/**
 * Navigation header directive.
 *
 * Purpose of this directive is to render application header navigation. This layout section contains
 * different data depending if user is logged in or not.
 *
 * Also note that selected project + current user combination can has different access role to selected
 * project.
 *
 * @todo text translations?
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('navigationHeader', function() {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: '/Taskboard/partials/Directives/NavigationHeader/header.html',
                controller: [
                    '$scope', '$filter',
                    '_',
                    'CurrentUser', 'Auth', 'SharedData', 'ModalService', 'HelperService',
                    'ProjectModel', 'SprintModel',
                    function($scope, $filter,
                             _,
                             CurrentUser, Auth, SharedData, ModalService, HelperService,
                             ProjectModel, SprintModel
                    ) {
                        $scope.sharedData = SharedData.data;
                        $scope.user = CurrentUser.user;
                        $scope.auth = Auth;
                        $scope.sprintSelectText = 'Choose project to show';
                        $scope.projectSelectText = 'No projects yet...';
                        $scope.modalService = ModalService;

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
                         * @todo    make service for this?
                         *
                         * @param   {models.sprint} sprint
                         *
                         * @returns {string}
                         */
                        $scope.getSprintTitle = function(sprint) {
                            var bits = [
                                $filter('amDateFormat')(sprint.dateStart, $scope.user().momentFormatDate),
                                $filter('amDateFormat')(sprint.dateEnd, $scope.user().momentFormatDate),
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
                         */
                        $scope.$watch('user().id', function(valueNew) {
                            if (!_.isUndefined(valueNew)) {
                                ProjectModel
                                    .load()
                                    .then(function(projects) {
                                        $scope.projectSelectText = projects.length > 0 ?
                                            'Choose project to show' : 'No projects yet...';

                                        $scope.projects = projects;

                                        HelperService.refreshSelectPicker('#projectSelect');
                                    });
                            }
                        });

                        /**
                         * Watcher for selected project. If value is changed we need to load project
                         * specified sprint data from server.
                         *
                         * Note that this load() will also subscribe user to listen socket messages
                         * from 'Sprint' endpoint.
                         */
                        $scope.$watch('sharedData.projectId', function(valueNew, valueOld) {
                            $scope.sprint = {};
                            $scope.sharedData.sprintId = 0;

                            if (valueNew !== valueOld) {
                                SprintModel
                                    .load({project: valueNew})
                                    .then(function(sprints) {
                                        if (!_.isArray(sprints) && _.isObject(sprints)) {
                                            sprints = [sprints];
                                        }

                                        $scope.sprintSelectText = sprints.length > 0 ?
                                            'Choose sprint to show' : 'No sprints in this project';

                                        $scope.sprints = sprints;

                                        HelperService.refreshSelectPicker('#sprintSelect');
                                    });
                            }
                        });
                    }
                ]
            };
        });
}());
