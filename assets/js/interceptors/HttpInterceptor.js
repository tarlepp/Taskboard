/**
 * Common interceptor for $http to handle pre-processing of requests and post-processing of
 * responses. Before actual request interceptor will add required CSRF token to each request so
 * those can be made to server side.
 *
 * @link    https://docs.angularjs.org/api/ng/service/$http#interceptors
 * @see     /assets/js/application.js
 */
"use strict";

angular.module("TaskBoardInterceptors")
    .factory("HttpInterceptor",
        [
            "$rootScope", "$location", "$q",
            function($rootScope, $location, $q) {
                return {
                    /**
                     * Interceptor method for $http requests. Basically this will add required CSRF token
                     * to POST, PUT and DELETE requests.
                     *
                     * @param   {interceptorHttpConfig} config
                     *
                     * @returns {interceptorHttpConfig|Promise}
                     */
                    request: function(config) {
                        if (config.method == "POST" || config.method == "PUT" || config.method == "DELETE") {
                            if (!config.data) {
                                config.data = {};
                            }

                            config.data._csrf = $rootScope.csrfToken;
                        }

                        return config || $q.when(config);
                    },

                    /**
                     * Interceptor method which is triggered whenever request error occurs on $http queries.
                     *
                     * @param   {interceptorHttpRejection}  rejection
                     *
                     * @returns {Promise}
                     */
                    requestError: function(rejection) {
                        return $q.reject(rejection);
                    },

                    /**
                     * Interceptor method which is triggered whenever response occurs on $http queries. Note
                     * that this has some sails.js specified hack for errors that returns HTTP 200 status.
                     *
                     * This is maybe sails.js bug, but I'm not sure of that.
                     *
                     * @param   {interceptorHttpResponse}   response
                     *
                     * @returns {Promise}
                     */
                    response: function(response) {
                        if (response.data.status && response.data.status != 200) {
                            return $q.reject(response);
                        } else {
                            return response || $q.when(response);
                        }
                    },

                    /**
                     * Interceptor method which is triggered whenever response error occurs on $http queries.
                     *
                     * @param   {interceptorHttpRejection}  rejection
                     *
                     * @returns {Promise}
                     */
                    responseError: function(rejection) {
                        if (rejection.status === 401) {
                            if ($rootScope.currentUser) {
                                $rootScope.logout();
                            } else {
                                $location.url("/login");
                            }
                        }

                        return $q.reject(rejection);
                    }
                };
            }
        ]
    );
