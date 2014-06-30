/**
 * Generic directive for bootstrap-select component to work with angular.js library.
 *
 *  https://github.com/silviomoreto/bootstrap-select
 *  https://github.com/joaoneto/angular-bootstrap-select/issues/7
 *
 * Usage examples:
 *
 *  <select class="show-tick show-menu-arrow form-control"
 *      data-live-search="true"
 *      data-container="body"
 *      data-bootstrap-select
 *      data-collection="projects"
 *      data-ng-model="projectId"
 *      data-ng-options="project.id as project.title for project in projects | orderBy:'title'"
 *  >
 *      <option style="display:none" value="" class="text-muted">Choose project to show</option>
 *  </select>
 *
 * This directive uses following data attributes to work:
 *
 *  data-collection   = Collection which contains all options, required.
 *  data-ng-model     = Used angular model, required
 *  data-refresh      = Scope model to watch manual refresh, not required
 *  data-ng-disabled  = Angular model to watch select disable state, not required
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('bootstrapSelect',
            [
                '$timeout',
                function($timeout) {
                    return {
                        restrict: 'A',
                        scope: {
                            collection: '=',
                            refresh: '=',
                            ngModel: '=',
                            ngDisabled: '='
                        },
                        compile: function() {
                            return function(scope, element) {
                                /**
                                 * Watcher for collection changes, this will refresh bootstrap-select
                                 * whenever actual option list collection changes.
                                 */
                                scope.$watch('collection', function(valueNew) {
                                    if (valueNew) {
                                        $timeout(function() {
                                            element.selectpicker('refresh');
                                        });
                                    }
                                }, true);

                                /**
                                 * Watcher for force refresh of bootstrap-select component. This is needed
                                 * eg. when you want to change 'empty option' text to another one and actual
                                 * collection doesn't change at all.
                                 */
                                scope.$watch('refresh', function(valueNew, valueOld) {
                                    if (valueNew !== valueOld) {
                                        $timeout(function() {
                                            element.selectpicker('refresh');
                                        });
                                    }
                                }, true);

                                /**
                                 * Watcher for select disable attribute. Without this watcher actual
                                 * bootstrap-select will not get disabled at all.
                                 */
                                scope.$watch('ngDisabled', function(valueNew , valueOld) {
                                    if (valueNew !== valueOld) {
                                        $timeout(function() {
                                            element.selectpicker('refresh');
                                        });
                                    }
                                }, true);

                                /**
                                 * Watcher for actual select ng-model. This is needed to update select
                                 * content whenever actual ng-model is changed outside of bootstrap-select.
                                 */
                                scope.$watch('ngModel', function(valueNew) {
                                    if (valueNew) {
                                        $timeout(function() {
                                            element.selectpicker('refresh');
                                        });
                                    }
                                });
                            };
                        }
                    };
                }
            ]
        );
}());
