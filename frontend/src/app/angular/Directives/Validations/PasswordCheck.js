/* global jQuery */
/**
 * Directive to check that user given password matches with current one. Actual check is done in
 * server side against given password value and current signed in user. Usage example:
 *
 *  <input type='password' class='form-control' required='required' autocomplete='off' name='passwordCurrent'
 *      data-ng-model='passwordCurrent'
 *      data-password-check
 *  />
 *
 *  <span class='help-block text-danger'
 *      data-ng-show='form.userPassword.passwordCurrent.$error.passwordCheck'
 *  >
 *      Invalid password, please enter your current password.
 *  </span>
 *
 * Note that directive attach check on 'keyup' event on actual input control. Server side allows only current
 * user to make this request.
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('passwordCheck',
            [
                '$sailsSocket', '$timeout',
                function($sailsSocket, $timeout) {
                    return {
                        restrict: 'A',
                        require: 'ngModel',
                        link: function(scope, element, attributes, ctrl) {
                            var timer;
                            var spinner = '<div class="pull-right input-spinner"><i class="fa fa-spinner fa-spin"></i></div>';

                            jQuery(spinner).insertAfter(element);

                            var loading = element.parent().find('div');

                            element.bind('keyup', function() {
                                $timeout.cancel(timer);

                                loading.show();

                                timer = $timeout(function() {
                                    checkPassword();
                                }, 350);
                            });


                            function checkPassword() {
                                $sailsSocket
                                    .post('/Auth/checkPassword', {password: element.val()}, {showErrorMessage: false})
                                    .success(function() {
                                        loading.hide();

                                        ctrl.$setValidity('passwordCheck', true);
                                    })
                                    .error(function() {
                                        loading.hide();

                                        ctrl.$setValidity('passwordCheck', false);
                                    });
                            }
                        }
                    };
                }
            ]
        );
}());
