/**
 * Service for tab configurations. About all modals contains some tabs, so those
 * configurations are located here.
 *
 * @todo translations
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('TabConfig',
            [
                '_',
                function(_) {
                    return {
                        /**
                         * Tab configurations for user profile modal
                         *
                         * @returns {helpers.tabConfig[]}
                         */
                        userProfile: function() {
                            return [
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
                                    title: 'Settings',
                                    template: 'Modals/UserProfile/profile_settings',
                                    buttonSet: 'main',
                                    form: 'userSettings'
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
                                    hasInit: '#user-projects'
                                },
                                {
                                    title: 'Activity',
                                    template: 'Modals/UserProfile/profile_activity',
                                    hasInit: '#activity-log'
                                },
                                {
                                    title: 'Login history',
                                    template: 'Modals/UserProfile/profile_login_history',
                                    hasInit: '#login-history'
                                }
                            ].concat(this._objectHistory());
                        },
                        /**
                         * Tab configurations for project edit modal
                         *
                         * @returns {helpers.tabConfig[]}
                         */
                        projectEdit: function() {
                            return [
                                {
                                    title: 'Basic',
                                    template: 'Modals/Project/basic',
                                    buttonSet: 'main',
                                    form: 'projectBasic'
                                },
                                {
                                    title: 'Sprint settings',
                                    template: 'Modals/Project/settings',
                                    buttonSet: 'main',
                                    form: 'projectBasic'
                                },
                                {
                                    title: 'Backlog',
                                    template: 'Modals/Project/backlog',
                                    buttonSet: ''
                                },
                                {
                                    title: 'Sprints',
                                    template: 'Modals/Project/sprints',
                                    buttonSet: ''
                                },
                                {
                                    title: 'Milestones',
                                    template: 'Modals/Project/milestones',
                                    buttonSet: ''
                                },
                                {
                                    title: 'Epics',
                                    template: 'Modals/Project/epics',
                                    buttonSet: ''
                                },
                                {
                                    title: 'Users',
                                    template: 'Modals/Project/users',
                                    buttonSet: ''
                                }
                            ].concat(this._objectHistory());
                        },

                        /**
                         * Private methods starts here, these are called inside this service
                         * and nowhere else.
                         */

                        /**
                         * Generic object history tab, which is added to every tab configuration.
                         *
                         * @returns {helpers.tabConfig[]}
                         * @private
                         */
                        _objectHistory: function() {
                            return [
                                {
                                    title: '<i class="fa fa-clock-o"></i> History',
                                    template: 'Common/object_history',
                                    class: 'pull-right',
                                    hasInit: '#object-history'
                                }
                            ];
                        }
                    };
                }
            ]
        );
}());
