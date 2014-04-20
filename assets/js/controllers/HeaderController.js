"use strict";

angular.module("TaskBoardControllers")
    .controller("HeaderController",
        [
            "$scope", "SharedDataService",
            function($scope, SharedDataService) {
                $scope.sharedData = SharedDataService.data;

                $scope.$watch("sharedData.filters.projectId", function(newValue, oldValue) {
                    console.log(newValue);
                });
            }
        ]
    );