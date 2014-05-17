/**
 * Simple angular filter to convert new lines (\n) on text to <br /> elements. Usage example:
 *
 *  <div data-ng-bind="someText | newLines"></div>
 */
'use strict';

angular.module('TaskBoardFilters')
    .filter('newLines', function() {
        return function(text) {
            return text.replace(/\n/g, '<br />');
        };
    });