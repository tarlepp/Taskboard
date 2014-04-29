
/**
 * @ngDoc function
 * @name angularSails.io.SailsResponse
 *
 * @description
 *
 * Transforms a raw sails response into a $http-like responseObject
 *
 * @param requestContext
 * @param responseContext
 * @constructor
 */

function SailsResponse(requestContext, responseContext) {

    if(angular.isString(responseContext)){
        responseContext = angular.fromJson(responseContext);

    }

    this.data = responseContext.body || {};
    this.headers = responseContext.headers || {};
    this.status = responseContext.statusCode || 200;
    this.config = requestContext;

}
'use strict';

/* global
 angularModule: true,

*/


/**
 * @ngdoc overview
 * @module ngsails
 * @name ngsails
 *
 * @description foobar
 *
 **/



function $sailsSocketProvider() {
    var JSON_START = /^\s*(\[|\{[^\{])/,
        JSON_END = /[\}\]]\s*$/,
        PROTECTION_PREFIX = /^\)\]\}',?\n/,
        CONTENT_TYPE_APPLICATION_JSON = {'Content-Type': 'application/json;charset=utf-8'};

    var defaults = this.defaults = {
        // transform incoming response data
        transformResponse: [function(data) {
            if (angular.isString(data)) {
                // strip json vulnerability protection prefix
                data = data.replace(PROTECTION_PREFIX, '');
                if (JSON_START.test(data) && JSON_END.test(data))
                    data = fromJson(data);
            }
            return data;
        }],

        // transform outgoing request data
        transformRequest: [function(d) {
            return isObject(d) && !isFile(d) && !isBlob(d) ? toJson(d) : d;
        }],

        // default headers
        headers: {
            common: {
                'Accept': 'application/json, text/plain, */*'
            },
            post:   angular.copy(CONTENT_TYPE_APPLICATION_JSON),
            put:    angular.copy(CONTENT_TYPE_APPLICATION_JSON),
            patch:  angular.copy(CONTENT_TYPE_APPLICATION_JSON)
        },

        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN'
    };

    /**
     * Are ordered by request, i.e. they are applied in the same order as the
     * array, on request, but reverse order, on response.
     */
    var interceptorFactories = this.interceptors = [];

    /**
     * For historical reasons, response interceptors are ordered by the order in which
     * they are applied to the response. (This is the opposite of interceptorFactories)
     */
    var responseInterceptorFactories = this.responseInterceptors = [];

    this.$get = ['$sailsSocketBackend', '$browser', '$cacheFactory', '$rootScope', '$q', '$injector',
        function($sailsSocketBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {

            var defaultCache = $cacheFactory('$sailsSocket');

            /**
             * Interceptors stored in reverse order. Inner interceptors before outer interceptors.
             * The reversal is needed so that we can build up the interception chain around the
             * server request.
             */
            var reversedInterceptors = [];

            angular.forEach(interceptorFactories, function(interceptorFactory) {
                reversedInterceptors.unshift(angular.isString(interceptorFactory)
                    ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
            });

            angular.forEach(responseInterceptorFactories, function(interceptorFactory, index) {
                var responseFn = angular.isString(interceptorFactory)
                    ? $injector.get(interceptorFactory)
                    : $injector.invoke(interceptorFactory);

                /**
                 * Response interceptors go before "around" interceptors (no real reason, just
                 * had to pick one.) But they are already reversed, so we can't use unshift, hence
                 * the splice.
                 */
                reversedInterceptors.splice(index, 0, {
                    response: function(response) {
                        return responseFn($q.when(response));
                    },
                    responseError: function(response) {
                        return responseFn($q.reject(response));
                    }
                });
            });


            /**
             * @ngdoc service
             * @kind function
             * @name ngsails.$sailsSocket
             *
             * @requires $cacheFactory
             * @requires $rootScope
             * @requires $q
             * @requires $injector
             *
             *
             *
             * @description
             * The `$sailsSocket` service is the core service that facilitates communication with sails via socket.io
             *
             *
             * For a higher level of abstraction, please check out the $sailsResource service.
             *
             * The $sailsSocket API is based on the deferred/promise APIs exposed by
             * the $q service. While for simple usage patterns this doesn't matter much, for advanced usage
             * it is important to familiarize yourself with these APIs and the guarantees they provide.
             *
             *
             * # General usage
             * The `$sailsSocket` service is a function which takes a single argument — a configuration object —
             * that is used to generate a request and returns  a promise
             * with two $sailsSocket specific methods: `success` and `error`.
             *
             * ```js
             *   $sailsSocket({method: 'GET', url: '/someUrl'}).
             *     success(function(data, status, headers, config) {
     *       // this callback will be called asynchronously
     *       // when the response is available
     *     }).
             *     error(function(data, status, headers, config) {
     *       // called asynchronously if an error occurs
     *       // or server returns response with an error status.
     *     });
             * ```
             *
             * Since the returned value of calling the $sailsSocket function is a `promise`, you can also use
             * the `then` method to register callbacks, and these callbacks will receive a single argument –
             * an object representing the response. See the API signature and type info below for more
             * details.
             *
             * # Shortcut methods
             *
             * Shortcut methods are also available. All shortcut methods require passing in the URL, and
             * request data must be passed in for POST/PUT requests.
             *
             * ```js
             *   $sailsSocket.get('/someUrl').success(successCallback);
             *   $sailsSocket.post('/someUrl', data).success(successCallback);
             * ```
             *
             * Complete list of shortcut methods:
             *
             * - $sailsSocket.get
             * - $sailsSocket.head
             * - $sailsSocket.post
             * - $sailsSocket.put
             * - $sailsSocket.delete
             * - $sailsSocket.subscribe
             *
             *
             * # Setting Headers
             *
             * The $sailsSocket service will automatically add certain headers to all requests. These defaults
             * can be fully configured by accessing the `$sailsSocketProvider.defaults.headers` configuration
             * object, which currently contains this default configuration:
             *
             * - `$sailsSocketProvider.defaults.headers.common` (headers that are common for all requests):
             *   - `Accept: application/json, text/plain, * / *`
             * - `$sailsSocketProvider.defaults.headers.post`: (header defaults for POST requests)
             *   - `Content-Type: application/json`
             * - `$sailsSocketProvider.defaults.headers.put` (header defaults for PUT requests)
             *   - `Content-Type: application/json`
             *
             * To add or overwrite these defaults, simply add or remove a property from these configuration
             * objects. To add headers for an HTTP method other than POST or PUT, simply add a new object
             * with the lowercased HTTP method name as the key, e.g.
             * `$sailsSocketProvider.defaults.headers.get = { 'My-Header' : 'value' }.
             *
             * The defaults can also be set at runtime via the `$sailsSocket.defaults` object in the same
             * fashion. For example:
             *
             * ```
             * module.run(function($sailsSocket) {
     *   $sailsSocket.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w'
     * });
             * ```
             *
             * In addition, you can supply a `headers` property in the config object passed when
             * calling `$sailsSocket(config)`, which overrides the defaults without changing them globally.
             *
             *
             * # Transforming Requests and Responses
             *
             * Both requests and responses can be transformed using transform functions. By default, Angular
             * applies these transformations:
             *
             * Request transformations:
             *
             * - If the `data` property of the request configuration object contains an object, serialize it
             *   into JSON format.
             *
             * Response transformations:
             *
             *  - If XSRF prefix is detected, strip it (see Security Considerations section below).
             *  - If JSON response is detected, deserialize it using a JSON parser.
             *
             * To globally augment or override the default transforms, modify the
             * `$sailsSocketProvider.defaults.transformRequest` and `$sailsSocketProvider.defaults.transformResponse`
             * properties. These properties are by default an array of transform functions, which allows you
             * to `push` or `unshift` a new transformation function into the transformation chain. You can
             * also decide to completely override any default transformations by assigning your
             * transformation functions to these properties directly without the array wrapper.  These defaults
             * are again available on the $sailsSocket factory at run-time, which may be useful if you have run-time
             * services you wish to be involved in your transformations.
             *
             * Similarly, to locally override the request/response transforms, augment the
             * `transformRequest` and/or `transformResponse` properties of the configuration object passed
             * into `$sailsSocket`.
             *

             * # Interceptors
             *
             * Before you start creating interceptors, be sure to understand the
             * $q and deferred/promise APIs.
             *
             * For purposes of global error handling, authentication, or any kind of synchronous or
             * asynchronous pre-processing of request or postprocessing of responses, it is desirable to be
             * able to intercept requests before they are handed to the server and
             * responses before they are handed over to the application code that
             * initiated these requests. The interceptors leverage the promise APIs to fulfill this need for both synchronous and asynchronous pre-processing.
             *
             * The interceptors are service factories that are registered with the `$sailsSocketProvider` by
             * adding them to the `$sailsSocketProvider.interceptors` array. The factory is called and
             * injected with dependencies (if specified) and returns the interceptor.
             *
             * There are two kinds of interceptors (and two kinds of rejection interceptors):
             *
             *   * `request`: interceptors get called with http `config` object. The function is free to
             *     modify the `config` or create a new one. The function needs to return the `config`
             *     directly or as a promise.
             *   * `requestError`: interceptor gets called when a previous interceptor threw an error or
             *     resolved with a rejection.
             *   * `response`: interceptors get called with http `response` object. The function is free to
             *     modify the `response` or create a new one. The function needs to return the `response`
             *     directly or as a promise.
             *   * `responseError`: interceptor gets called when a previous interceptor threw an error or
             *     resolved with a rejection.
             *
             *
             * ```js
             *   // register the interceptor as a service
             *   $provide.factory('myHttpInterceptor', function($q, dependency1, dependency2) {
     *     return {
     *       // optional method
     *       'request': function(config) {
     *         // do something on success
     *         return config || $q.when(config);
     *       },
     *
     *       // optional method
     *      'requestError': function(rejection) {
     *         // do something on error
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       },
     *
     *
     *
     *       // optional method
     *       'response': function(response) {
     *         // do something on success
     *         return response || $q.when(response);
     *       },
     *
     *       // optional method
     *      'responseError': function(rejection) {
     *         // do something on error
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       }
     *     };
     *   });
             *
             *   $sailsSocketProvider.interceptors.push('mySocketInterceptor');
             *
             *
             *   // alternatively, register the interceptor via an anonymous factory
             *   $sailsSocketProvider.interceptors.push(function($q, dependency1, dependency2) {
     *     return {
     *      'request': function(config) {
     *          // same as above
     *       },
     *
     *       'response': function(response) {
     *          // same as above
     *       }
     *     };
     *   });

             *
             *
             * @param {object} config Object describing the request to be made and how it should be
             *    processed. The object has following properties:
             *
             *    - **method** – `{string}` – HTTP method (e.g. 'GET', 'POST', etc)
             *    - **url** – `{string}` – Absolute or relative URL of the resource that is being requested.
             *    - **params** – `{Object.<string|Object>}` – Map of strings or objects which will be turned
             *      to `?key1=value1&key2=value2` after the url. If the value is not a string, it will be
             *      JSONified.
             *    - **data** – `{string|Object}` – Data to be sent as the request message data.
             *    - **headers** – `{Object}` – Map of strings or functions which return strings representing
             *      HTTP headers to send to the server. If the return value of a function is null, the
             *      header will not be sent.
             *    - **xsrfHeaderName** – `{string}` – Name of HTTP header to populate with the XSRF token.
             *    - **xsrfCookieName** – `{string}` – Name of cookie containing the XSRF token.
             *    - **transformRequest** –
             *      `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
             *      transform function or an array of such functions. The transform function takes the http
             *      request body and headers and returns its transformed (typically serialized) version.
             *    - **transformResponse** –
             *      `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
             *      transform function or an array of such functions. The transform function takes the http
             *      response body and headers and returns its transformed (typically deserialized) version.
             *    - **cache** – `{boolean|Cache}` – If true, a default $sailsSocket cache will be used to cache the
             *      GET request, otherwise if a cache instance built with
             *      $cacheFactory, this cache will be used for
             *      caching.
             *    - **timeout** – `{number|Promise}` – timeout in milliseconds, or a promise
             *      that should abort the request when resolved.
             *    - **withCredentials** - `{boolean}` - whether to to set the `withCredentials` flag on the
             *      XHR object. See [requests with credentials]https://developer.mozilla.org/en/http_access_control#section_5
             *      for more information.
             *    - **responseType** - `{string}` - see
             *      [requestType](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType).
             *
             * @returns {Promise} Returns a promise object with the
             *   standard `then` method and two http specific methods: `success` and `error`. The `then`
             *   method takes two arguments a success and an error callback which will be called with a
             *   response object. The `success` and `error` methods take a single argument - a function that
             *   will be called when the request succeeds or fails respectively. The arguments passed into
             *   these functions are destructured representation of the response object passed into the
             *   `then` method. The response object has these properties:
             *
             *   - **data** – `{string|Object}` – The response body transformed with the transform
             *     functions.
             *   - **status** – `{number}` – HTTP status code of the response.
             *   - **headers** – `{function([headerName])}` – Header getter function.
             *   - **config** – `{Object}` – The configuration object that was used to generate the request.
             *   - **statusText** – `{string}` – HTTP status text of the response.
             *
             * @property {Array.<Object>} pendingRequests Array of config objects for currently pending
             *   requests. This is primarily meant to be used for debugging purposes.
             *

             */

            function $sailsSocket(requestConfig) {
                var config = {
                    method: 'get',
                    transformRequest: defaults.transformRequest,
                    transformResponse: defaults.transformResponse
                };
                var headers = mergeHeaders(requestConfig);

                angular.extend(config, requestConfig);
                config.headers = headers;
                config.method = uppercase(config.method);

                var xsrfValue = urlIsSameOrigin(config.url)
                    ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName]
                    : undefined;
                if (xsrfValue) {
                    headers[(config.xsrfHeaderName || defaults.xsrfHeaderName)] = xsrfValue;
                }


                var serverRequest = function(config) {
                    headers = config.headers;
                    var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);

                    // strip content-type if data is undefined
                    if (isUndefined(config.data)) {
                        forEach(headers, function(value, header) {
                            if (lowercase(header) === 'content-type') {
                                delete headers[header];
                            }
                        });
                    }

                    if (isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials)) {
                        config.withCredentials = defaults.withCredentials;
                    }

                    // send request
                    return sendReq(config, reqData, headers).then(transformResponse, transformResponse);
                };

                var chain = [serverRequest, undefined];
                var promise = $q.when(config);

                // apply interceptors
                forEach(reversedInterceptors, function(interceptor) {
                    if (interceptor.request || interceptor.requestError) {
                        chain.unshift(interceptor.request, interceptor.requestError);
                    }
                    if (interceptor.response || interceptor.responseError) {
                        chain.push(interceptor.response, interceptor.responseError);
                    }
                });

                while(chain.length) {
                    var thenFn = chain.shift();
                    var rejectFn = chain.shift();

                    promise = promise.then(thenFn, rejectFn);
                }

                promise.success = function(fn) {
                    promise.then(function(response) {
                        fn(response.data, response.status, response.headers, config);
                    });
                    return promise;
                };

                promise.error = function(fn) {
                    promise.then(null, function(response) {
                        fn(response.data, response.status, response.headers, config);
                    });
                    return promise;
                };

                return promise;

                function transformResponse(response) {
                    // make a copy since the response must be cacheable
                    var resp = angular.extend({}, response, {
                        data: transformData(response.data, response.headers, config.transformResponse)
                    });
                    return (isSuccess(response.status))
                        ? resp
                        : $q.reject(resp);
                }

                function mergeHeaders(config) {
                    var defHeaders = defaults.headers,
                        reqHeaders = angular.extend({}, config.headers),
                        defHeaderName, lowercaseDefHeaderName, reqHeaderName;

                    defHeaders = angular.extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

                    // execute if header value is function
                    execHeaders(defHeaders);
                    execHeaders(reqHeaders);

                    // using for-in instead of forEach to avoid unecessary iteration after header has been found
                    defaultHeadersIteration:
                        for (defHeaderName in defHeaders) {
                            lowercaseDefHeaderName = lowercase(defHeaderName);

                            for (reqHeaderName in reqHeaders) {
                                if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                                    continue defaultHeadersIteration;
                                }
                            }

                            reqHeaders[defHeaderName] = defHeaders[defHeaderName];
                        }

                    return reqHeaders;

                    function execHeaders(headers) {
                        var headerContent;

                        forEach(headers, function(headerFn, header) {
                            if (isFunction(headerFn)) {
                                headerContent = headerFn();
                                if (headerContent != null) {
                                    headers[header] = headerContent;
                                } else {
                                    delete headers[header];
                                }
                            }
                        });
                    }
                }
            }

            $sailsSocket.pendingRequests = [];

            /**
             * @ngdoc method
             * @name $sailsSocket#get
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `GET` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#delete
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `DELETE` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#head
             * @methodOf ngsails.$sailsSocket
             *
             *
             * @description
             * Shortcut method to perform `HEAD` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#subscribe
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Low-level method to register handlers for socket.io events.
             *
             * @param {string} eventName Name of server-emitted event to listen for.
             *
             * @param {Function} eventHandler Method to fire when event is recieved.
             *
             */
            createShortMethods('get', 'delete', 'head');

            /**
             * @ngdoc method
             * @name $sailsSocket#post
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `POST` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {*} data Request content
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#put
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `PUT` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {*} data Request content
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#on
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Subscribes to an incoming socket event
             *
             * @param {string} event socket event name to listen for.
             * @param {function} callback listener function
             * @returns {HttpPromise} Future object
             */

            $sailsSocket.subscribe = $sailsSocketBackend.subscribe;



            createShortMethodsWithData('post', 'put');

            /**
             * @ngdoc property
             * @name $sailsSocket#defaults
             * @propertyOf ngsails.$sailsSocket
             *
             *
             * @description
             * Runtime equivalent of the `$sailsSocketProvider.defaults` property. Allows configuration of
             * default headers, withCredentials as well as request and response transformations.
             *
             * See "Setting HTTP Headers" and "Transforming Requests and Responses" sections above.
             */
            $sailsSocket.defaults = defaults;



            return $sailsSocket;


            function createShortMethods(names) {
                angular.forEach(arguments, function(name) {
                    $sailsSocket[name] = function(url, config) {
                        return $sailsSocket(angular.extend(config || {}, {
                            method: name,
                            url: url
                        }));
                    };
                });
            }


            function createShortMethodsWithData(name) {
                angular.forEach(arguments, function(name) {
                    $sailsSocket[name] = function(url, data, config) {
                        return $sailsSocket(angular.extend(config || {}, {
                            method: name,
                            url: url,
                            data: data
                        }));
                    };
                });
            }


            /**
             * Makes the request.
             *
              */
            function sendReq(config, reqData, reqHeaders) {
                var deferred = $q.defer(),
                    promise = deferred.promise,
                    cache,
                    cachedResp,
                    url = buildUrl(config.url, config.params);

                $sailsSocket.pendingRequests.push(config);
                promise.then(removePendingReq, removePendingReq);


                if ((config.cache || defaults.cache) && config.cache !== false && config.method == 'GET') {
                    cache = isObject(config.cache) ? config.cache
                        : isObject(defaults.cache) ? defaults.cache
                        : defaultCache;
                }

                if (cache) {
                    cachedResp = cache.get(url);
                    if (isDefined(cachedResp)) {
                        if (cachedResp.then) {
                            // cached request has already been sent, but there is no response yet
                            cachedResp.then(removePendingReq, removePendingReq);
                            return cachedResp;
                        } else {
                            // serving from cache
                            if (isArray(cachedResp)) {
                                resolvePromise(cachedResp[1], cachedResp[0], angular.copy(cachedResp[2]), cachedResp[3]);
                            } else {
                                resolvePromise(cachedResp, 200, {}, 'OK');
                            }
                        }
                    } else {
                        // put the promise for the non-transformed response into cache as a placeholder
                        cache.put(url, promise);
                    }
                }

                // if we won't have the response in cache, send the request to the backend
                if (angular.isUndefined(cachedResp)) {
                    $sailsSocketBackend(config.method, url, reqData, done, reqHeaders, config.timeout,
                        config.withCredentials, config.responseType);
                }

                return promise;


                /**
                 * Callback registered to $sailsSocketBackend():
                 *  - caches the response if desired
                 *  - resolves the raw $sailsSocket promise
                 *  - calls $apply
                 */
                function done(status, response, headersString, statusText) {
                    if (cache) {
                        if (isSuccess(status)) {
                            cache.put(url, [status, response, parseHeaders(headersString), statusText]);
                        } else {
                            // remove promise from the cache
                            cache.remove(url);
                        }
                    }

                    resolvePromise(response, status, headersString, statusText);
                    if (!$rootScope.$$phase) $rootScope.$apply();
                }


                /**
                 * Resolves the raw $sailsSocket promise.
                 */
                function resolvePromise(response, status, headers, statusText) {
                    // normalize internal statuses to 0
                    status = Math.max(status, 0);

                    (isSuccess(status) ? deferred.resolve : deferred.reject)({
                        data: response,
                        status: status,
                        headers: headersGetter(headers),
                        config: config,
                        statusText : statusText
                    });
                }


                function removePendingReq() {
                    var idx = indexOf($sailsSocket.pendingRequests, config);
                    if (idx !== -1) $sailsSocket.pendingRequests.splice(idx, 1);
                }
            }


            function buildUrl(url, params) {
                if (!params) return url;
                var parts = [];
                forEachSorted(params, function(value, key) {
                    if (value === null || isUndefined(value)) return;
                    if (!isArray(value)) value = [value];

                    angular.forEach(value, function(v) {
                        if (isObject(v)) {
                            v = toJson(v);
                        }
                        parts.push(encodeUriQuery(key) + '=' +
                            encodeUriQuery(v));
                    });
                });
                if(parts.length > 0) {
                    url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
                }
                return url;
            }


        }];
}

