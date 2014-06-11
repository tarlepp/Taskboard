/**
 * Taskboard application access level constant definitions. These are used to to
 * restrict access to certain routes in application.
 *
 * Note that actual access level check is done against currently logged in user.
 */
(function() {
    'use strict';

    angular.module('Taskboard')
        .constant('AccessLevels', {
            anon: 0,
            user: 1,
            admin: 2
        });
}());
