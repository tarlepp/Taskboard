/**
 * Simple angular service to parse search filters for socket queries. Usage example:
 *
 *  $sailsSocket
 *      .get("/Project/", {
 *          params: {
 *              where: SocketWhereCondition.get($scope.filters)
 *          }
 *      })
 *      .success(function(response) {
 *          // Do your data handling here
 *      })
 *      .error(function(response) {
 *          // Do your error handling here
 *      })
 *
 * @todo add more complex parameter handling
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('SocketWhereCondition',
            [
                '_',
                function(_) {
                    return {
                        get: function(filters, defaults) {
                            var output = defaults || {};

                            // Get search columns
                            var columns = _.filter(filters.columns, function(column) {
                                return column.inSearch;
                            });

                            // Yeah we have some columns and search word so add OR condition to output
                            if (columns.length > 0 && filters.searchWord !== '') {
                                output.or = _.map(columns, function(column) {
                                    var temp = {};

                                    temp[column.column] = {
                                        contains: filters.searchWord
                                    };

                                    return temp;
                                });
                            }

                            return output;
                        }
                    };
                }
            ]
        );
}());
