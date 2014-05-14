/**
 * User sign-in history list directive that renders a table with user sign-in data. Actual
 * data is shown in three (3) different tables:
 *
 *  - Unique sign in IP-addresses
 *  - Unique sign in user-agents
 *  - Full sign in list
 *
 * Each list shows 15 rows per row and has own pagination for data iteration. Also each
 * list has order functions for each columns user can also narrow down each list results
 * by give desired search word.
 *
 * Usage example:
 *
 *  <sign-in-history-list data-user-id="123"></sign-in-history-list>
 *
 * Note that 'data-user-id' attribute specifies which user data is shown on lists.
 */
'use strict';

angular.module('TaskBoardDirectives')
    .directive('signInHistoryList',
        function() {
            return {
                restrict: 'E',
                scope: {
                    userId: '@'
                },
                replace: true,
                templateUrl: '/templates/directives/signInHistoryList.html',
                controller: [
                    '$scope', '$sailsSocket', 'User',
                    function($scope, $sailsSocket, User) {
                        $scope.user = User.current;
                        $scope.itemsPerPage = 15;

                        // Specify list initial data
                        $scope.items = [
                            {
                                title: 'Unique sign in IP-addresses',
                                columns: [
                                    {title: 'Sign in time', column: 'stamp'},
                                    {title: 'IP-address', column: 'ip'},
                                    {title: 'User-agent', column: 'agent'},
                                    {title: 'Count', column: 'count'}
                                ],
                                sort: {
                                    column: 'count',
                                    direction: true
                                },
                                type: 'ip',
                                rows: [],
                                page: 1
                            },
                            {
                                title: 'Unique sign in user-agents',
                                columns: [
                                    {title: 'Sign in time', column: 'stamp'},
                                    {title: 'IP-address', column: 'ip'},
                                    {title: 'User-agent', column: 'agent'},
                                    {title: 'Count', column: 'count'}
                                ],
                                sort: {
                                    column: 'count',
                                    direction: true
                                },
                                type: 'agent',
                                rows: [],
                                page: 1
                            },
                            {
                                title: 'Full sign in list',
                                columns: [
                                    {title: 'Sign in time', column: 'stamp'},
                                    {title: 'IP-address', column: 'ip'},
                                    {title: 'User-agent', column: 'agent'}
                                ],
                                sort: {
                                    column: 'stamp',
                                    direction: true
                                },
                                type: 'full',
                                rows: [],
                                page: 1
                            }
                        ];

                        // Function to change list order
                        $scope.changeSort = function(item, object) {
                            var sort = object.sort;

                            object.page = 1;

                            if (sort.column == item.column) {
                                sort.direction = !sort.direction;
                            } else {
                                sort.column = item.column;
                                sort.direction = false;
                            }
                        };

                        // Function to fetch specified user sign in data from server
                        $scope.fetchSignInData = function() {
                            $scope.loading = true;
                            $scope.signInData = [];

                            $sailsSocket
                                .get("/UserLogin?user=" + $scope.userId + "&limit=100000000")
                                .success(function(response) {
                                    $scope.loading = false;

                                    $scope.items[0].rows = formatIpData(response);
                                    $scope.items[1].rows = formatAgentData(response);
                                    $scope.items[2].rows = response;
                                })
                                .error(function(response) {
                                    console.log("error");
                                    console.log(response);
                                });
                        };

                        /**
                         * Private helper function to format user sign in IP data.
                         *
                         * @param   {Array} rows
                         *
                         * @returns {Array}
                         */
                        function formatIpData(rows) {
                            var output = [];

                            _.each(_.groupBy(rows, 'ip'), function(data, ip) {
                                data = _.sortBy(data, 'stamp').reverse();

                                output.push({
                                    ip: ip,
                                    count: data.length,
                                    stamp: data[0].stamp,
                                    agent: data[0].agent
                                });
                            });

                            return output;
                        }

                        /**
                         * Private helper function to format user sign in user-agent data.
                         *
                         * @param   {Array} rows
                         *
                         * @returns {Array}
                         */
                        function formatAgentData(rows) {
                            var output = [];

                            _.each(_.groupBy(rows, 'agent'), function(data, agent) {
                                data = _.sortBy(data, 'stamp').reverse();

                                output.push({
                                    agent: agent,
                                    count: data.length,
                                    stamp: data[0].stamp,
                                    ip: data[0].ip
                                });
                            });

                            return output;
                        }

                        $scope.fetchSignInData();
                    }
                ]
            };
        }
    );