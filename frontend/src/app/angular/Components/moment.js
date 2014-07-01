/**
 * Angular service to inject moment.js to your angular.js application the angular way.
 *
 *  http://momentjs.com/
 *
 * Usage example in controller:
 *
 *  angular
 *      .module('app')
 *      .controller('SomeController',
 *          [
 *              '$scope', 'Moment',
 *              function ($scope, moment) {
 *                  $scope.time = moment();
 *                  $scope.timePast = moment([2007, 0, 29]).fromNow();
 *              }
 *          ]
 *      );
 *
 * With this you can use moment.js library easily in your controllers with angular way.
 */
(function() {
    'use strict';

    angular.module('Taskboard.components')
        .factory('moment',
            [
                '$window',
                function($window) {
                    return $window.moment;
                }
            ]
        );
}());