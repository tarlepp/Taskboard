/**
 * Login controller to handle user's login to application. Controller uses 'Auth' service
 * to make actual HTTP request to backend server and try to authenticate user.
 *
 * After successfully login, Auth service will store user data and JWT token via 'Storage'
 * service where those are asked whenever needed in application.
 *
 * @todo    - Different authentication providers?
 *          - Which ones we want to support?
 *          - User registration?
 */
(function() {
    'use strict';

    angular.module('Taskboard.controllers')
        .controller('LoginController',
            [
                '$scope', '$state', 'Auth',
                function($scope, $state, Auth) {
                    // Already authenticated so redirect back to board
                    if (Auth.isAuthenticated()) {
                        $state.go('board.main');
                    }

                    // Initialize credentials
                    $scope.credentials = {
                        identifier: '',
                        password: ''
                    };

                    // Scope function to perform actual login request to server
                    $scope.login = function() {
                        Auth
                            .login($scope.credentials)
                            .then(
                                function() {
                                    $state.go('board.main');
                                },
                                function() {
                                    $scope.credentials = {
                                        identifier: '',
                                        password: ''
                                    };

                                    angular.element('input[name=username]').focus();
                                }
                            );
                    };
                }
            ]
        );
}());
