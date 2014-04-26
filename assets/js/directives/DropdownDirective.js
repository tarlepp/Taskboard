/**
 * Angular directive to enable 'bootstrap-hover-dropdown' plugin.
 *
 * @see https://github.com/CWSpear/bootstrap-hover-dropdown/issues/53
 */
"use strict";

angular.module("TaskBoardDirectives")
    .directive("dropdownMenu",
        function() {
            return {
                restrict: "A",
                link: function(scope, element) {
                    element.dropdownHover();
                    element.dropdown();
                }
            };
        }
    );
