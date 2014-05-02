"use strict";

// Specify TaskBoard application dependencies
angular.module("TaskBoardApplication", ["TaskBoard"]);

angular.module("TaskBoardApplication")
    .config(
        [
            "$routeProvider", "$routeSegmentProvider", "$locationProvider", "$httpProvider", "$sailsSocketProvider",
            function($routeProvider, $routeSegmentProvider, $locationProvider, $httpProvider, $sailsSocketProvider) {
                // Cannot use HTML5 mode with sails... yet
                $locationProvider.html5Mode(false);

                // Load used templates automatic
                $routeSegmentProvider.options.autoLoadTemplates = true;

                /**
                 * Add taskboard specified interceptors for $http and $sailsSocket. These will
                 * add necessary CSRF token to POST, PUT and DELETE queries and adds common
                 * error handling for $http and $sailsSocket usage.
                 */
                $httpProvider.interceptors.push("HttpInterceptor");
                $sailsSocketProvider.interceptors.push("SocketInterceptor");


                /**
                 * Route configurations.
                 *
                 * Please add 'getCsrfToken' and 'checkAuthStatus' to each segment
                 * which needs those. Without those application will not work like
                 * it should.
                 */
                $routeSegmentProvider
                    .when("/login",  "auth.login")
                    .when("/logout", "auth.login")

                    .when("/board", "board.main")
                    .when("/board/:projectId", "board.main")
                    .when("/board/:projectId/sprint/:sprintId", "board.main")

                    .segment("auth", {
                        templateUrl: "templates/auth/index.html",
                        controller: "AuthController",
                        resolve: {
                            csrfToken: "CsrfTokenService"
                        },
                        resolveFailed: {}
                    })

                    .within()
                        .segment("login", {templateUrl: "templates/auth/login.html"})

                    .up()

                    .segment("board", {
                        templateUrl: "templates/board/index.html",
                        controller: "BoardController",
                        resolve: {
                            csrfToken: "CsrfTokenService",
                            authStatus: "AuthService"
                        },
                        resolveFailed: {}
                    })

                    .within()
                        .segment("main", {templateUrl: "templates/board/board.html"})

                    .up();

                $routeProvider
                    .otherwise({
                        redirectTo: "/board"
                    });
            }
        ]
    );

angular.module("TaskBoardApplication")
    .run(
        [
            "$rootScope", "$http", "$location",  "amMoment",
            function($rootScope, $http, $location, amMoment) {
                // Initialize global attributes
                $rootScope.message = "";
                $rootScope.currentUser = "";
                $rootScope.csrfToken = "";

                /**
                 * Watcher for root scope message attribute. This will trigger a Noty message
                 * shown to user. This is used globally everywhere on the application. Usage
                 * examples:
                 *
                 *  $rootScope.message = "foo";
                 *  $rootScope.message = {message: "bar", type: "error"}
                 *
                 * Basically this watcher will just call makeMessage function from the rootScope.
                 * Note that you can use also that everywhere in app.
                 */
                $rootScope.$watch("message", function(newValue) {
                    if (newValue) {
                        $rootScope.makeMessage(newValue);
                    }
                });

                /**
                 * Watcher for root scope currentUser attribute. When this is changed we must change
                 * user localization setting so that moment.js and numeral.js can show values right.
                 *
                 * @todo
                 *  1) How to change moment timezone setting?
                 *  2) Add handling for numeral.js
                 */
                $rootScope.$watch("currentUser", function(newValue) {
                    if (newValue) {
                        amMoment.changeLanguage(newValue.language);
                    }
                });

                /**
                 * Logout function which is available in every application page. Usage example:
                 *
                 *  <a data-ng-click="logout()">Sign out</a>
                 *
                 * Logout is also done if you change URL to /#/logout
                 */
                $rootScope.logout = function(noMessage) {
                    noMessage = noMessage || false;

                    $rootScope.currentUser = "";

                    $http
                        .post("/logout")
                        .success(function() {
                            if (!noMessage) {
                                $rootScope.message = "Signed out successfully";
                            }

                            $location.url("/login");
                        })
                        .error(function(data) {
                            if (!noMessage) {
                                $rootScope.message = data;
                            }

                            $location.url("/login");
                        });
                };

                /**
                 * Generic helper function to show noty message to user. This can be used two
                 * different ways:
                 *
                 *  $rootScope.message = "Your message";
                 *  $rootScope.makeMessage("Your message");
                 *
                 * Note that actual message can be an object or simple string.
                 *
                 * @param {helper.message|{}|String} message
                 */
                $rootScope.makeMessage = function(message) {
                    var text = message.text || message,
                        type = message.type || "success",
                        layout = message.layout || "top",
                        timeout = message.timeout || 6000,
                        options = message.options || {};

                    if (!message.timeout) {
                        switch (type) {
                            case "success":
                                timeout = 3000;
                                break;
                        }
                    }

                    // Create noty
                    noty(_.merge({
                        text: text,
                        type: type,
                        layout: layout,
                        timeout: timeout
                    }, options));
                };
            }
        ]
    );