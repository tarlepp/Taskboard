"use strict";

angular.module("TaskBoardDirectives")
    .directive("bootstrapSelect",
        [
            "$timeout",
            function($timeout) {
                return {
                    restrict: "A",
                    scope: true,
                    require: ["?ngModel", "?collectionName"],
                    compile: function(tElement, tAttributes) {
                        if (angular.isUndefined(tAttributes.ngModel)) {
                            throw new Error("Please add ng-model attribute!");
                        } else if (angular.isUndefined(tAttributes.collectionName)) {
                            throw new Error("Please add data-collection-name attribute!");
                        }

                        return function(scope, element, attributes, ngModel) {
                            if (angular.isUndefined(ngModel)){
                                return;
                            }

                            scope.$watch(attributes.disableAttribute, function() {
                                $timeout(function() {
                                    element.selectpicker("refresh");
                                });
                            });

                            scope.$watch(attributes.ngModel, function(newValue, oldValue) {
                                if (newValue && newValue != oldValue) {
                                    $timeout(function() {
                                        element.selectpicker("refresh");
                                    });
                                }
                            });

                            scope.$watch(attributes.collectionName, function() {
                                $timeout(function() {
                                    element.selectpicker("refresh");
                                });
                            });
                        };
                    }
                };
            }
        ]
    );