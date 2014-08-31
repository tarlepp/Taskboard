/**
 * Service to create bootstrap modals that TaskBoard application uses widely. All application
 * modals are created by this service.
 *
 * Naming of service methods must follow structure below:
 *  {modelName}{actionName}
 *
 * Where
 *  modelName   = Name of the model that modal covers, eg. project, user, story
 *  actionName  = Modal action this is one of following 'Edit', 'View' or 'Create'
 *
 * Currently this service has following modals:
 *  1) userProfile(userId)
 *  2) projectEdit(projectId)
 *
 * Also note that this service handles modal queue handling, so that latest opened modal
 * is automatic opened when user closes current one.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('ModalService',
            [
                '$modal',
                'ModalQueue',
                'TimeZoneModel', 'LanguageModel', 'UserModel', 'ProjectModel',
                function($modal,
                         ModalQueue,
                         TimeZoneModel, LanguageModel, UserModel, ProjectModel
                ) {
                    var service = this;

                    /**
                     * Initializer function for all modal instances, this will take care of modal
                     * queue handling so whenever user closes current modal it will automatically
                     * open previous one.
                     *
                     * @param   {bootstrap.modalInstance}   modalInstance
                     * @param   {string}                    method
                     * @param   {*[]}                       parameters
                     *
                     * @returns {bootstrap.modalInstance}
                     */
                    var initializeModalInstance = function(modalInstance, method, parameters) {
                        // Whenever modal is opened add it to modal queue
                        modalInstance.opened.then(function() {
                            ModalQueue.set(modalInstance, method, parameters);
                        });

                        // Whenever modal is closed check if we need to open previous one
                        modalInstance.result.then(function(openPreviousModal) {
                            if (openPreviousModal !== false) {
                                var previous = ModalQueue.get();

                                // Yeah we have previous modal so open it again
                                if (previous) {
                                    service[previous.method].apply(service, previous.parameters);
                                }
                            }
                        });

                        return modalInstance;
                    };

                    /**
                     * Returns user profile modal instance. This modal contains following user
                     * specified data:
                     *  - Basic information
                     *  - Language and region
                     *  - Password change
                     *  - User projects
                     *  - Activity log
                     *  - Login history
                     *  - Object history
                     *
                     * If given, modal resolve will determine if current user is admin or not
                     * and if not => show error and do not open modal.
                     *
                     * @param   {number}    userId  User id
                     *
                     * @returns {bootstrap.modalInstance}
                     */
                    service.userProfile = function(userId) {
                        var modalInstance = $modal
                            .open({
                                controller: 'ModalUserProfileController',
                                templateUrl: '/Taskboard/partials/Modals/UserProfile/profile.html',
                                backdrop: 'static',
                                size: 'lg',
                                resolve: {
                                    _user: function() {
                                        return UserModel.fetch(userId);
                                    },
                                    _timezones: function() {
                                        return TimeZoneModel.get();
                                    },
                                    _languages: function() {
                                        return LanguageModel.get();
                                    }
                                }
                            });

                        return initializeModalInstance(modalInstance, 'userProfile', [userId]);
                    };

                    /**
                     * Returns project edit modal instance. This modal contains following project
                     * specified data:
                     *  - Basic information
                     *  - Sprints
                     *  - Milestones
                     *  - Epics
                     *  - Users
                     *  - Object history
                     *
                     * @param   {number}    projectId   Project id
                     *
                     * @returns {bootstrap.modalInstance}
                     */
                    service.projectEdit = function(projectId) {
                        var modalInstance = $modal
                            .open({
                                controller: 'ModalProjectEditController',
                                templateUrl: '/Taskboard/partials/Modals/Project/edit.html',
                                backdrop: 'static',
                                size: 'lg',
                                resolve: {
                                    _project: function() {
                                        return ProjectModel.fetch(projectId);
                                    }
                                }
                            });

                        return initializeModalInstance(modalInstance, 'projectEdit', [projectId]);
                    };

                    return service;
                }
            ]
        );
}());