"use strict";

// Specify TaskBoard application dependencies
angular.module("TaskBoardApplication", ["TaskBoard"]);

angular.module("TaskBoardApplication")
    .config(
        [
            "$routeProvider", "$routeSegmentProvider", "$locationProvider", "$httpProvider",
            function($routeProvider, $routeSegmentProvider, $locationProvider, $httpProvider) {

                /**
                 * Private function to inject CSRF token to $rootScope, this is needed with every
                 * $http request otherwise those will fail at sails.js endpoint. Function will set
                 * provided CSRF token to $rootScope.csrfToken attribute where it's usable from
                 * anywhere in the application.
                 *
                 * Function is called with route resolve callbacks within necessary routes.
                 *
                 * @param $q
                 * @param $timeout
                 * @param $http
                 * @param $location
                 * @param $rootScope
                 *
                 * @returns {Deferred.promise|*}
                 */
                var getCsrfToken = function($q, $timeout, $http, $location, $rootScope) {
                    // Initialize a new promise
                    var deferred = $q.defer();

                    // Fetch CSRF token for this session
                    $http
                        .get("/csrfToken")
                        .success(function(data, status, headers, config) {
                            $timeout(deferred.resolve, 0);

                            $rootScope.csrfToken = data._csrf;
                        })
                        .error(function(data, status, headers, config) {
                            $rootScope.makeMessage({
                                message: data,
                                type: "error"
                            });

                            $timeout(function() {
                                deferred.reject();
                            }, 0);
                        });

                    return deferred.promise;
                };

                /**
                 * Private function to check if current user is authenticated or not. This function
                 * is called with route resolve method with specified routes. After successfully
                 * authentication function will attach user object to $rootScope.currentUser where
                 * it's usable all over the application.
                 *
                 * Note that you have to add this function call to all routes which needs to be
                 * authenticated on server side.
                 *
                 * @param $q
                 * @param $timeout
                 * @param $http
                 * @param $location
                 * @param $rootScope
                 *
                 * @returns {Deferred.promise|*}
                 */
                var checkAuthStatus = function($q, $timeout, $http, $location, $rootScope) {
                    // Initialize a new promise
                    var deferred = $q.defer();

                    $http
                        .get("/Auth/authenticate")
                        .success(function(data, status, headers, config) {
                            // Authenticated
                            if (data != "false") {
                                $timeout(deferred.resolve, 0);

                                $rootScope.currentUser = data;
                            } else { // Not Authenticated
                                $rootScope.message = {
                                    message: "You need to sign in",
                                    type: "error"
                                };

                                $timeout(function() {
                                    deferred.reject();
                                }, 0);

                                $location.url("/login");
                            }
                        })
                        .error(function(data, status, headers, config) {
                            $rootScope.message = {
                                message: "You need to sign in",
                                type: "error"
                            };

                            $timeout(function() {
                                deferred.reject();
                            }, 0);

                            $location.url("/login");
                         });

                    return deferred.promise;
                };

                /**
                 * HTTP interceptor to check that current user is really signed in to
                 * Taskboard application. If not redirect user back to sign in page.
                 */
                $httpProvider.responseInterceptors.push(function($q, $location) {
                    return function(promise) {
                        return promise.then(
                            // Success: just return the response
                            function(response) {
                                return response;
                            },

                            // Error: check the error status to get only the 401
                            function(response) {
                                if (response.status === 401) {
                                    $location.url("/login");
                                }

                                return $q.reject(response);
                            }
                        );
                    }
                });

                // Load used templates automatic
                $routeSegmentProvider.options.autoLoadTemplates = true;

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

                    .when("/",      "board.main")
                    .when("/board", "board.main")

                    .segment("auth", {
                        templateUrl: "templates/auth/index.html",
                        controller: "AuthController",
                        resolve: {
                            csrfToken: getCsrfToken
                        },
                        resolveFailed: {}
                    })

                    .within()
                        .segment("login", {
                            templateUrl: "templates/auth/login.html"
                        })

                    .up()

                    .segment("board", {
                        templateUrl: "templates/board/index.html",
                        controller: "BoardController",
                        resolve: {
                            authStatus: checkAuthStatus,
                            csrfToken: getCsrfToken
                        },
                        resolveFailed: {}
                    })

                    .within()
                        .segment("main", {
                            templateUrl: "templates/board/board.html"
                        })

                    .up()
                ;

                $routeProvider
                    .otherwise({
                        redirectTo: "/"
                    })
                ;
            }
        ]
    );

angular.module("TaskBoardApplication")
    .run(
        [
            "$rootScope", "$http", "$location",
            function($rootScope, $http, $location) {
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
                $rootScope.$watch("message", function(newValue, oldValue) {
                    if (newValue) {
                        $rootScope.makeMessage(newValue);
                    }
                });

                /**
                 * Logout function which is available in every application page. Usage example:
                 *
                 *  <a data-ng-click="logout()">Sign out</a>
                 *
                 * Logout is also done if you change URL to /#/logout
                 */
                $rootScope.logout = function() {
                    $rootScope.message = "Signed out successfully";
                    $http.post("/logout", {_csrf: $rootScope.csrfToken});
                    $location.url("/login");
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
                 * @param {sails.helper.message|String} message
                 */
                $rootScope.makeMessage = function(message) {
                    var text = message.message || message;
                    var type = message.type || "success";
                    var layout = message.layout || "top";
                    var timeout = message.timeout || 6000;
                    var options = message.options || {};

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
                }
            }
        ]
    );