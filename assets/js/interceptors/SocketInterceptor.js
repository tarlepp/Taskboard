/**
 * Common interceptor for $sailSocket  to handle pre-processing of requests and post-processing of
 * responses. Before actual request interceptor will add required CSRF token to each request so
 * those can be made to server side.
 *
 * On response event interceptor will handle possible sails.js specified errors and activate
 * show of those via $rootScope.message model.
 *
 * @see https://docs.angularjs.org/api/ng/service/$http#interceptors
 * @see /assets/js/application.js
 */
"use strict";

angular.module("TaskBoardInterceptors")
    .factory("SocketInterceptor",
        [
            "$rootScope", "$q",
            function($rootScope, $q) {
                /**
                 * Private helper function to make human readable error string of sails socket errors.
                 *
                 * todo: add better message formatting.
                 *
                 * @param   {sailsSocketError}    error
                 *
                 * @returns {String}
                 */
                function parseSailsError(error) {
                    var attributeErrors = [];
                    var attributes = _.map(error.invalidAttributes, function(data, attribute) {
                        var list = '<% _.forEach(messages, function(message) { %><li><%= message %></li><% }); %>';

                        attributeErrors.push(
                            _.template(
                                "<li> <%= attribute %> <ul> <%= messages %> </ul></li>",
                                {
                                    attribute: attribute,
                                    messages: _.template(list, {"messages": _.pluck(data, "message") })
                                }
                            )
                        );

                        return attribute;
                    });

                    return _.template(
                        "<%= summary %>: '<%= attributes %>' detailed information: " +
                        "<ul class='text-left list-unstyled'><%= detailed %></ul>",
                        {
                            summary: error.summary,
                            attributes: attributes.join("', '"),
                            detailed: attributeErrors.join("")
                        }
                    );
                }

                return {
                    /**
                     * Interceptor method for sailsSocket requests. Basically this will add required
                     * CSRF token to POST, PUT and DELETE requests.
                     *
                     * @param   {interceptorHttpConfig}   config
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
                     * Interceptor method which is triggered whenever request error occurs on
                     * sailsSocket queries.
                     *
                     * @param   {interceptorHttpRejection}  rejection
                     *
                     * @returns {Promise}
                     */
                    requestError: function(rejection) {
                        $rootScope.message = {
                            text: parseSailsError(rejection.data),
                            type: "error"
                        };

                        return $q.reject(rejection);
                    },

                    /**
                     * This is a bit hack, for some reason sails socket returns HTTP 200 on errors...
                     * This is weird and frustrating.
                     *
                     * @see https://github.com/balderdashy/angularSails/issues/25

                     * @param   {interceptorHttpResponse}   response
                     *
                     * @returns {interceptorHttpResponse|Promise}
                     */
                    response: function(response) {
                        if (response.data.status && response.data.status != 200) {
                            // Todo handle all kinds of responses, eg validation error and etc...
                            $rootScope.message = {
                                text: parseSailsError(response.data),
                                type: "error"
                            };

                            return $q.reject(response);
                        } else {
                            return response || $q.when(response);
                        }
                    },

                    /**
                     * Interceptor method which is triggered whenever response error occurs on
                     * sailsSocket queries.
                     *
                     * @param   {interceptorHttpRejection}  rejection
                     *
                     * @returns {Promise}
                     */
                    responseError: function(rejection) {
                        $rootScope.message = {
                            text: parseSailsError(rejection.data),
                            type: "error"
                        };

                        return $q.reject(rejection);
                    }
                };
            }
        ]
    );