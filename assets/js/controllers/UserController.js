'use strict';

angular.module('TaskBoardControllers')
    .controller('UserController',
        [
            '$scope', '$rootScope', '$modalInstance', '$sailsSocket', '$interval', 'user', 'timezones',
            function($scope, $rootScope, $modalInstance, $sailsSocket, $interval, user, timezones) {
                $scope.languages = [
                    {id: 'en', name: 'English'},
                    {id: 'fi', name: 'Suomi'}
                ];
                $scope.timezones = timezones;
                $scope.form = {};

                $scope.tabs = [
                    {
                        title: 'Basic',
                        template: 'user/profile_basic',
                        buttonSet: 'main',
                        form: 'userBasic'
                    },
                    {
                        title: 'Language and region',
                        template: 'user/profile_language_and_region',
                        buttonSet: 'main',
                        form: 'userLanguageRegion'
                    },
                    {
                        title: 'Change password',
                        template: 'user/profile_change_password',
                        buttonSet: 'password',
                        form: 'userPassword'
                    },
                    {
                        title: 'Projects',
                        template: 'user/profile_projects',
                        buttonSet: ''
                    },
                    {
                        title: 'Sign in history',
                        template: 'user/profile_sign_in_history'
                    },
                    {
                        title: '<i class="fa fa-clock-o"></i> History',
                        template: 'common/object_history',
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
                        console.log("validation error");
                    }

                    if (close) {
                        $scope.close();
                    }
                };

                $scope.$watch('user', function(valueNew, valueOld) {
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

                $scope.passwordNew = "";
                $scope.passwordCheck = "";

                $scope.reset();
            }
        ]
    );