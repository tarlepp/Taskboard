/**
 * Service for bootstrap modal instances.
 *
 * Currently this service has following modals:
 *
 *  userProfile(userId), where userId is not required
 *
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('ModalService',
            [
                '$modal', '$q',
                '_',
                'CurrentUser', 'Auth', 'Message',
                function($modal, $q,
                         _,
                         CurrentUser, Auth, Message
                ) {
                    return {
                        /**
                         * Returns user profile modal instance. This modal contains following user
                         * specified data:
                         *
                         *  - Basic information
                         *  - Language and region
                         *  - Password change
                         *  - User projects
                         *  - Activity log
                         *  - Login history
                         *  - Object history
                         *
                         * Note that 'userId' parameter is not required, if not given we will open
                         * modal with current user data on it.
                         *
                         * If given, modal resolve will determine if current user is admin or not
                         * and if not => show error and do not open modal.
                         *
                         * @param   {null|integer}  userId
                         *
                         * @returns {*}
                         */
                        userProfile: function(userId) {
                            return $modal.open({
                                controller: 'ModalUserProfileController',
                                templateUrl: '/Taskboard/partials/Modals/UserProfile/profile.html',
                                backdrop: 'static',
                                size: 'lg',
                                resolve: {
                                    user: function() {
                                        var currentUser = CurrentUser.user();

                                        if (_.isUndefined(userId) || userId === currentUser.id) {
                                            return angular.copy(currentUser);
                                        } else {
                                            // todo
                                            return {};
                                        }
                                    },
                                    timezones: function() {
                                        // todo
                                        return [];
                                    },
                                    languages: function() {
                                        // todo
                                        return [];
                                    }
                                }
                            });
                        }
                    };
                }
            ]
        );
}());