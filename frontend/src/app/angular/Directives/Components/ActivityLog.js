/**
 * User activity log directive which will show all specified user activity on
 * Taskboard. This activity is based upon objects history data which is stored
 * whenever record is created, updated or deleted.
 *
 * Usage example:
 *
 *  <activity-log data-user-id="{{user.id}}"></activity-log>
 *
 * This will render a list of specified user activity. Within this GUI user can
 * filter activity log, change sort column / direction. Also GUI offers pagination
 * for actual activity records.
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('activityLog',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        userId: '@'
                    },
                    replace: true,
                    templateUrl: '/Taskboard/partials/Directives/Components/ActivityLog.html',
                    controller: [
                        '$scope', '$timeout', '$q',
                        '_', 'SocketWhereCondition',
                        'CurrentUser', 'ListConfig', 'ListTitleItem', 'ActivityLog',
                        function($scope, $timeout, $q,
                                 _, SocketWhereCondition,
                                 CurrentUser, ListConfig, ListTitleItem, ActivityLog
                        ) {
                            // Add default list configuration, see the service for more detailed information
                            $scope = _.merge($scope, ListConfig.getDefault());

                            // Fetch used title items from service
                            $scope.titleItems = ListTitleItem.getUserActivityLog();

                            // Store current user to scope
                            $scope.user = CurrentUser.user();

                            // Initialize filter object
                            $scope.filters = {
                                searchWord: '',
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

                            /**
                             * Function to fetch project data from server. Note that this will
                             * fetch total count of records and actual rows for current page.
                             *
                             * Also note that data that is fetched is limited to specified user
                             * only. Also data can be filtered by given search words that are
                             * used to filter user selection of columns.
                             */
                            $scope.fetchData = function() {
                                $scope.loading = true;

                                // Common parameters for count and data query
                                var commonParameters = {
                                    where: _.merge(SocketWhereCondition.get($scope.filters), {user: $scope.userId})
                                };

                                // Data query specified parameters
                                var getParameters = {
                                    limit: $scope.itemsPerPage,
                                    skip: ($scope.currentPage - 1) * $scope.itemsPerPage,
                                    sort: $scope.sort.column + ' ' + ($scope.sort.direction ? 'ASC' : 'DESC')
                                };

                                $q
                                    .all({
                                        count: ActivityLog.count(commonParameters),
                                        items: ActivityLog.load(_.merge(commonParameters, getParameters))
                                    })
                                    .then(function(response) {
                                        $scope.itemCount = response.count.data.count;
                                        $scope.items = response.items.data;

                                        $scope.loaded = true;
                                        $scope.loading = false;
                                    }, function(error) {
                                        console.log(error);

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
                                    $timeout.cancel(searchWordTimer);

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
                            $scope.$watch('currentPage', function() {
                                $scope.fetchData();
                            });
                        }
                    ]
                };
            }
        );
}());
