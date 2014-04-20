"use strict";

angular.module("TaskBoardDirectives")
    .directive("selectpicker",
        [
            "$timeout",
            function($timeout) {
                return {
                    restrict: "A",
                    require: ["?ngModel", "?collectionName"],
                    compile: function(tElement, tAttrs, transclude) {
                        tElement.selectpicker();

                        if (angular.isUndefined(tAttrs.ngModel)) {
                            throw new Error("Please add ng-model attribute!");
                        } else if (angular.isUndefined(tAttrs.collectionName)) {
                            throw new Error("Please add data-collection-name attribute!");
                        }

                        return function(scope, element, attrs, ngModel) {
                            if (angular.isUndefined(ngModel)){
                                return;
                            }

                            scope.$watch(attrs.disableAttribute, function(newValue, oldValue) {
                                $timeout(function() {
                                    element.selectpicker("refresh");
                                });
                            });

                            scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    $timeout(function() {
                                        element.selectpicker("val", element.val());
                                    });
                                }
                            });

                            scope.$watch(attrs.collectionName, function(newValue, oldValue) {
                                $timeout(function() {
                                    element.selectpicker("refresh");
                                });
                            });

                            ngModel.$render = function() {
                                element.selectpicker("val", ngModel.$viewValue || "");
                            };

                            ngModel.$viewValue = element.val();
                        };
                    }
                }
            }
        ]
    );