/**
 * This file contains controller definitions for user modals. These controllers are for
 * following use cases:
 *  1) User profile edit
 *  2) User profile add
 *  3) Users list, just for admin users
 */
(function() {
    'use strict';

    /**
     * Controller for user profile which is shown on modal. This controller needs following data
     * to be resolved before usage:
     *
     *  1)  user, either current user or specified user object
     *  2)  timezones, Promise of TimeZone factory .get() method
     *  3)  languages, Promise of Language factory .get() method
     *
     * Modal will contain all information about specified user, all of those are shown on our tabs
     * on modal. Data which is shown is following:
     *
     *  1)  Basic (user basic data)
     *  2)  Language and region
     *  3)  Password change
     *  4)  Projects where user is in some role
     *  5)  Activity log (what user has done lately)
     *  6)  Login history
     *  7)  User object history
     */
    angular.module('Taskboard.controllers')
        .controller('ModalUserProfileController',
            [
                '$scope', '$interval', '$modalInstance',
                '_', 'toastr', 'moment',
                'Auth', 'CurrentUser',
                'UserModel',
                'TabConfig', 'TabInit',
                '_user', '_timezones', '_languages',
                function($scope, $interval, $modalInstance,
                         _, toastr, moment,
                         Auth, CurrentUser,
                         UserModel,
                         TabConfig, TabInit,
                         _user, _timezones, _languages
                ) {
                    // Init necessary scope attributes
                    $scope.auth = Auth;
                    $scope.languages = _languages;
                    $scope.timezones = _timezones;
                    $scope.objectName = 'User';
                    $scope.objectId = _user.id;
                    $scope.passwordNew = '';
                    $scope.passwordCheck = '';
                    $scope.form = {
                        userBasic: {},
                        userLanguageRegion: {},
                        userSettings: {}
                    };

                    $scope.saving = false;

                    // Specify tabs
                    $scope.tabs = TabConfig.userProfile();

                    $scope.tabRefreshTimeFormat = function(value) {
                        value = parseInt(value, 10);

                        return (value === 0 || _.isNaN(value)) ? 'Always' : value + 's';
                    };

                    // Function to reset current form data
                    $scope.reset = function() {
                        $scope.user = angular.copy(_user);
                    };

                    // Modal close, within this we need to reset current update interval
                    $scope.close = function() {
                        $interval.cancel($scope.timeUpdate);

                        $modalInstance.close();
                    };

                    /**
                     * Function to save current user data to database and update user data
                     * in CurrentUser service.
                     *
                     * @param   {boolean}   [close]
                     */
                    $scope.save = function(close) {
                        close = close || false;

                        $scope.$broadcast('show-errors-check-validity');

                        if ($scope.form.userBasic.$valid &&
                            $scope.form.userLanguageRegion.$valid &&
                            $scope.form.userSettings.$valid
                        ) {
                            $scope.saving = true;

                            UserModel
                                .update($scope.user.id, $scope.user)
                                .then(function(response) {
                                    _user = response.data;

                                    CurrentUser.update(_user);

                                    $scope.reset();
                                    $scope.$broadcast('data-updated');

                                    toastr.success('User data updated successfully.');

                                    $scope.saving = false;
                                });

                            if (close) {
                                $scope.close();
                            }
                        } else {
                            console.log('validation error');
                        }
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

                    // Watcher for user object to track form changes
                    $scope.$watch('user', function(valueNew) {
                        $scope.formChanged = !_.isEqual(valueNew, _user);
                    }, true);

                    // Whenever user changes language selection, we need to update current times
                    $scope.$watch('user.language', function(valueNew) {
                        moment.locale(valueNew);

                        updateTimes();
                    }, true);

                    // Whenever user changes timezone selection, we need to update current times
                    $scope.$watch('user.momentTimezone', function() {
                        updateTimes();
                    }, true);

                    // Initialize update interval
                    $scope.timeUpdate = $interval(updateTimes, 1000);

                    /**
                     * Simple helper function to update shown date and times on form,
                     * this function is called within one second interval.
                     */
                    function updateTimes() {
                        // Create new UTC time
                        var now = moment().utc().tz($scope.user.momentTimezone);

                        $scope.momentDate = now.format($scope.user.momentFormatDate);
                        $scope.momentTime = now.format($scope.user.momentFormatTime);
                        $scope.momentDateTime = now.format($scope.user.momentFormatDateTime);
                    }

                    // Initialize modal
                    $scope.reset();
                }
            ]
        );
}());
