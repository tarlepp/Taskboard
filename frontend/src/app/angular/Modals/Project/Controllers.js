/**
 * This file contains controller definitions for project modals. These controllers are for
 * following use cases:
 *  1) Project edit
 *  2) Project add
 */
(function() {
    'use strict';

    angular.module('Taskboard.controllers')
        .controller('ModalProjectEditController',
            [
                '$scope', '$modalInstance',
                '_',
                'toastr',
                'CurrentUser', 'ModalService',
                'TabConfig', 'TabInit',
                'ProjectModel',
                '_project',
                function($scope, $modalInstance,
                         _,
                         toastr,
                         CurrentUser, ModalService,
                         TabConfig, TabInit,
                         ProjectModel,
                         _project
                ) {
                    // Specify some default scope parameters
                    $scope._project = _project;
                    $scope.currentUser = CurrentUser.user();
                    $scope.modalService = ModalService;
                    $scope.objectName = 'project';
                    $scope.objectId = $scope._project.id;

                    // Specify tabs
                    $scope.tabs = TabConfig.projectEdit();

                    // Set calendar open scope to false by default, these are changed on 'openCalendar' function
                    $scope.opened = {
                        dateStart: false,
                        dateEnd: false
                    };

                    // Specify form objects
                    $scope.form = {
                        projectBasic: {},
                        projectSprintSettings: {}
                    };

                    /**
                     * Function which is triggered whenever user activates tab on user profile
                     * modal. This will check if current tab has init function defined, and if
                     * it has function will trigger that automatic.
                     *
                     * @param   {helpers.tabConfig} tab
                     */
                    $scope.selectTab = function(tab) {
                        $scope.activeTab = tab;

                        TabInit.init(tab);
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
                        });
                    };

                    // Function to close current modal
                    $scope.close = function() {
                        $modalInstance.close();
                    };

                    // Function to reset current project form
                    $scope.reset = function() {
                        $scope.project = angular.copy($scope._project);
                    };

                    /**
                     * Function to save current project data to database.
                     *
                     * @param   {boolean}   [close]
                     */
                    $scope.save = function(close) {
                        close = close || false;

                        $scope.$broadcast('show-errors-check-validity');

                        // Yeah we have valid form
                        if ($scope.form.projectBasic.$valid &&
                            $scope.form.projectSprintSettings.$valid
                        ) {
                            $scope.saving = true;

                            // Update current project object
                            ProjectModel
                                .update($scope.project.id, $scope.project)
                                .then(function(response) {
                                    $scope._project = response.data;

                                    $scope.reset();

                                    toastr.success('Project data updated successfully.');

                                    $scope.saving = false;
                                });

                            if (close) {
                                $scope.close();
                            }
                        } else {
                            console.log('validation error');
                        }
                    };

                    // Watcher for user object to track form changes
                    $scope.$watch('project', function(valueNew) {
                        $scope.formChanged = !_.isEqual(valueNew, $scope._project);
                    }, true);

                    $scope.reset();
                }
            ]
        );
}());
