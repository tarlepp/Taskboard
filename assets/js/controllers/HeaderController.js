"use strict";

angular.module("TaskBoardControllers")
    .controller("HeaderController",
        [
            "$scope", "$sails", "$cookies", "SharedDataService",
            function($scope, $sails, $cookies, SharedDataService) {
                $scope.sharedData = SharedDataService.data;

                $scope.$watch("sharedData.filters.projectId", function(newValue, oldValue) {
                    if (newValue) {
                        $scope.sharedData.filters.sprintId = "";
                        $cookies.projectId = newValue;

                        var cookie = "sprintId_" + newValue;

                        $sails.get("/Sprint/?project=" + newValue)
                            .success(function(data) {
                                if ($cookies[cookie]) {
                                    var sprint = _.find(data, function(sprint) {
                                        return sprint.id === parseInt($cookies[cookie], 10);
                                    });

                                    if (sprint) {
                                       $scope.sharedData.filters.sprintId = parseInt(sprint.id, 10);
                                    }
                                }

                                $scope.sharedData.options.sprints = data;
                            })
                            .error(function(data) {
                                console.log(data);
                                console.log("error");
                            });
                    }
                });

                $scope.$watch("sharedData.filters.sprintId", function(newValue, oldValue) {
                    if (newValue && oldValue && newValue !== oldValue) {
                        var cookie = "sprintId_" + $scope.sharedData.filters.projectId;

                        $cookies[cookie] = parseInt(newValue, 10);
                    }
                });
            }
        ]
    );