angular.module('sails.io', []).provider('$sailsSocket',$sailsSocketProvider).provider('$sailsSocketBackend',sailsBackendProvider);
'use strict';

function createSailsBackend($browser, $window, $injector, $q, $timeout){




    if(!$window.io){
        throw new Error('socket.io client not found')
    }

    if(!$window.io.sails){
        throw new Error('sails.io client not found')
    }

    if(!$window.io.socket){
        console.warn('no connected socket...')
    }


    var tick = function (socket, callback) {
        return callback ? function () {
            var args = arguments;
            $timeout(function () {
                callback.apply(socket, args);
            }, 0);
        } : angular.noop;
    };


    function connection(method, url, post, callback, headers, timeout, withCredentials, responseType){



        function socketResponse(body,jwr){

            callback(jwr.statusCode,body);
           // callback(jwr.statusCode,body);
            //status, response, headersString, statusText
        }


        url = url || $browser.url();


        $window.io.socket[method.toLowerCase()](url,fromJson(post),socketResponse);

    }

    //TODO normalize http paths to event names
    connection.subscribe = function(event,handler){
        $window.io.socket.on(event,tick($window.io.socket,handler));
    }

    return connection;

}

/**
 * @ngdoc service
 * @name ngsails.$sailsSocketBackend
 * @requires $window
 * @requires $document
 *
 * @description
 * Service used by the $sailsSocket that delegates to a
 * Socket.io connection (or in theory, any connection type eventually)
 *
 * You should never need to use this service directly, instead use the higher-level abstractions:
 * $sailsSocket or $sailsResource.
 *
 * During testing this implementation is swapped with $sailsMockBackend
 *  which can be trained with responses.
 */
