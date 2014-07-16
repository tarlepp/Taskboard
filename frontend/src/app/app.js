/**
 * Taskboard application definition.
 *
 * This is the main file for the 'Taskboard' application frontend side.
 *
 * @todo should these be done in separated files?
 */
(function() {
    'use strict';

    // Create Taskboard module and specify dependencies for that
    angular.module('Taskboard', [
        'Taskboard-templates',
        'Taskboard.libraries',
        'Taskboard.controllers',
        'Taskboard.components',
        'Taskboard.directives',
        'Taskboard.filters',
        'Taskboard.interceptors',
        'Taskboard.services'
    ]);

    // Initialize 3rd party libraries
    angular.module('Taskboard.libraries', [
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.bootstrap.showErrors',
        'angularMoment',
        'angularjs-gravatardirective',
        'linkify',
        'sails.io'
    ]);

    // Initialize used Taskboard specified modules
    angular.module('Taskboard.controllers', []);
    angular.module('Taskboard.components', []);
    angular.module('Taskboard.directives', []);
    angular.module('Taskboard.filters', []);
    angular.module('Taskboard.interceptors', []);
    angular.module('Taskboard.services', []);

    /**
     * Configuration for frontend application, this contains following main sections:
     *
     *  1) Configure $httpProvider and $sailsSocketProvider
     *  2) Set necessary HTTP and Socket interceptor(s)
     *  3) Turn on HTML5 mode on application routes
     *  4) Set up application routes
     */
    angular.module('Taskboard')
        .config(
            [
                '$stateProvider', '$locationProvider', '$urlRouterProvider', '$httpProvider', '$sailsSocketProvider',
                'AccessLevels',
                function($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, $sailsSocketProvider,
                     AccessLevels
                ) {
                    $httpProvider.defaults.useXDomain = true;

                    delete $httpProvider.defaults.headers.common['X-Requested-With'];

                    // Add interceptors for $httpProvider and $sailsSocketProvider
                    $httpProvider.interceptors.push('AuthInterceptor');
                    $httpProvider.interceptors.push('ErrorInterceptor');

                    $sailsSocketProvider.interceptors.push('AuthInterceptor');
                    $sailsSocketProvider.interceptors.push('ErrorInterceptor');

                    // Yeah we wanna to use HTML5 urls!
                    $locationProvider
                        .html5Mode(true)
                        .hashPrefix('!')
                    ;

                    // Routes that are accessible by anyone
                    $stateProvider
                        .state('anon', {
                            abstract: true,
                            template: '<ui-view/>',
                            data: {
                                access: AccessLevels.anon
                            }
                        })
                        .state('anon.login', {
                            url: '/login',
                            templateUrl: '/Taskboard/login/index.html',
                            controller: 'LoginController'
                        })
                    ;

                    // Routes that needs authenticated user
                    $stateProvider
                        .state('board', {
                            abstract: true,
                            template: '<ui-view/>',
                            data: {
                                access: AccessLevels.user
                            }
                        })
                        .state('board.main', {
                            url: '/board',
                            templateUrl: '/Taskboard/board/index.html',
                            controller: 'BoardController'
                        })
                    ;

                    // For any unmatched url, redirect to /board
                    $urlRouterProvider.otherwise('/board');
                }
            ]
        );

    /**
     * Frontend application run hook configuration. This will attach auth status
     * check whenever application changes URL states.
     */
    angular.module('Taskboard')
        .run(
            [
                '$rootScope', '$state',
                'amMoment',
                'Auth', 'CurrentUser',
                function($rootScope, $state,
                         amMoment,
                         Auth, CurrentUser
                ) {
                    $rootScope.currentUser = CurrentUser.user;

                    $rootScope.$watch('currentUser()', function(valueNew) {
                        if (valueNew && valueNew.language) {
                            amMoment.changeLanguage(valueNew.language);
                        }
                    }, true);

                    // And when ever route changes we must check authenticate status
                    $rootScope.$on('$stateChangeStart', function(event, toState) {
                        if (!Auth.authorize(toState.data.access)) {
                            event.preventDefault();

                            $state.go('anon.login');
                        }
                    });
                }
            ]
        );
}());
