/**
 * Generic helper service to wrap some generic functionality to injectable
 * angular service that can be used everywhere on application.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('HelperService',
            [
                '$timeout',
                function($timeout) {
                    return {
                        /**
                         * Select picker refresh service method.
                         *
                         * @param   {String}    selector    Selector name for select component
                         * @param   {Number}    [timeout]   Timeout value
                         */
                        refreshSelectPicker: function(selector, timeout) {
                            timeout = timeout || 0;

                            $timeout(function() {
                                angular.element(selector).selectpicker('refresh');
                            }, timeout);
                        }
                    };
                }
            ]
        );
}());