function sailsBackendProvider() {
    this.$get = ['$browser', '$window','$injector', '$q','$timeout', function($browser, $window, $injector, $q,$timeout) {
        return createSailsBackend($browser,$window, $injector, $q,$timeout);
    }];
}



'use strict';
// NOTE:  The usage of window and document instead of $window and $document here is
// deliberate.  This service depends on the specific behavior of anchor nodes created by the
// browser (resolving and parsing URLs) that is unlikely to be provided by mock objects and
// cause us to break tests.  In addition, when the browser resolves a URL for XHR, it
// doesn't know about mocked locations and resolves URLs to the real document - which is
// exactly the behavior needed here.  There is little value is mocking these out for this
// service.
var urlParsingNode = document.createElement("a");
var originUrl = urlResolve(window.location.href, true);

/**
 * Chain all given functions
 *
 * This function is used for both request and response transforming
 *
 * @param {*} data Data to transform.
 * @param {function(string=)} headers Http headers getter fn.
 * @param {(Function|Array.<Function>)} fns Function or an array of functions.
 * @returns {*} Transformed data.
 */
function transformData(data, headers, fns) {
    if (isFunction(fns))
        return fns(data, headers);

    forEach(fns, function(fn) {
        data = fn(data, headers);
    });

    return data;
}


