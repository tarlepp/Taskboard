/**
 * Directive to render specified object history data. This is used commonly within
 * every 'objects' edit modal. Usage example:
 *
 *  <object-history
 *      data-object-name="{{objectName}}"
 *      data-object-id="{{objectId}}"
 *  ></object-history>
 *
 * Where,
 *
 *  objectName  = Name of the object, eg. User, Project, etc.
 *  objectId    = ID of the object.
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('objectHistory',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        objectId: '@',
                        objectName: '@'
                    },
                    replace: true,
                    templateUrl: '/Taskboard/partials/Directives/Components/ObjectHistory.html',
                    controller: [
                        '$scope', '$sailsSocket',
                        '_', 'SocketWhereCondition', 'BackendConfig',
                        'CurrentUser',
                        function($scope, $sailsSocket,
                                 _, SocketWhereCondition, BackendConfig,
                                 CurrentUser
                        ) {
                            $scope.user = CurrentUser.user();
                            $scope.items = [];

                            $scope.loadData = function() {
                                $scope.loading = true;
                                $scope.loaded = false;

                                var parameters = {
                                    objectId: $scope.objectId,
                                    objectName: $scope.objectName
                                };

                                $sailsSocket
                                    .get(BackendConfig.url + '/history/formattedHistory', {params: parameters})
                                    .then(function(response) {
                                        $scope.loading = false;
                                        $scope.loaded = true;

                                        $scope.items = response.data;
                                    }, function() {
                                        $scope.loading = false;
                                        $scope.loaded = true;
                                    });
                            };

                            $scope.loadData();
                        }
                    ]
                };
            }
        );
}());
