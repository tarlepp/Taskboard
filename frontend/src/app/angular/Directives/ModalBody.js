/**
 * Simple directive to change bootstrap modal body max-height value to be maximum that
 * users browser can show. Directive itself is fairly straight forward, it just attach
 * itself to bootstrap model content body class (modal-body). Directive attach window
 * resize event to update max-height value of modal body.
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('modalBody',
            [
                '$timeout',
                function($timeout) {
                    return {
                        restrict: 'C',
                        link: function(scope, element) {
                            // Determine reserved header and footer elements
                            var header = angular.element('header .navbar');
                            var footer = angular.element('footer .navbar');

                            // Helper function to attach new modal-body max-height CSS property
                            var resize = function() {
                                var totalHeight =  angular.element(document).height() - header.height() - footer.height() - 70;

                                angular.element(element).css('max-height', totalHeight + 'px');
                            };

                            // Make new resize of modal-body whenever user changes browser window size
                            angular.element(window).resize(function() {
                                $timeout(resize);
                            });

                            // Resize again whenever 'resizeModal' event is broadcast
                            scope.$on('resizeModal', function() {
                                $timeout(resize);
                            });

                            // And in init resize modal
                            resize();
                        }
                    };
                }
            ]
        );
}());