function isSuccess(status) {
    return 200 <= status && status < 300;
}


/**
 * Parse headers into key value object
 *
 * @param {string} headers Raw headers as a string
 * @returns {Object} Parsed headers as key value object
 */
function parseHeaders(headers) {
    var parsed = {}, key, val, i;

    if (!headers) return parsed;

    forEach(headers.split('\n'), function(line) {
        i = line.indexOf(':');
        key = lowercase(trim(line.substr(0, i)));
        val = trim(line.substr(i + 1));

        if (key) {
            if (parsed[key]) {
                parsed[key] += ', ' + val;
            } else {
                parsed[key] = val;
            }
        }
    });

    return parsed;
}
/**
 * Returns a function that provides access to parsed headers.
 *
 * Headers are lazy parsed when first requested.
 * @see parseHeaders
 *
 * @param {(string|Object)} headers Headers to provide access to.
 * @returns {function(string=)} Returns a getter function which if called with:
 *
 *   - if called with single an argument returns a single header value or null
 *   - if called with no arguments returns an object containing all headers.
 */
function headersGetter(headers) {
    var headersObj = isObject(headers) ? headers : undefined;

    return function(name) {
        if (!headersObj) headersObj =  parseHeaders(headers);

        if (name) {
            return headersObj[lowercase(name)] || null;
        }

        return headersObj;
    };
}

