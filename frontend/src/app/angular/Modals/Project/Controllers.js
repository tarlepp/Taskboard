/**
 * This file contains controller definitions for project modals. These controllers are for
 * following use cases:
 *  1) Project edit
 *  2) Project add
 */
(function() {
    'use strict';

    /**
     * todo make this happen!
     */
    angular.module('Taskboard.controllers')
        .controller('ModalProjectEditController',
            [
                '$scope', '$modalInstance',
                '_', 'CurrentUser', 'Message', 'ModalService',
                '_project',
                function($scope, $modalInstance,
                         _, CurrentUser, Message, ModalService,
                         _project
                ) {
                    $scope.currentUser = CurrentUser.user();
                    $scope.modalService = ModalService;

                    $scope.close = function() {
                        $modalInstance.close();
                    };

                    $scope.reset = function() {
                        $scope.project = angular.copy(_project);
                    };

                    $scope.reset();
                }
            ]
        );
}());
