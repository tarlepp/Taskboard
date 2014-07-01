/**
 * Angular service to inject noty to your angular.js application.
 *
 *  - http://ned.im/noty/
 *
 * Usage example in controller:
 *
 *  angular
 *      .module('app')
 *      .controller('SomeController',
 *          [
 *              '$scope', 'Noty',
 *              function ($scope, Noty) {
 *                  noty({text: 'some message here'});
 *              }
 *          ]
 *      );
 *
 * With this you can use noty library easily in your controllers with angular way.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('Noty',
            [
                '$window',
                function($window) {
                    return $window.noty;
                }
            ]
        );
}());