function urlResolve(url, base) {
    var href = url;

    if (typeof msie !== 'undefined') {
        // Normalize before parse.  Refer Implementation Notes on why this is
        // done in two steps on IE.
        urlParsingNode.setAttribute("href", href);
        href = urlParsingNode.href;
    }

    urlParsingNode.setAttribute('href', href);

    // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
    return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/')
            ? urlParsingNode.pathname
            : '/' + urlParsingNode.pathname
    };
}

/**
 * Parse a request URL and determine whether this is a same-origin request as the application document.
 *
 * @param {string|object} requestUrl The url of the request as a string that will be resolved
 * or a parsed URL object.
 * @returns {boolean} Whether the request is for the same origin as the application document.
 */
function urlIsSameOrigin(requestUrl) {
    var parsed = (isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl;
    return (parsed.protocol === originUrl.protocol &&
        parsed.host === originUrl.host);
}

function buildUrl(url, params) {
    if (!params) return url;
    var parts = [];
    angular.forEach(params, function(value, key) {
        if (value === null || angular.isUndefined(value)) return;
        if (!isArray(value)) value = [value];

        angular.forEach(value, function(v) {
            if (isObject(v)) {
                v = toJson(v);
            }
            parts.push(encodeUriQuery(key) + '=' +
                encodeUriQuery(v));
        });
    });
    if(parts.length > 0) {
        url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
    }
    return url;
}
/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
    return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
}


