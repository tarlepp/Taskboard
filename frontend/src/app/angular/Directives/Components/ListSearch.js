/**
 * Directive to create search component for lists. This is used generally
 * in all lists on application. Basically this directive just manipulates
 * given filters.
 *
 * Passed filters must be in following format:
 *
 *  $scope.filters = {
 *      searchWord: '',
 *      columns: $scope.items
 *  };
 *
 * Where '$scope.items' is array of objects:
 *
 *  $scope.items = [
 *      {
 *          title: 'Object',
 *          column: 'objectName',
 *          searchable: true,
 *          sortable: true,
 *          inSearch: true,
 *          inTitle: true
 *      },
 *  ];
 *
 * Usage example:
 *
 *  <list-search data-filters="filters"></list-search>
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
