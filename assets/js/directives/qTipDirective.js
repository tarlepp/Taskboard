"use strict";

angular.module("TaskBoardDirectives")
    .directive("qtip", function() {
        return {
            restrict: "A",
            scope: {
                qtipId: "@",
                qtipContent: "@"
            },
            transclude: true,
            replace: true,
            templateUrl: "/templates/directives/qtip.html",
            link: function(scope, element, attrs) {
                scope.parentId = "#qtip-trigger-" + attrs.qtipId;
                scope.closeButton = (attrs.closeButton);

                switch (attrs.position) {
                    case "top":
                        scope.qtipPointerPos = "bottom center";
                        scope.qtipContentPos = "top center";
                        break;
                    case "bottom":
                        scope.qtipPointerPos = "top center";
                        scope.qtipContentPos = "bottom center";
                        break;
                    case "bottomright":
                        scope.qtipPointerPos = "top left";
                        scope.qtipContentPos = "bottom right";
                        break;
                    case "left":
                        scope.qtipPointerPos = "bottom right";
                        scope.qtipContentPos = "top left";
                        break;
                    case "right":
                        scope.qtipPointerPos = "center left";
                        scope.qtipContentPos = "center right";
                        break;
                    default:
                        scope.qtipPointerPos = "bottom left";
                        scope.qtipContentPos = "top right";
                        break;
                }

                jQuery(scope.parentId).each(function () {
                    jQuery(this).qtip({
                        metadata: {
                            type: "html5",      // Use HTML5 data-* attributes
                            name: "qtipOptions" // Grab the metadata from the data-qtip-options HTML5 attribute
                        },
                        content: {
                            text: jQuery(element),
                            title: attrs.qtipTitle,
                            button: scope.closeButton
                        },
                        style: {
                            tip: {
                                corner: true
                            },
                            classes: "qtip-rounded qtip-shadow qtip-bootstrap"
                        },
                        show: {
                            solo: true,
                            delay: 40
                        },
                        hide: {
                            delay: 50,
                            effect: false
                        },
                        position: {
                            viewport: jQuery(window),
                            target: (attrs.target ? attrs.target : "event"),
                            adjust: {
                                method: "flipinvert",
                                mouse: (attrs.static === null)
                            },
                            my: scope.qtipPointerPos,
                            at: scope.qtipContentPos
                        },
                        events: {
                            hide: function() {
                                element.qtip("destroy");
                            }
                        }
                    });
                });

                scope.$on("$destroy", function () {
                    $(scope.parentId).qtip('destroy', true); // Immediately destroy all tooltips belonging to the selected elements
                });
            }
        };
    });