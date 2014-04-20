"use strict";

angular.module("TaskBoardServices")
    .factory('SharedDataService',
        [
            "$http",
            function($http) {
                var shared = {};

                var projects = [
                    {id: 1, name: "test"},
                    {id: 2, name: "test2"},
                    {id: 3, name: "test3"}
                ];

                shared.data = {
                    filters: {
                        projectId: "",
                        sprintId: ""
                    },
                    options: {
                        projects: projects,
                        sprints: []
                    }
                };

                return shared;
            }
        ]
    );