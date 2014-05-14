/**
 * Simple angular array / string slice filter. Usage example:
 *
 *  <div data-ng-repeat="item in items | slice:0:10"></div>
 */
'use strict';

angular.module('TaskBoardFilters')
    .filter('slice', function() {
        return function(input, start, end) {
            return input.slice(start, end);
        };
    });