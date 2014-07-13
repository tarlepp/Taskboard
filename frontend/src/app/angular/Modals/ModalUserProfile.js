/**
 * @todo    add docs
 */
(function() {
    'use strict';

    angular.module('Taskboard.controllers')
        .controller('ModalUserProfileController',
            [
                '$scope', '$interval', '$modalInstance',
                'Auth', 'moment', '_',
                'user', 'timezones', 'languages',
                function($scope, $interval, $modalInstance,
                         Auth, moment, _,
                         user, timezones, languages
                ) {
                    $scope.auth = Auth;
                    $scope.languages = languages;
                    $scope.timezones = timezones;
                    $scope.form = {};

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
                        $scope.user = angular.copy(user);
                    };

                    $scope.close = function() {
                        $interval.cancel($scope.timeUpdate);

                        $modalInstance.close();
                    };

                    $scope.save = function(close) {
                        close = close || false;

                        $scope.$broadcast('show-errors-check-validity');

                        if ($scope.form.userBasic.$valid && $scope.form.userLanguageRegion.$valid) {
                            console.log('implement data save');
                            console.log($scope.user);
                        } else {
                            console.log('validation error');
                        }

                        if (close) {
                            $scope.close();
                        }
                    };

                    $scope.$watch('user', function(valueNew) {
                        $scope.formChanged = !_.isEqual(valueNew, user);
                    }, true);

                    $scope.selectTab = function(tab) {
                        $scope.activeTab = tab;

                        if (tab.onSelect) {
                            $scope[tab.onSelect]();
                        }
                    };

                    $scope.timeUpdate = $interval(function() {
                        moment.lang($scope.user.language);

                        // Create new UTC time
                        var now = moment().utc();

                        $scope.momentDate = now.format($scope.user.momentFormatDate);
                        $scope.momentTime = now.format($scope.user.momentFormatTime);
                        $scope.momentDateTime = now.format($scope.user.momentFormatDateTime);
                    }, 1000);

                    $scope.passwordNew = '';
                    $scope.passwordCheck = '';

                    $scope.reset();
                }
            ]
        );
}());