function toJsonReplacer(key, value) {
    var val = value;

    if (typeof key === 'string' && key.charAt(0) === '$') {
        val = undefined;
    } else if (isWindow(value)) {
        val = '$WINDOW';
    } else if (value &&  document === value) {
        val = '$DOCUMENT';
    } else if (isScope(value)) {
        val = '$SCOPE';
    }

    return val;
}

function forEach(obj, iterator, context) {
    var key;
    if (obj) {
        if (isFunction(obj)){
            for (key in obj) {
                // Need to check if hasOwnProperty exists,
                // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else if (isArrayLike(obj)) {
            for (key = 0; key < obj.length; key++)
                iterator.call(context, obj[key], key);
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
}

function sortedKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys.sort();
}

function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for ( var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
}


/**
 * when using forEach the params are value, key, but it is often useful to have key, value.
 * @param {function(string, *)} iteratorFn
 * @returns {function(*, string)}
 */
function reverseParams(iteratorFn) {
    return function(value, key) { iteratorFn(key, value); };
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}


function valueFn(value) {return function() {return value;};}


function isUndefined(value){return typeof value === 'undefined';}


function isDefined(value){return typeof value !== 'undefined';}
function isObject(value){return value != null && typeof value === 'object';}
function isString(value){return typeof value === 'string';}
function isNumber(value){return typeof value === 'number';}
function isDate(value){
    return toString.call(value) === '[object Date]';
}
function isFunction(value){return typeof value === 'function';}

function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
}
function isFile(obj) {
    return toString.call(obj) === '[object File]';
}


function isBlob(obj) {
    return toString.call(obj) === '[object Blob]';
}


function isBoolean(value) {
    return typeof value === 'boolean';
}

function isArray(value) {
    return toString.call(value) === '[object Array]';
}


/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) {
        return false;
    }

    var length = obj.length;

    if (obj.nodeType === 1 && length) {
        return true;
    }

    return isString(obj) || isArray(obj) || length === 0 ||
        typeof length === 'number' && length > 0 && (length - 1) in obj;
}

