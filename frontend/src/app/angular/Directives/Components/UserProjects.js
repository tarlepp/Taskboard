(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('userProjects',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        userId: '='
                    },
                    replace: true,
                    templateUrl: '/Taskboard/partials/Directives/Components/UserProjects.html',
                    controller: [
                        '$scope', '$timeout',
                        '_',
                        'CurrentUser', 'UserRoles', 'Project', 'SocketWhereCondition',
                        function($scope, $timeout,
                                 _,
                                 CurrentUser, UserRoles, Project, SocketWhereCondition
                        ) {
                            // Todo: use $scope.userId to fetch user data

                            $scope.user = CurrentUser.user();
                            $scope.itemCount = 0;
                            $scope.items = [];
                            $scope.itemsPerPage = 10;
                            $scope.currentPage = 1;
                            $scope.where = {};
                            $scope.loading = true;
                            $scope.loaded = false;

                            // Initialize used title items
                            $scope.titleItems = [
                                {
                                    title: 'Project ID',
                                    column: 'id',
                                    searchable: true,
                                    sortable: false,
                                    inSearch: true,
                                    inTitle: false
                                },
                                {
                                    title: 'Project',
                                    titleSearch: 'Project name',
                                    column: 'title',
                                    searchable: true,
                                    sortable: true,
                                    inSearch: true,
                                    inTitle: true
                                },
                                {
                                    title: 'Project description',
                                    column: 'description',
                                    searchable: true,
                                    sortable: false,
                                    inSearch: true,
                                    inTitle: false
                                },
                                {
                                    title: 'Role',
                                    column: 'role',
                                    searchable: false,
                                    sortable: false,
                                    inSearch: false,
                                    inTitle: true
                                },
                                {
                                    title: 'Members',
                                    column: 'members.length',
                                    searchable: false,
                                    sortable: false,
                                    inSearch: false,
                                    inTitle: true
                                },
                                {
                                    title: 'Sprints',
                                    column: 'sprints.length',
                                    searchable: false,
                                    sortable: false,
                                    inSearch: false,
                                    inTitle: true
                                },
                                {
                                    title: 'Schedule',
                                    column: 'dateStart',
                                    searchable: false,
                                    sortable: true,
                                    inSearch: false,
                                    inTitle: true
                                },
                                {
                                    title: 'Schedule start',
                                    column: 'dateStart',
                                    searchable: true,
                                    sortable: false,
                                    inSearch: true,
                                    inTitle: false
                                },
                                {
                                    title: 'Schedule end',
                                    column: 'dateEnd',
                                    searchable: true,
                                    sortable: false,
                                    inSearch: true,
                                    inTitle: false
                                }
                            ];

                            // Initialize filter object
                            $scope.filters = {
                                searchWord: '',
                                columns: $scope.titleItems
                            };

                            // Initialize default sort data
                            $scope.sort = {
                                column: 'title',
                                direction: true
                            };

                            /**
                             * Helper function to return user role text on project.
                             *
                             * @todo Localization?
                             */
                            $scope.getUserRole = function(projectUsers) {
                                var output = '';
                                var user = _.find(projectUsers, function(projectUser) {
                                    return projectUser.user === $scope.user.id;
                                });

                                if (!user) {
                                    output = 'Unknown';
                                } else {
                                    switch (user.role) {
                                        case UserRoles.viewer:
                                            output = 'Viewer';
                                            break;
                                        case UserRoles.user:
                                            output = 'User';
                                            break;
                                        case UserRoles.manager:
                                            output = 'Manager';
                                            break;
                                        default:
                                            break;
                                    }
                                }

                                return output;
                            };

                            // Helper function to check if item is to shown in table thead or not
                            $scope.titleFilter = function(item) {
                                return item.inTitle;
                            };

                            // Function to change sort column / direction on list
                            $scope.changeSort = function(item) {
                                var sort = $scope.sort;

                                if (sort.column == item.column) {
                                    sort.direction = !sort.direction;
                                } else {
                                    sort.column = item.column;
                                    sort.direction = true;
                                }

                                if ($scope.currentPage == 1) {
                                    $scope.fetchData();
                                } else {
                                    $scope.currentPage = 1;
                                }
                            };

                            /**
                             * Function to fetch project data from server
                             *
                             * @todo: async.js?
                             */
                            $scope.fetchData = function() {
                                $scope.loading = true;

                                // Common parameters for count and data query
                                var commonParameters = {
                                    where: SocketWhereCondition.get($scope.filters)
                                };

                                // Data query specified parameters
                                var getParameters = {
                                    limit: $scope.itemsPerPage,
                                    skip: ($scope.currentPage - 1) * $scope.itemsPerPage,
                                    sort: $scope.sort.column + ' ' + ($scope.sort.direction ? 'ASC' : 'DESC')
                                };

                                // Fetch data count
                                Project
                                    .count(commonParameters)
                                    .success(function(response) {
                                        $scope.itemCount = response.count;
                                    });

                                // Fetch data items
                                Project
                                    .load(_.merge(commonParameters, getParameters))
                                    .success(function(response) {
                                        $scope.items = response;

                                        $scope.loaded = true;
                                        $scope.loading = false;
                                    })
                                    .error(function(response) {
                                        $scope.loaded = true;
                                        $scope.loading = false;
                                    });
                            };

                            var searchWordTimer;

                            /**
                             * Watcher for filters.searchWord model. This will trigger new data fetch
                             * query to server if following conditions have been met:
                             *
                             *  1) Given search word is different than old one
                             *  2) Search word have not been changed in 350ms
                             *
                             * If those are ok, then watcher will call scope 'fetchData' function.
                             */
                            $scope.$watch('filters.searchWord', function(valueNew, valueOld) {
                                if (valueNew != valueOld) {
                                    if (searchWordTimer) {
                                        $timeout.cancel(searchWordTimer);
                                    }

                                    searchWordTimer = $timeout(function() {
                                        $scope.fetchData();
                                    }, 350);
                                }
                            });

                            /**
                             * Watcher for filters.columns model. This will trigger data fetch query
                             * to server if following conditions have been met:
                             *
                             *  1) Given column model (array of columns) is different than old one.
                             *  2) This model has not been changed in 500ms
                             *
                             * If those are ok, then watcher will call scope 'fetchData' function.
                             */
                            $scope.$watch('filters.columns', function(valueNew, valueOld) {
                                if (valueNew != valueOld && $scope.filters.searchWord) {
                                    if (searchWordTimer) {
                                        $timeout.cancel(searchWordTimer);
                                    }

                                    searchWordTimer = $timeout(function() {
                                        $scope.fetchData();
                                    }, 500);
                                }
                            }, true);

                            /**
                             * Watcher for currentPage model, this will trigger always new data query
                             * to server whenever this model has been changed.
                             *
                             * Note that this watcher will trigger init data query.
                             */
                            $scope.$watch('currentPage', function() {
                                $scope.fetchData();
                            });
                        }
                    ]
                };
            }
        );
}());
