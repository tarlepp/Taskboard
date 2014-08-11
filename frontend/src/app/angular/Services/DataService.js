/**
 * Generic data service to interact with Sails.js backend.
 *
 * @todo Add support for generic POST, PUT and DELETE
 * @todo Do we need to check that BackendConfig.url is set
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('DataService',
            [
                '$q', '$sailsSocket', '_', 'BackendConfig',
                function($q, $sailsSocket, _, BackendConfig) {
                    /**
                     * Helper function to get "proper" end point url for sails backend API.
                     *
                     * @param   {string}    endPoint    Name of the end point
                     * @param   {number}    identifier  Identifier of endpoint object
                     *
                     * @returns {string}
                     */
                    function parseEndPointUrl(endPoint, identifier) {
                        if (!_.isUndefined(identifier)) {
                            endPoint = endPoint + '/' + identifier;
                        }

                        return BackendConfig.url + '/' + endPoint;
                    }

                    /**
                     * Helper function to parse used parameters in 'get' and 'count' methods.
                     *
                     * @param   {{}}    parameters  Used query parameters
                     *
                     * @returns {{params: {}}}
                     */
                    function parseParameters(parameters) {
                        parameters = parameters || {};

                        return {params: parameters};
                    }

                    return {
                        /**
                         * Service method to get count of certain end point objects.
                         *
                         * @param   {string}    endPoint    Name of the end point
                         * @param   {{}}        parameters  Used query parameters
                         *
                         * @returns {Promise|*}
                         */
                        count: function(endPoint, parameters) {
                            parameters = parameters || {};

                            return $sailsSocket.get(parseEndPointUrl(endPoint) + '/count/', parseParameters(parameters));
                        },

                        /**
                         * Service method to get data from certain end point. This will always return a collection
                         * of data.
                         *
                         * @param   {string}    endPoint    Name of the end point
                         * @param   {{}}        parameters  Used query parameters
                         *
                         * @returns {Promise|*}
                         */
                        collection: function(endPoint, parameters) {
                            parameters = parameters || {};

                            return $sailsSocket.get(parseEndPointUrl(endPoint), parseParameters(parameters));
                        },

                        /**
                         * Service method to get data from certain end point. This will return just a one
                         * record as an object.
                         *
                         * @param   {string}    endPoint    Name of the end point
                         * @param   {number}    identifier  Identifier of endpoint object
                         * @param   {{}}        parameters  Used query parameters
                         *
                         * @returns {Promise|*}
                         */
                        fetch: function(endPoint, identifier, parameters) {
                            parameters = parameters || {};

                            return $sailsSocket.get(parseEndPointUrl(endPoint, identifier), parseParameters(parameters));
                        },

                        /**
                         * Service method to update specified end point object.
                         *
                         * @param   {string}    endPoint    Name of the end point
                         * @param   {number}    identifier  Identifier of endpoint object
                         * @param   {{}}        data        Data to update
                         * @returns {Promise|*}
                         */
                        update: function(endPoint, identifier, data) {
                            return $sailsSocket.post(parseEndPointUrl(endPoint, identifier), data);
                        }
                    };
                }
            ]
        );
}());