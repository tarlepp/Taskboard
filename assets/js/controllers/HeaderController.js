"use strict";

angular.module("TaskBoardControllers")
    .controller("HeaderController",
        [
            "$scope", "$rootScope", "$location", "$sailsSocket", "$cookieStore", "$modal", "SharedDataService", "AuthService", "DateService",
            function($scope, $rootScope, $location, $sailsSocket, $cookieStore, $modal, SharedDataService, AuthService, DateService) {
                $scope.sharedData = SharedDataService.data;

                /**
                 * Initialize projects and sprints arrays. These are populated within signed
                 * in user and project selection.
                 *
                 * @type {Array}
                 */
                $scope.projects = [];
                $scope.sprints = [];

                /**
                 * Function to return sprint select text for possible placeholder option. Actual
                 * option value depends on if we have project selected or that selected project
                 * hasn't any sprints to select from.
                 *
                 * @returns {string}
                 */
                $scope.sprintSelectText = function() {
                    var output = "";

                    if (!$scope.sharedData.filters.projectId) {
                        output = "Select project";
                    } else if ($scope.sprints.length === 0) {
                        output = "No sprints in this project";
                    } else {
                        output = "Choose sprint to show";
                    }

                    return output;
                };

                $scope.openUserProfile = function() {
                    var modalInstance = $modal.open({
                        templateUrl: "templates/user/profile.html",
                        controller: "UserController",
                        backdrop: "static",
                        windowClass: "modal fade in",
                        resolve: {
                            user: function() {
                                return AuthService.authenticate();
                            },
                            timezones: function() {
                                return DateService.getTimezones();
                            }
                        }
                    });
                };

                /**
                 * Watcher for currentUser attribute, if this is set or changed we must fetch
                 * project data from server. Note that this watcher will also set selected
                 * project and sprint id attributes to shared data service so another controllers
                 * can access to those.
                 */
                $rootScope.$watch("currentUser", function(newValue, oldValue) {
                    if (newValue && newValue !== oldValue) {
                        $sailsSocket.get("/Project")
                            .success(function(data) {
                                var project = _.find(data, function(project) {
                                    return project.id == $scope.sharedData.filters.projectId;
                                });

                                // Previously selected project not found, so reset sprint id
                                if (!project) {
                                    $scope.sharedData.filters.sprintId = "";
                                }

                                $scope.projects = data;
                            })
                            .error(function(data) {
                                $rootScope.message = {
                                    text: data,
                                    type: "error"
                                };
                            });
                    }
                });

                /**
                 * Watcher for projectId attribute, this will change whenever user selects new
                 * project from header navigation bar. This will trigger project sprint data fetch
                 * from server. Before data fetch watcher is going to store selected project id
                 * to cookie so that in next login user has correct project selected.
                 *
                 * Note that this watcher also checks if current sprint id (located in shared data)
                 * is found from fetched sprints, if not try to use cookie value from currently
                 * selected project (cookie name: sprintId_{projectId}) and try to find that in
                 * fetched sprint list.
                 *
                 * If sprint isn't founded watcher will clear '$scope.sharedData.filters.sprintId'
                 * variable because currently active one is just wrong... And if sprint is is founded
                 * from cookie watcher will set that value to that shared data variable.
                 */
                $scope.$watch("sharedData.filters.projectId", function(newValue, oldValue) {
                    if (newValue && newValue != oldValue) {
                        $cookieStore.put("projectId", newValue);

                        // Fetch project sprints
                        $sailsSocket
                            .get("/Sprint/", {params: {project: newValue}})
                            .success(function(data) {
                                var sprint = _.find(data, function(sprint) {
                                    return sprint.id == $scope.sharedData.filters.sprintId;
                                });

                                var sprintFound = false;
                                var sprintId = parseInt($cookieStore.get("sprintId_" + newValue), 10);

                                // Yeah sprint is in current scope
                                if (sprint) {
                                    sprintFound = true;
                                } else if (!isNaN(sprintId)) { // Otherwise founded sprint id from cookie
                                    sprint = _.find(data, function(sprint) {
                                        return sprint.id == sprintId;
                                    });

                                    // Yeah sprint founded from cookie, so set it to shared data
                                    if (sprint) {
                                        $scope.sharedData.filters.sprintId = sprintId;

                                        sprintFound = true;
                                    }
                                }

                                // No sprint data or sprint not found so reset sprint id from filters
                                if (data.length === 0 || !sprintFound) {
                                    $scope.sharedData.filters.sprintId = "";

                                    $location.path("/board/" + $scope.sharedData.filters.projectId);
                                }

                                $scope.sprints = data;
                            })
                            .error(function(data) {
                                $rootScope.message = {
                                    text: data,
                                    type: "error"
                                };
                            });
                    }
                });

                /**
                 * Watcher for sprint selection. Purpose of this is just to save selected sprint
                 * to cookie and change url on browser location url. Cookie is needed to store
                 * last selected sprint id for project so refreshing page or project change will
                 * automatic select last viewed sprint on that project.
                 */
                $scope.$watch("sharedData.filters.sprintId", function(newValue, oldValue) {
                    if (newValue && newValue != oldValue) {
                        var sprintId = parseInt(newValue, 10);

                        $cookieStore.put("sprintId_" + $scope.sharedData.filters.projectId, sprintId);

                        $location.path("/board/" + $scope.sharedData.filters.projectId + "/sprint/" + sprintId);
                    }
                });


                // Below is just some demo stuff

                $sailsSocket.subscribe("sprint", function(message) {
                    console.log(message);
                });

                $sailsSocket
                    .get("/Sprint/subscribe")
                    .success(function(data) {
                    })
                    .error(function(data) {
                    });

                $scope.testFoo  = function() {
                    var foo = {
                        title: "testi",
                        dateStart: "2014-01-01",
                        dateEnd: "2014-02-01",
                        project: 1,
                        createdUser: 1,
                        updatedUser: 1
                    };

                    $sailsSocket
                        .post("/Sprint", foo)
                        .success(function(data){
                            console.log("success");
                            console.log(data);
                            console.log(foo);
                        })
                        .error(function(data) {
                            console.log("error");
                            console.log(data);
                            console.log(foo);
                        });
                };
            }
        ]
    );