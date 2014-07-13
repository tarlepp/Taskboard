/**
 * Taskboard directive to show specified user login history. Note that this
 * uses three (3) different actions in backend side to fetch needed data.
 *
 * Usage example:
 *
 *  <login-history data-user-id="12"></login-history>
 *
 * This will render a three data tables which contains following user login
 * data:
 *
 *  1) Unique IP-addresses
 *  2) Unique user-agents
 *  3) Full login list
 *
 * Users can sort and search there items as they like.
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
                    replace: true,
                    templateUrl: '/Taskboard/partials/Directives/Components/LoginHistory.html',
                    controller: [
                        '$scope', '$sailsSocket', '$timeout', '$q',
                        '_', 'SocketWhereCondition',
                        'CurrentUser', 'UserLogin',
                        function($scope, $sailsSocket, $timeout, $q,
                                 _, SocketWhereCondition,
                                 CurrentUser, UserLogin
                        ) {
                            $scope.user = CurrentUser.user();
                            $scope.itemsPerPage = 10;
                            $scope.loading = true;
                            $scope.loaded = false;

                            // Specify list initial data
                            $scope.items = [
                                {
                                    title: 'Unique login IP-addresses',
                                    columns: [
                                        {title: 'IP-address', column: 'ip'},
                                        {title: 'Count', column: 'count', class: 'text-right'}
                                    ],
                                    sort: {
                                        column: 'count',
                                        direction: true
                                    },
                                    methodLoad: 'loadIp',
                                    methodCount: 'countIp',
                                    searchWord: '',
                                    items: [],
                                    itemCount: 0,
                                    currentPage: 1
                                },
                                {
                                    title: 'Unique login user-agents',
                                    columns: [
                                        {title: 'User-agent', column: 'agent'},
                                        {title: 'Count', column: 'count', class: 'text-right'}
                                    ],
                                    sort: {
                                        column: 'count',
                                        direction: true
                                    },
                                    methodLoad: 'loadAgent',
                                    methodCount: 'countAgent',
                                    searchWord: '',
                                    items: [],
                                    itemCount: 0,
                                    currentPage: 1
                                },
                                {
                                    title: 'Full login list',
                                    columns: [
                                        {title: 'Login time', column: 'createdAt'},
                                        {title: 'IP-address', column: 'ip'},
                                        {title: 'User-agent', column: 'agent'}
                                    ],
                                    sort: {
                                        column: 'createdAt',
                                        direction: true
                                    },
                                    methodLoad: 'load',
                                    methodCount: 'count',
                                    searchWord: '',
                                    items: [],
                                    itemCount: 0,
                                    currentPage: 1
                                }
                            ];

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
                             * Scope method to fetch IP specified login data from server.
                             *
                             * @returns {Deferred.promise|*}
                             */
                            $scope.loadIp = function() {
                                return loadData($scope.items[0]);
                            };

                            /**
                             * Scope method to fetch user-agent specified login data from server.
                             *
                             * @returns {Deferred.promise|*}
                             */
                            $scope.loadAgent = function() {
                                return loadData($scope.items[1]);
                            };

                            /**
                             * Scope method to fetch full user login data from server.
                             *
                             * @returns {Deferred.promise|*}
                             */
                            $scope.load = function() {
                                return loadData($scope.items[2]);
                            };

                            /**
                             * First we must fetch all login data from server, note that we have
                             * three (3) different login data collection:
                             *
                             *  Unique IP-addresses
                             *  Unique user-agents
                             *  Full login list
                             */
                            $q
                                .all([
                                    $scope.loadIp(),
                                    $scope.loadAgent(),
                                    $scope.load()
                                ])
                                .then(function(result) {
                                    $scope.loading = false;
                                    $scope.loaded = true;

                                    _.each(result, function(data, key) {
                                        _.merge($scope.items[key], data);
                                    });
                                });

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

                                        searchWordTimer = $timeout(function() { fetchData(item); }, 350);
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
                             *  $scope.loadIp()
                             *  $scope.loadAgent()
                             *  $scope.load()
                             *
                             * And those will call loadData function with specified item.
                             *
                             * @param   {{}}    item    Item object
                             */
                            function fetchData(item) {
                                item.loading = true;
                                item.loaded = false;

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
                                var searchCriteria = {};

                                if (item.searchWord !== '') {
                                    searchCriteria.or = _.map(item.columns, function(column) {
                                        var temp = {};

                                        temp[column.column] = {
                                            contains: item.searchWord
                                        };

                                        return temp;
                                    });
                                }
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

                                // Fetch data count
                                UserLogin[item.methodCount](commonParameters)
                                    .success(function(response) {
                                        var itemCount = response.count;

                                        // Fetch data items
                                        UserLogin[item.methodLoad](_.merge(commonParameters, getParameters))
                                            .success(function(response) {
                                                deferred.resolve({items: response, itemCount: itemCount});
                                            })
                                            .error(function(response) {
                                                deferred.reject(response);
                                            });
                                    })
                                    .error(function(response) {
                                        deferred.reject(response);
                                    });

                                return deferred.promise;
                            }
                        }
                    ]
                };
            }
        );
}());
