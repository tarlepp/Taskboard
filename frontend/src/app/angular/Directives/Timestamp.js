/**
 * Generic timestamp directive which shows specified timestamp / datetime value in
 * user specified format. Also directive adds tooltip to that formatted value which
 * shows detailed information about specified timestamp / datetime value.
 *
 * Usage example:
 *
 *  <timestamp data-stamp="{{item.stamp}}"></timestamp>
 *
 * Note that all stamp values should be in UTC time.
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('timestamp', function() {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    stamp: '@'
                },
                templateUrl: '/Taskboard/partials/Directives/Timestamp.html',
                controller: [
                    '$scope', 'CurrentUser', 'TimeZone', 'moment', 'rfc4122', '_',
                    function($scope, CurrentUser, TimeZone, moment, rfc4122, _) {
                        $scope.id = rfc4122.v4();
                        $scope.user = CurrentUser.user();
                        $scope.stampObject = moment($scope.stamp);
                        $scope.stampObjectUtc = moment($scope.stamp).utc();

                        TimeZone
                            .get()
                            .then(function(response) {
                                $scope.timezones = response.data;

                                $scope.userTimezone = _.find($scope.timezones, function(timezone) {
                                    return timezone.id === $scope.user.momentTimezone;
                                });
                            });
                    }
                ]
            };
        });
}());
