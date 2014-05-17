/**
 * Simple directive to add search input to list view gird. Currently this directive is just
 * a "dummy" one but it will evolve to something greater. Usage example:
 *
 *  <list-search data-filters="filters"></list-search>
 *
 * Directive needs 'filters' object that contains all necessary data for actual search filter
 * GUI. That object has to have following structure:
 *
 *  $scope.filters = {
 *      searchWord: "",
 *      columns: [
 *          {title: "foo", column: 'objectId', inSearch: true},
 *          {title: "bar", column: 'objectId', inSearch: true},
 *          {title: "foobar", column: 'objectId', inSearch: false},
 *          {title: "barfoo", column: 'objectId', inSearch: true}
 *      ]
 *  }
 *
 * Directive will create necessary GUI components according to that object, where user can
 * enable / disable certain columns to search.
 */
'use strict';

angular.module('TaskBoardDirectives')
    .directive('listSearch',
        function() {
            return {
                restrict: 'E',
                scope: {
                    filters: '='
                },
                replace: true,
                templateUrl: '/templates/directives/components/listSearch.html'
            };
        }
    );
