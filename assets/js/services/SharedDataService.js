"use strict";

angular.module("TaskBoardServices")
    .factory('SharedDataService',
        [
            "$rootScope", "$cookies", "$sails",
            function($rootScope, $cookies, $sails) {
                var shared = {};

                $rootScope.$watch("currentUser", function(newValue, oldValue) {
                    if (newValue) {
                        $sails.get("/Project")
                            .success(function(data) {
                                shared.data.options.projects = data;

                                var projectId = parseInt($cookies.projectId, 10);
                                var project = _.find(data, function(project) {
                                    return project.id === projectId;
                                });

                                if (project) {
                                    shared.data.filters.projectId = projectId;

                                    var cookie = "sprintId_" +  projectId;

                                    if ($cookies[cookie]) {
                                        shared.data.filters.sprintId = parseInt($cookies[cookie], 10);
                                    } else {
                                        shared.data.filters.sprintId = "";
                                    }
                                }
                            })
                            .error(function(data) {
                                console.log("error");
                            });
                    }
                });

                shared.data = {
                    filters: {
                        projectId: "",
                        sprintId: ""
                    },
                    options: {
                        projects: [],
                        sprints: []
                    }
                };

                return shared;
            }
        ]
    );