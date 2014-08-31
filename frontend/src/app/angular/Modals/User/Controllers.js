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
     *
     * @todo    Move tabs configuration to service
     */
    angular.module('Taskboard.controllers')
        .controller('ModalUserProfileController',
            [
                '$scope', '$interval', '$modalInstance',
                'Auth', 'moment', '_', 'CurrentUser', 'Message',
                'UserModel',
                '_user', '_timezones', '_languages',
                function($scope, $interval, $modalInstance,
                         Auth, moment, _, CurrentUser, Message,
                         UserModel,
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
                        userLanguageRegion: {}
                    };

                    // Specify tabs
                    $scope.tabs = [
                        {
                            title: 'Basic',
                            template: 'Modals/UserProfile/profile_basic',
                            buttonSet: 'main',
                            form: 'userBasic'
                        },
                        {
                            title: 'Language and region',
                            template: 'Modals/UserProfile/profile_language_and_region',
                            buttonSet: 'main',
                            form: 'userLanguageRegion'
                        },
                        {
                            title: 'Change password',
                            template: 'Modals/UserProfile/profile_change_password',
                            buttonSet: 'password',
                            form: 'userPassword'
                        },
                        {
                            title: 'Projects',
                            template: 'Modals/UserProfile/profile_projects',
                            buttonSet: ''
                        },
                        {
                            title: 'Activity',
                            template: 'Modals/UserProfile/profile_activity',
                            buttonSet: ''
                        },
                        {
                            title: 'Login history',
                            template: 'Modals/UserProfile/profile_login_history'
                        },
                        {
                            title: '<i class="fa fa-clock-o"></i> History',
                            template: 'Common/object_history',
                            class: 'pull-right',
                            buttonSet: ''
                        }
                    ];

                    $scope.reset = function() {
                        $scope.user = angular.copy(_user);
                    };

                    $scope.close = function() {
                        $interval.cancel($scope.timeUpdate);

                        $modalInstance.close();
                    };

                    $scope.save = function(close) {
                        close = close || false;

                        $scope.$broadcast('show-errors-check-validity');

                        if ($scope.form.userBasic.$valid && $scope.form.userLanguageRegion.$valid) {
                            UserModel
                                .update($scope.user.id, $scope.user)
                                .then(function(response) {
                                    _user = response.data;

                                    CurrentUser.update(_user);

                                    $scope.reset();
                                    $scope.$broadcast('data-updated');

                                    Message.success('User data updated successfully.');
                                });

                            if (close) {
                                $scope.close();
                            }
                        } else {
                            console.log('validation error');
                        }
                    };

                    $scope.selectTab = function(tab) {
                        $scope.activeTab = tab;

                        if (tab.onSelect) {
                            $scope[tab.onSelect]();
                        }
                    };

                    $scope.$watch('user', function(valueNew) {
                        $scope.formChanged = !_.isEqual(valueNew, _user);
                    }, true);

                    $scope.$watch('user.language', function(valueNew) {
                        moment.lang(valueNew);

                        updateTimes();
                    }, true);

                    $scope.$watch('user.momentTimezone', function() {
                        updateTimes();
                    }, true);

                    $scope.timeUpdate = $interval(updateTimes, 1000);

                    function updateTimes() {
                        // Create new UTC time
                        var now = moment().utc().tz($scope.user.momentTimezone);

                        $scope.momentDate = now.format($scope.user.momentFormatDate);
                        $scope.momentTime = now.format($scope.user.momentFormatTime);
                        $scope.momentDateTime = now.format($scope.user.momentFormatDateTime);
                    }

                    $scope.reset();
                }
            ]
        );
}());
