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

                            var words = _.filter(filters.searchWord.split(' '));

                            if (columns.length > 0 && words.length > 0) {
                                var conditions = [];

                                for (var i = 0; i < words.length; i++) {
                                    (function(index) {
                                        var conditionOr = _.map(columns, function(column) {
                                            var condition = {};

                                            condition[column.column] = {
                                                contains: words[index]
                                            };

                                            return condition;
                                        });

                                        conditions.push({or: conditionOr});
                                    })(i);
                                }

                                output.and = conditions;
                            }

                            return output;
                        }
                    };
                }
            ]
        );
}());
