"use strict";

angular.module("TaskBoardControllers")
    .controller("BoardController",
        [
            "$scope", "$rootScope", "$cookieStore", "$routeParams", "SharedDataService",
            function($scope, $rootScope, $cookieStore, $routeParams, SharedDataService) {
                $scope.sharedData = SharedDataService.data;

                $rootScope.$watch("currentUser", function(valueNew) {
                    $scope.test = {json: valueNew};
                });

                // Initialize project and sprint id
                var projectId = parseInt($routeParams.projectId, 10),
                    sprintId = parseInt($routeParams.sprintId, 10);

                // Both values found
                if (!isNaN(projectId) && !isNaN(sprintId)) {
                    $scope.sharedData.filters.projectId = projectId;
                    $scope.sharedData.filters.sprintId = sprintId;
                } else if (!isNaN(projectId)) { // Only project id found
                    $scope.sharedData.filters.projectId = projectId;
                    $scope.sharedData.filters.sprintId = "";
                } else { // Otherwise no project or sprint id present on url
                    // Get possible previously selected project from cookie
                    projectId = parseInt($cookieStore.get("projectId"), 10);

                    // Yeah project founded from cookie, so use it
                    if (!isNaN(projectId)) {
                        $scope.sharedData.filters.projectId = projectId;

                        // Check if any sprint has been selected previously
                        sprintId = parseInt($cookieStore.get("sprintId_" + projectId), 10);

                        $scope.sharedData.filters.sprintId = !isNaN(sprintId) ? sprintId : "";
                    } else { // Otherwise reset values
                        $scope.sharedData.filters.projectId = "";
                        $scope.sharedData.filters.sprintId = "";
                    }
                }

                /**
                 * On route change we must store project and sprint id values to shared
                 * data filters object, so that everything is going to work like is should.
                 *
                 * @todo will this work on another routes also?
                 */
                $rootScope.$on("$routeChangeStart", function(event, next) {
                    var projectId, sprintId;

                    if (next.params.projectId && next.params.sprintId) {
                        projectId = parseInt(next.params.projectId, 10);
                        sprintId = parseInt(next.params.sprintId, 10);

                        if (isNaN(projectId)) {
                            $scope.sharedData.filters.projectId = "";
                            $scope.sharedData.filters.sprintId = "";
                        } else if (isNaN(sprintId)) {
                            $scope.sharedData.filters.projectId = projectId;
                            $scope.sharedData.filters.sprintId = "";
                        } else {

                            $scope.sharedData.filters.projectId = projectId;
                            $scope.sharedData.filters.sprintId = sprintId;
                        }
                    } else if (next.params.projectId) {
                        projectId = parseInt(next.params.projectId, 10);

                        if (isNaN(projectId)) {
                            $scope.sharedData.filters.projectId = "";
                            $scope.sharedData.filters.sprintId = "";
                        } else {
                            $scope.sharedData.filters.projectId = projectId;
                            $scope.sharedData.filters.sprintId = "";
                        }
                    }
                });
            }
        ]
    );