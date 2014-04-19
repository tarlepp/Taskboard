"use strict";

angular.module("TaskBoardControllers")
    .controller("HeaderController",
        [
            "$scope",
            function($scope) {
                $scope.title = "Task<span>Board</span>";
            }
        ]
    );