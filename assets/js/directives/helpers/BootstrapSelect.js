/**
 * Angular directive for bootstrap-select library. Usage example:
 *
 *  <select class="show-tick show-menu-arrow"
 *      data-live-search="true"
 *      data-bootstrap-select
 *      data-collection-name="sprints"
 *      data-tb-collection="sprints"
 *      data-tb-selected="sharedData.filters.sprintId"
 *      data-tb-disabled="sharedData.filters.projectId"
 *      data-ng-disabled="!sharedData.filters.projectId || !sprints.length"
 *      data-ng-model="sharedData.filters.sprintId"
 *  >
 *      <option style="display:none" value="" class="text-muted">Choose sprint to show</option>
 *  </select>
 *
 * @see http://silviomoreto.github.io/bootstrap-select/
 */
"use strict";

angular.module("TaskBoardDirectives")
    .directive("bootstrapSelect",
        [
            "$timeout",
            function($timeout) {
                return {
                    restrict: "A",
                    scope: {
                        tbCollection: "=",
                        tbSelected: "=",
                        tbDisabled: "="
                    },
                    link: function(scope, element, attributes) {
                        scope.$watch("tbCollection", function(valueNew, valueOld) {
                            if (valueNew) {
                                $timeout(function() {
                                    element.selectpicker("refresh");
                                });
                            }
                        }, true);

                        scope.$watch("tbSelected", function(valueNew, valueOld) {
                            if (valueNew != valueOld) {
                                $timeout(function() {
                                    element.selectpicker("refresh");
                                });
                            }
                        }, true);

                        scope.$watch("tbDisabled", function(valueNew, valueOld) {
                            if (valueNew != valueOld) {
                                $timeout(function() {
                                    element.selectpicker("refresh");
                                });
                            }
                        }, true);
                    }
                };
            }
        ]
    );
