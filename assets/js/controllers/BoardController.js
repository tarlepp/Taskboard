"use strict";

angular.module("TaskBoardControllers")
    .controller("BoardController",
        [
            "$scope", "SharedDataService",
            function($scope, SharedDataService) {
                $scope.sharedData = SharedDataService.data;
            }
        ]
    );