/**
 * Simple service to return configuration for generic list. This service contains only
 * getter methods that all list views uses in Taskboard application.
 *
 * So generally you change these getter methods and changes are affected to all list
 * views on application
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('ListConfig', function() {
            return {
                /**
                 * Getter method for list default settings.
                 *
                 * @returns {services.ListConfig.getDefault}
                 */
                getDefault: function() {
                    return {
                        itemCount: 0,
                        items: [],
                        itemsPerPage: 10,
                        currentPage: 1,
                        where: {},
                        loading: true,
                        loaded: false
                    };
                }
            };
        });
}());