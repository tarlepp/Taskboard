/**
 * Simple directive to make project list view. In this list user can see main data
 * of each project and make administrator functions to each of those. Usage example:
 *
 *  <project-list></project-list>
 *
 * Note that directive handles project data fetch and all things that are related
 * to project data.
 *
 * @todo implement action menu handling
 * @todo implement role data
 * @todo implement members data
 */
'use strict';

angular.module('TaskBoardDirectives')
    .directive('projectList',
        function() {
            return {
                restrict: 'E',
                scope: {},
                replace: true,
                templateUrl: '/templates/directives/projectList.html',
                controller: [
                    '$scope', '$sailsSocket', 'User',
                    function($scope, $sailsSocket, User) {
                        $scope.currentUser = User.current;
                        $scope.projects = [];

                        // Specify default sort data
                        $scope.sort = {
                            column: 'title',
                            direction: false
                        };

                        // List header data
                        $scope.titleItems = [
                            {title: 'Project', column: 'title'},
                            {title: 'Manager', column: 'manager.lastName'},
                            {title: 'Role', column: 'role'},
                            {title: 'Members', column: 'members.length'},
                            {title: 'Sprints', column: 'sprints.length'},
                            {title: 'Schedule', column: 'dateStart'}
                        ];

                        // Function to change sort column / direction on list
                        $scope.changeSort = function(item) {
                            var sort = $scope.sort;

                            if (sort.column == item.column) {
                                sort.direction = !sort.direction;
                            } else {
                                sort.column = item.column;
                                sort.direction = false;
                            }
                        };

                        // Function to fetch project data from server
                        $scope.fetchProjectData = function() {
                            $scope.loading = true;
                            $scope.projects = [];

                            $sailsSocket
                                .get("/Project")
                                .success(function(response) {
                                    $scope.projects = response;

                                    $scope.loading = false;
                                })
                                .error(function(response) {
                                    console.log("error");
                                    console.log(response);
                                });
                        };

                        $scope.fetchProjectData();
                    }
                ]
            };
        }
    );