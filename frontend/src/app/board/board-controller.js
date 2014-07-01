(function() {
    'use strict';

    angular.module('Taskboard.controllers')
        .controller('BoardController',
            [
                '$scope', '$state',
                'CurrentUser', 'Auth', 'SharedData',
                function($scope, $state,
                         CurrentUser, Auth, SharedData
                ) {
                    $scope.sharedData = SharedData.data;
                    $scope.user = CurrentUser.user;
                    $scope.auth = Auth;
                }
            ]
        );
}());