function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

var lowercase = function(string){return isString(string) ? string.toLowerCase() : string;};
var hasOwnProperty = Object.prototype.hasOwnProperty;

function mergeHeaders(config) {
    var defHeaders = defaults.headers,
        reqHeaders = extend({}, config.headers),
        defHeaderName, lowercaseDefHeaderName, reqHeaderName;

    defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

    // execute if header value is function
    execHeaders(defHeaders);
    execHeaders(reqHeaders);

    // using for-in instead of forEach to avoid unecessary iteration after header has been found
    defaultHeadersIteration:
        for (defHeaderName in defHeaders) {
            lowercaseDefHeaderName = lowercase(defHeaderName);

            for (reqHeaderName in reqHeaders) {
                if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                    continue defaultHeadersIteration;
                }
            }

            reqHeaders[defHeaderName] = defHeaders[defHeaderName];
        }

    return reqHeaders;

    function execHeaders(headers) {
        var headerContent;

        forEach(headers, function(headerFn, header) {
            if (isFunction(headerFn)) {
                headerContent = headerFn();
                if (headerContent != null) {
                    headers[header] = headerContent;
                } else {
                    delete headers[header];
                }
            }
        });
    }
}

var uppercase = function(string){return isString(string) ? string.toUpperCase() : string;};


var manualLowercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
        : s;
};
var manualUppercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
        : s;
};


// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives.
if ('i' !== 'I'.toLowerCase()) {
    lowercase = manualLowercase;
    uppercase = manualUppercase;
}

function toJson(obj, pretty) {
    if (typeof obj === 'undefined') return undefined;
    return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
}



function fromJson(json) {
    return isString(json)
        ? JSON.parse(json)
        : json;
}

function size(obj, ownPropsOnly) {
    var count = 0, key;

    if (isArray(obj) || isString(obj)) {
        return obj.length;
    } else if (isObject(obj)){
        for (key in obj)
            if (!ownPropsOnly || obj.hasOwnProperty(key))
                count++;
    }

    return count;
}


function includes(array, obj) {
    return indexOf(array, obj) != -1;
}

function indexOf(array, obj) {
    if (array.indexOf) return array.indexOf(obj);

    for (var i = 0; i < array.length; i++) {
        if (obj === array[i]) return i;
    }
    return -1;
}

function arrayRemove(array, value) {
    var index = indexOf(array, value);
    if (index >=0)
        array.splice(index, 1);
    return value;
}

