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
                '_',
                'toastr',
                'CurrentUser', 'ModalService',
                'TabConfig',
                '_project', '_sprints',
                function($scope, $modalInstance,
                         _,
                         toastr,
                         CurrentUser, ModalService,
                         TabConfig,
                         _project, _sprints
                ) {
                    $scope.currentUser = CurrentUser.user();
                    $scope.modalService = ModalService;
                    $scope.sprints = _sprints;

                    // Specify tabs
                    $scope.tabs = TabConfig.projectEdit();

                    // Set calendar open scope to false by default, these are changed on 'openCalendar' function
                    $scope.opened = {
                        dateStart: false,
                        dateEnd: false
                    };

                    /**
                     * Function to toggle calendar, note that this will also close another calendars
                     * if those are opened atm.
                     *
                     * @param   {Event}     $event  Dom event
                     * @param   {string}    name    Calendar name
                     */
                    $scope.openCalendar = function($event, name) {
                        $event.preventDefault();
                        $event.stopPropagation();

                        $scope.opened[name] = !$scope.opened[name];

                        _.each($scope.opened, function(value, key) {
                            if (key !== name) {
                                $scope.opened[key] = false;
                            }
                        })
                    };

                    // Function to close current modal
                    $scope.close = function() {
                        $modalInstance.close();
                    };

                    // Function to reset current project form
                    $scope.reset = function() {
                        $scope.project = angular.copy(_project);
                    };

                    $scope.reset();
                }
            ]
        );
}());
