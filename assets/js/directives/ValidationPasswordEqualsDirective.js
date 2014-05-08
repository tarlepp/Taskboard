/**
 * Simple validation for password equals check. Usage example:
 *
 *  <form name="passwordForm">
 *      <input id="passwordNew" type="password" required="required" autocomplete="off" name="passwordNew"
 *          data-ng-model="passwordNew"
 *          data-ng-minlength="10"
 *      />
 *      <input id="passwordCheck" type="password" required="required" autocomplete="off" name="passwordCheck"
 *          data-ng-model="passwordCheck"
 *          data-ng-minlength="10"
 *          data-validation-password-equals="passwordNew"
 *      />
 *      <span class="help-block text-danger"
 *          data-ng-show="passwordForm.passwordCheck.$error.validationPasswordEquals"
 *      >
 *          Given passwords don't match. Please check given passwords.
 *      </span>
 *  </form>
 */
"use strict";

angular.module('TaskBoardDirectives')
    .directive('validationPasswordEquals', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attributes, ctrl) {
                var firstPassword = '#' + attributes.validationPasswordEquals;

                element.add(firstPassword).on('keyup', function() {
                    scope.$apply(function() {
                        ctrl.$setValidity('validationPasswordEquals', element.val() === jQuery(firstPassword).val());
                    });
                });
            }
        };
    });