/**
 * Taskboard directive to show specified user login history. Note that this
 * uses three (3) different actions in backend side to fetch needed data.
 *
 * Usage example:
 *
 *  <login-history data-user-id="12"></login-history>
 *
 * This will render a five data tables which contains following user login
 * data:
 *
 *  1) Full login list
 *  2) Unique IP-addresses
 *  3) Unique user-agents
 *  4) Unique browser families
 *  5) Unique operation system families
 *
 * Users can sort and search these items as they like.
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('loginHistory',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        userId: '@'
                    },
                    replace: false,
                    templateUrl: '/Taskboard/partials/Directives/Components/LoginHistory.html',
                    controller: [
                        '$scope', '$timeout', '$q',
                        '_',
                        'SocketWhereCondition', 'CurrentUser', 'ListTitleItem', 'ListConfig',
                        'UserLoginModel',
                        function($scope, $timeout, $q,
                                 _,
                                 SocketWhereCondition, CurrentUser, ListTitleItem, ListConfig,
                                 UserLoginModel
                        ) {
                            // Directive initialize method
                            $scope.init = function() {
                                $scope.loading = true;
                                $scope.loaded = true;

                                /**
                                 * First we must fetch all login data from server, note that we have
                                 * five (5) different login data collection:
                                 *
                                 *  Full login list
                                 *  Unique IP-addresses
                                 *  Unique user-agents
                                 *  Browser families
                                 *  OS families
                                 */
                                $q
                                    .all([
                                        $scope.load(),
                                        $scope.loadIp(),
                                        $scope.loadAgent(),
                                        $scope.loadBrowserFamily(),
                                        $scope.loadOsFamily()
                                    ])
                                    .then(function(result) {
                                        $scope.loading = false;
                                        $scope.loaded = true;

                                        _.each(result, function(data, key) {
                                            _.merge($scope.items[key], data);
                                        });
                                    })
                                    .catch(function(error) {
                                        console.log(error);
                                    })
                                    .finally(function() {
                                        $scope.loading = false;
                                        $scope.loaded = true;
                                    });
                            };

                            // Get current user data
                            $scope.user = CurrentUser.user();

                            // Add default list configuration, see the service for more detailed information
                            $scope = _.merge($scope, ListConfig.getDefault());

                            // Specify list initial data
                            $scope.items = ListTitleItem.getUserLoginHistory();

                            // Function to change sort column / direction on list
                            $scope.changeSort = function(column, item) {
                                var sort = item.sort;

                                if (sort.column === column.column) {
                                    sort.direction = !sort.direction;
                                } else {
                                    sort.column = column.column;
                                    sort.direction = true;
                                }

                                if (item.currentPage === 1) {
                                    fetchData(item);
                                } else {
                                    item.currentPage = 1;
                                }
                            };

                            /**
                             * Scope method to fetch full user login data from server.
                             *
                             * @returns {Deferred.promise|*}
                             */
                            $scope.load = function() {
                                return loadData($scope.items[0]);
                            };

                            /**
                             * Scope method to fetch IP specified login data from server.
                             *
                             * @returns {Deferred.promise|*}
                             */
                            $scope.loadIp = function() {
                                return loadData($scope.items[1]);
                            };

                            /**
                             * Scope method to fetch user-agent specified login data from server.
                             *
                             * @returns {Deferred.promise|*}
                             */
                            $scope.loadAgent = function() {
                                return loadData($scope.items[2]);
                            };

                            /**
                             * Scope method to fetch browser family specified login data from server.
                             *
                             * @returns {Deferred.promise|*}
                             */
                            $scope.loadBrowserFamily = function() {
                                return loadData($scope.items[3]);
                            };

                            /**
                             * Scope method to fetch OS family specified login data from server.
                             *
                             * @returns {Deferred.promise|*}
                             */
                            $scope.loadOsFamily = function() {
                                return loadData($scope.items[4]);
                            };

                            /**
                             * Iterate each item and assign needed watchers for those. At
                             * this point we add following watchers to each item set:
                             *
                             *  searchWord
                             *  currentPage
                             *
                             * If these are changed we must fetch specified section login
                             * data again from server.
                             */
                            _.each($scope.items, function(item, key) {
                                var searchWordTimer;

                                // Watcher for search word
                                $scope.$watch('items.' + key + '.searchWord', function(valueNew, valueOld) {
                                    if (valueNew !== valueOld) {
                                        if (searchWordTimer) {
                                            $timeout.cancel(searchWordTimer);
                                        }

                                        searchWordTimer = $timeout(function() { fetchData(item); }, 400);
                                    }
                                }, true);


                                $scope.$watch('items.' + key + '.currentPage', function(valueNew, valueOld) {
                                    if (valueNew !== valueOld) {
                                        fetchData(item);
                                    }
                                }, true);
                            });

                            /**
                             * Helper function to fetch specified item data and populate its
                             * data again with new values. Basically this will first call one
                             * of following scope methods:
                             *
                             *  $scope.load()
                             *  $scope.loadIp()
                             *  $scope.loadAgent()
                             *  $scope.loadBrowserFamily(),
                             *  $scope.loadOsFamily()
                             *
                             * And those will call loadData function with specified item.
                             *
                             * @param   {services.ListConfig.getDefault}    item    Item object
                             */
                            function fetchData(item) {
                                item.loading = true;

                                // Call specified scope method
                                $scope[item.methodLoad]()
                                    .then(function(data) {
                                        item.loading = false;
                                        item.loaded = true;

                                        item.items = data.items;
                                        item.itemCount = data.itemCount;
                                    });
                            }

                            /**
                             * Helper function to fetch actual login data from server. This function
                             * will handle all three (3) cases of login data fetching. Also note that
                             * function handles following data related actions:
                             *
                             *  Data sorting
                             *  Pagination
                             *  Search word
                             *
                             * @param   {{}}    item
                             *
                             * @returns {Deferred.promise|*}
                             */
                            function loadData(item) {
                                var deferred = $q.defer();
                                var searchCriteria = SocketWhereCondition.get(item);

                                // Common parameters for count and data query
                                var commonParameters = {
                                    where: _.merge(searchCriteria, {userId: $scope.userId})
                                };

                                // Data query specified parameters
                                var getParameters = {
                                    limit: $scope.itemsPerPage,
                                    skip: (item.currentPage - 1) * $scope.itemsPerPage,
                                    sort: item.sort.column + ' ' + (item.sort.direction ? 'DESC' : 'ASC')
                                };

                                $q
                                    .all({
                                        count: UserLoginModel[item.methodCount](commonParameters),
                                        items: UserLoginModel[item.methodLoad](_.merge(commonParameters, getParameters))
                                    })
                                    .then(function(response) {
                                        deferred.resolve({items: response.items.data, itemCount: response.count.data.count});
                                    }, function(error) {
                                        deferred.reject(error);
                                    });

                                return deferred.promise;
                            }
                        }
                    ]
                };
            }
        );
}());
