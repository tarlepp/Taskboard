/**
 * User activity log directive that will show all user activity logs on grid view.
 *
 * Usage example:
 *
 *  <user-activity-log data-user-id="123"></user-activity-log>
 *
 * Note that 'data-user-id' attribute specifies which user data is shown on lists.
 */
'use strict';

angular.module('TaskBoardDirectives')
    .directive('userActivityLog',
        function() {
            return {
                restrict: 'E',
                scope: {
                    userId: '@'
                },
                replace: true,
                templateUrl: '/templates/directives/components/userActivityLog.html',
                controller: [
                    '$scope', '$timeout', '$sailsSocket', 'User',
                    function($scope, $timeout, $sailsSocket, User) {
                        // Init default scope parameters
                        $scope.user = User.current;
                        $scope.itemCount = 0;
                        $scope.items = [];
                        $scope.itemsPerPage = 15;
                        $scope.currentPage = 1;
                        $scope.where = {};
                        $scope.loading = true;
                        $scope.loaded = false;

                        // Initialize used title items
                        $scope.titleItems = [
                            {title: 'Object ID', column: 'objectId', sortable: false, inSearch: true, inTitle: false},
                            {title: 'Object', column: 'objectName', sortable: true, inSearch: true, inTitle: true},
                            {title: 'Message', column: 'message', sortable: true, inSearch: true, inTitle: true},
                            {title: 'Data', column: 'objectData', sortable: false, inSearch: true, inTitle: true},
                            {title: 'Stamp', column: 'createdAt', sortable: true, inSearch: true, inTitle: true}
                        ];

                        // Initialize filter object
                        $scope.filters = {
                            searchWord: "",
                            columns: $scope.titleItems
                        };

                        // Initialize default sort data
                        $scope.sort = {
                            column: 'createdAt',
                            direction: false
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
                         * Scope function to fetch actual data and count of that data from server.
                         * This will make two (2) socket requests to server to determine count and
                         * actual data.
                         *
                         * @todo add async or q handling for those requests.
                         */
                        $scope.fetchData = function() {
                            $scope.loading = true;

                            // Common parameters for count and data query
                            var commonParameters = {
                                where: getSearchParameters()
                            };

                            // Data query specified parameters
                            var getParameters = {
                                limit: $scope.itemsPerPage,
                                skip: ($scope.currentPage - 1) * $scope.itemsPerPage,
                                sort: $scope.sort.column + ' ' + ($scope.sort.direction ? 'ASC' : 'DESC')
                            };

                            // Fetch data count
                            $sailsSocket
                                .get("/History/count/", {
                                    params: commonParameters
                                })
                                .success(function(response) {
                                    $scope.itemCount = response.count;
                                });

                            // Fetch data items
                            $sailsSocket
                                .get("/History/", {
                                    params: _.merge(commonParameters, getParameters)
                                })
                                .success(function(response) {
                                    $scope.items = response;

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
                            if (valueNew != valueOld) {
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

                        /**
                         * Private helper function to make where condition object for user activity
                         * list. This is called whenever activity data is fetched from server.
                         *
                         * @returns {{}}
                         */
                        function getSearchParameters() {
                            var output = {
                                user: $scope.userId
                            };

                            // Get search columns
                            var columns = _.filter($scope.filters.columns, function(column) {
                                return column.inSearch;
                            });

                            // Yeah we have some columns and search word so add OR condition to output
                            if (columns.length > 0 && $scope.filters.searchWord !== '') {
                                output.or = _.map(columns, function(column) {
                                    var temp = {};

                                    temp[column.column] = {
                                        contains: $scope.filters.searchWord
                                    };

                                    return temp;
                                });
                            }

                            return output;
                        }
                    }
                ]
            };
        }
    );