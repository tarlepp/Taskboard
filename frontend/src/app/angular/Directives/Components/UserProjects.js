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
                    replace: false,
                    templateUrl: '/Taskboard/partials/Directives/Components/UserProjects.html',
                    controller: [
                        '$scope', '$timeout', '$q',
                        '_', 'SocketWhereCondition',
                        'ModalService',
                        'CurrentUser', 'UserRoles', 'ListConfig', 'ListTitleItem',
                        'UserModel', 'ProjectModel',
                        function($scope, $timeout, $q,
                                 _, SocketWhereCondition,
                                 ModalService,
                                 CurrentUser, UserRoles, ListConfig, ListTitleItem,
                                 UserModel, ProjectModel
                        ) {
                            // Directive initialize method
                            $scope.init = function() {
                                // Fetch specified user data
                                UserModel
                                    .fetch($scope.userId)
                                    .then(function(response) {
                                        $scope.user = response;
                                    });

                                $scope.fetchData();
                            };

                            // Store modal service
                            $scope.modalService = ModalService;

                            // Store current user to scope
                            $scope.currentUser = CurrentUser.user();

                            // Add default list configuration, see the service for more detailed information
                            $scope = _.merge($scope, ListConfig.getDefault());

                            // Initialize used title items
                            $scope.titleItems = ListTitleItem.getUserProject();

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
                             * @todo Move this to service?
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

                                if (sort.column === item.column) {
                                    sort.direction = !sort.direction;
                                } else {
                                    sort.column = item.column;
                                    sort.direction = true;
                                }

                                if ($scope.currentPage === 1) {
                                    $scope.fetchData();
                                } else {
                                    $scope.currentPage = 1;
                                }
                            };

                            // Function to fetch project data from server
                            $scope.fetchData = function() {
                                $scope.loading = true;

                                // Common parameters for count and data query
                                var commonParameters = {
                                    where: SocketWhereCondition.get($scope.filters)
                                };

                                // Data query specified parameters
                                var getParameters = {
                                    populate: ['sprints', 'projectUsers'],
                                    limit: $scope.itemsPerPage,
                                    skip: ($scope.currentPage - 1) * $scope.itemsPerPage,
                                    sort: $scope.sort.column + ' ' + ($scope.sort.direction ? 'ASC' : 'DESC')
                                };

                                var count = ProjectModel.count(commonParameters)
                                    .then(function(response) {
                                        $scope.itemCount = response.count;
                                    });

                                var load = ProjectModel.load(_.merge(commonParameters, getParameters))
                                    .then(function(response) {
                                        $scope.items = response;
                                    });

                                $q
                                    .all([count, load])
                                    .catch(function(error) {
                                        console.log(error);
                                    })
                                    .finally(function() {
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
                                if (valueNew !== valueOld) {
                                    if (searchWordTimer) {
                                        $timeout.cancel(searchWordTimer);
                                    }

                                    searchWordTimer = $timeout(function() {
                                        $scope.fetchData();
                                    }, 400);
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
                                if (valueNew !== valueOld && $scope.filters.searchWord) {
                                    if (searchWordTimer) {
                                        $timeout.cancel(searchWordTimer);
                                    }

                                    searchWordTimer = $timeout(function() {
                                        $scope.fetchData();
                                    }, 400);
                                }
                            }, true);

                            /**
                             * Watcher for currentPage model, this will trigger always new data query
                             * to server whenever this model has been changed.
                             *
                             * Note that this watcher will trigger init data query.
                             */
                            $scope.$watch('currentPage', function(valueNew, valueOld) {
                                if (valueNew !== valueOld) {
                                    $scope.fetchData();
                                }
                            });
                        }
                    ]
                };
            }
        );
}());
