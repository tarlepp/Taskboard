/**
 * Generic shared data service for Taskboard application. Application uses following values to
 * make all work together with nested controllers. So basically these values are set in some
 * controller and then used in multiple other controllers:
 *
 *  - projectId
 *  - sprintId
 *
 * @todo    Figure out storage service usage for these
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('SharedData',
            [
                function() {
                    var shared = {};

                    shared.data = {
                        projectId: 0,
                        sprintId: 0
                    };

                    return shared;
                }
            ]
        );
}());
