"use strict";

angular.module("TaskBoardServices")
    .factory('SharedDataService',
        [
            function() {
                var shared = {};

                shared.data = {
                    filters: {
                        projectId: "",
                        sprintId: ""
                    },
                    params: {
                        projectId: "",
                        sprintId: ""
                    }
                };

                return shared;
            }
        ]
    );