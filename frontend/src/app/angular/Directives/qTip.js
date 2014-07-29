/* global jQuery */
/**
 * Angular directive for qTip2 library. Usage example:
 *
 *  <a id='qtip-trigger-tooltipContainer'>
 *      foo bar
 *      <div data-qtip data-qtip-id='tooltipContainer'>Tooltip content here</div>
 *  </a>
 *
 * Directive supports following data-attributes:
 *  data-position   =   Pre-defined positions supported values: 'top', 'bottom',
 *                      'bottomRight', 'left', 'leftMiddle' and 'Right'
 *  data-class      =   Custom class to attach to qTip tooltip container, usefully
 *                      when using custom styling on tooltip content
 *
 * Also you can override all qTip options via 'data-qtip-options' attribute on
 * element which triggers qTip tooltip to show. Usage example:
 *
 *  <span id="qtip-trigger-search-columns" class="input-group-addon search"
 *      data-qtip-options='{ "hide": { "delay": 200, "fixed": true } }'
 *  >Foo</span>
 *
 * This is very usefully when you need to use some qTip specified options on
 * your tooltip.
 *
 * @see http://qtip2.com/
 */
(function() {
    'use strict';
    angular.module('Taskboard.directives')
        .directive('qtip',
            [
                '$timeout',
                function($timeout) {
                    return {
                        restrict: 'A',
                        scope: {
                            qtipId: '@',
                            qtipContent: '@'
                        },
                        transclude: true,
                        replace: true,
                        templateUrl: '/Taskboard/partials/Directives/qTip.html',
                        link: function(scope, element, attributes) {
                            scope.parentId = '#qtip-trigger-' + attributes.qtipId;
                            scope.closeButton = (attributes.closeButton);

                            var classes = '';

                            if (attributes.class) {
                                classes = attributes.class;
                            }

                            switch (attributes.position) {
                                case 'top':
                                    scope.qtipPointerPos = 'bottom center';
                                    scope.qtipContentPos = 'top center';
                                    break;
                                case 'bottom':
                                    scope.qtipPointerPos = 'top center';
                                    scope.qtipContentPos = 'bottom center';
                                    break;
                                case 'bottomRight':
                                    scope.qtipPointerPos = 'top left';
                                    scope.qtipContentPos = 'bottom center';
                                    break;
                                case 'left':
                                    scope.qtipPointerPos = 'bottom right';
                                    scope.qtipContentPos = 'top left';
                                    break;
                                case 'leftMiddle':
                                    scope.qtipPointerPos = 'center right';
                                    scope.qtipContentPos = 'center left';
                                    break;
                                case 'right':
                                    scope.qtipPointerPos = 'center left';
                                    scope.qtipContentPos = 'center right';
                                    break;
                                default:
                                    scope.qtipPointerPos = 'bottom left';
                                    scope.qtipContentPos = 'top right';
                                    break;
                            }

                            var init = function() {
                                jQuery('body').find(scope.parentId).each(function() {
                                    console.log('founded');
                                    jQuery(this).qtip({
                                        metadata: {
                                            type: 'html5',      // Use HTML5 data-* attributes
                                            name: 'qtipOptions' // Grab the metadata from the data-qtip-options HTML5 attribute
                                        },
                                        content: {
                                            text: jQuery(element),
                                            title: attributes.qtipTitle,
                                            button: scope.closeButton
                                        },
                                        style: {
                                            tip: {
                                                corner: true
                                            },
                                            classes: 'qtip-rounded qtip-shadow qtip-bootstrap ' + classes
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
                                            target: (attributes.target ? attributes.target : 'event'),
                                            adjust: {
                                                method: 'flipinvert',
                                                mouse: (attributes.static === null)
                                            },
                                            my: scope.qtipPointerPos,
                                            at: scope.qtipContentPos
                                        },
                                        events: {
                                            hide: function() {
                                                element.qtip('destroy');
                                            }
                                        }
                                    });
                                });
                            };

                            $timeout(function() {
                                init();
                            });

                            // Immediately destroy all tooltips belonging to the selected elements
                            scope.$on('$destroy', function() {
                                jQuery('body').find(scope.parentId).qtip('destroy', true);
                            });
                        }
                    };
                }
            ]
        );
}());
