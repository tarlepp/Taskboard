"use strict";

angular.module("TaskBoardDirectives")
    .directive("tbTemplate", function() {
        return {
            restrict: "E",
            transclude: false,
            scope: true,
            replace: true,
            link: function(scope, element, attrs) {
                scope.getTemplateUrl = function() {
                    return "/templates/" + attrs.template + ".html";
                };
            },
            template: "<div data-ng-include=\"getTemplateUrl()\"></div>"
        };
    });