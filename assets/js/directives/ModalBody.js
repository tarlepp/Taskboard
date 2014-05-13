/**
 * Simple directive to change bootstrap modal body max-height value to be maximum that
 * users browser can show. Directive itself is fairly straight forward, it just attach
 * itself to bootstrap model content body class (modal-body). Directive attach window
 * resize event to update max-height value of modal body.
 */
'use strict';

angular.module('TaskBoardDirectives')
    .directive('modalBody',
        [
            '$timeout',
            function($timeout) {
                return {
                    restrict: 'C',
                    link: function(scope, element, attributes) {
                        var header = angular.element('#header .navbar');
                        var footer = angular.element('#footer .navbar');

                        var resize = function() {
                            var totalHeight =  angular.element(document).height() - header.height() - footer.height() - 80;

                            angular.element(element).css('max-height', totalHeight + 'px');
                        };

                        angular.element(window).resize(function() {
                            $timeout(resize);
                        });

                        scope.$on('resizeMe', function() {
                            $timeout(resize);
                        });

                        resize();
                    }
                };
            }
        ]
    );