/**
 * Simple password strength meter directive that uses jQuery complexify plugin. Note that this directive
 * requires 'angular-bootstrap' directives and actual complexify jQuery plugin to work.
 *
 * @see https://github.com/angular-ui/bootstrap
 * @see https://github.com/danpalmer/jquery.complexify.js/
 */
'use strict';

angular.module('TaskBoardDirectives')
    .directive('passwordStrengthMeter',
        function() {
            return {
                restrict: 'E',
                scope: {
                    password: '='
                },
                template: '<progressbar class="form-control" value="complexity" type="{{type}}">{{complexity|number:1}}%</progressbar>',
                link: function link(scope, element, attributes) {
                    scope.complexity = 0;
                    scope.type = 'danger';

                    jQuery('#' + attributes.input).complexify({}, function(valid, complexity) {
                        scope.complexity = complexity;

                        if (complexity < 33) {
                            scope.type = 'danger';
                        } else if (complexity < 66) {
                            scope.type = 'warning';
                        } else {
                            scope.type = 'success';
                        }
                    });
                }
            };
        }
    );


