/**
 * Directive to check that user given password matches with current one. Actual check is done in
 * server side against given password value and current signed in user. Usage example:
 *
 *  <input type="password" class="form-control" required="required" autocomplete="off" name="passwordCurrent"
 *      data-ng-model="passwordCurrent"
 *      data-validation-password-check
 *  />
 *
 *  <span class="help-block text-danger"
 *      data-ng-show="form.userPassword.passwordCurrent.$error.validationPasswordCheck"
 *  >
 *      Invalid password, please enter your current password.
 *  </span>
 *
 * Note that directive attach check on 'keyup' and 'blur' events on actual input control.
 */
"use strict";

angular.module('TaskBoardDirectives')
    .directive('validationPasswordCheck',
        [
            "$http", "$timeout",
            function($http, $timeout) {
                return {
                    restrict: 'A',
                    require: 'ngModel',
                    link: function(scope, element, attributes, ctrl) {
                        var timer;

                        element.bind('keyup', function() {
                            if (timer) {
                                $timeout.cancel(timer);
                            }

                            timer = $timeout(function() {
                                checkPassword();
                            }, 250);
                        });

                        element.bind('blur', function() {
                            checkPassword();
                        });

                        function checkPassword() {
                            $http
                                .post("/Auth/checkPassword", {password: element.val()})
                                .success(function() {
                                    ctrl.$setValidity('validationPasswordCheck', true);
                                })
                                .error(function() {
                                    ctrl.$setValidity('validationPasswordCheck', false);
                                });
                        }
                    }
                };
            }
        ]
    );