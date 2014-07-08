/**
 * @todo add description...
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('listSearch',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        filters: '='
                    },
                    replace: true,
                    templateUrl: '/Taskboard/partials/Directives/Components/ListSearch.html',
                    controller: [
                        '$scope',
                        function($scope) {
                            $scope.id = Math.floor((Math.random() * 6) + 1);

                            $scope.inSearch = function(item) {
                                if (!angular.isUndefined(item.searchable)) {
                                    return item.searchable;
                                } else {
                                    return false;
                                }
                            };
                        }
                    ]
                };
            }
        );
}());
