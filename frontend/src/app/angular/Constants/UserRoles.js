/**
 * Taskboard application user roles constant definitions. These will affect actual
 * project specified rights that current user has in selected project.
 *
 * These are project specified values to all users. Note that if user access level is
 * admin (2) he / she has automatic full access to all projects.
 */
(function() {
    'use strict';

    angular.module('Taskboard')
        .constant('UserRoles', {
            viewer: 0,
            user: 1,
            manager: 2
        });
}());
