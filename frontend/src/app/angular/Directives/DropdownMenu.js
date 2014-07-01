/**
 * Angular directive to enable 'bootstrap-hover-dropdown' plugin.
 *
 * @see https://github.com/CWSpear/bootstrap-hover-dropdown/issues/53
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('dropdownMenu',
            function() {
                return {
                    restrict: 'A',
                    link: function(scope, element) {
                        element.dropdownHover();
                        element.dropdown();
                    }
                };
            }
        );
}());
