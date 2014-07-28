'use strict';

var _ = require('lodash');
var JsonDiffPatch = require('jsondiffpatch');
var async = require('async');

/**
 * HistoryController
 *
 * @description :: Server-side logic for managing Histories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    /**
     * Main history action. This will render a GUI which will show specified object
     * history data. Actual history data is calculated from database data on each object.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    formattedHistory: function(request, response) {
        var objectId = request.param('objectId');
        var objectName = request.param('objectName');

        History
            .find()
            .where({
                objectName: objectName,
                objectId: objectId
            })
            .populate('user')
            .sort('createdAt ASC')
            .exec(function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    var historyRows = [];

                    // Remove duplicate rows
                    _.each(data, function(row, key) {
                        if (key === 0
                            || row.message && !data[key - 1].message
                            || row.objectData !== data[key - 1].objectData
                            || row.message !== data[key - 1].message
                        ) {
                            historyRows.push(row);
                        }
                    });

                    // Process history data
                    processHistoryData(historyRows);
                }
            });

        /**
         * Function process history rows for specified object.
         *
         * @param   {sails.model.history[]} historyRows
         */
        function processHistoryData(historyRows) {
            var index = 0;

            // Map all history rows to sub-methods
            async.map(
                historyRows,

                /**
                 * Iterator function to process all history rows for specified object. Note that this
                 * function will call sub-functions to handle specified data of each history rows and
                 * those functions will eventually call this callback function.
                 *
                 * @param   {sails.model.history}   historyRow  Single history row data as an object
                 * @param   {Function}              callback    Callback function to call after row is processed
                 */
                function(historyRow, callback) {
                    var dateObject = DateService.convertDateObjectToUtc(historyRow.createdAt);

                    // Create main data array which contains all necessary data for this history row
                    var historyData = {
                        message: historyRow.message,
                        index: index,
                        stamp: dateObject,
                        user: historyRow.user,
                        data: []
                    };

                    // Determine previous and current rows as JSON objects
                    var currentRow = JSON.parse(historyRow.objectData);
                    var previousRow = {};

                    // We have a previous row data defined
                    if (!_.isUndefined(historyRows[index - 1])) {
                        previousRow = JSON.parse(historyRows[index - 1].objectData);
                    }

                    // Iterate ignore values of history data and delete those from current and previous history rows
                    _.each(sails.config.history.ignoreValues, function(value) {
                        delete previousRow[value];
                        delete currentRow[value];
                    });

                    // Calculate object difference to previous one
                    var difference = JsonDiffPatch.diff(previousRow, currentRow);

                    index++;

                    // We have no difference so just call callback function with no parameters
                    if (historyRow.message) {
                        callback(null, historyData);
                    } else if (_.isUndefined(difference)) {
                        callback(null, null);
                    } else { // Yeah some difference found...
                        var differenceArray = [];

                        // Firstly convert difference object to simple array
                        _.each(difference, function(value, column) {
                            differenceArray.push({
                                column: column,
                                value: value
                            });
                        });

                        // Process single history row
                        processHistoryRow(differenceArray, historyData, callback);
                    }
                },

                /**
                 * Main callback function which is called after _all_ specified jobs are done. Basically
                 * this function just shows pages if no error(s) occurred while processing data.
                 *
                 * @param   {null|Error}    error
                 * @param   {Array}         results
                 */
                function(error, results) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        response.json(_.compact(results).reverse());
                    }
                }
            );
        }

        /**
         * Function to process single history row data. Basically this function just maps all
         * differences and make specified data processing for single column (data attribute).
         *
         * @param   {{}[]}                      differences Current row differences as an array of objects
         * @param   {sails.helper.historyRow}   historyRow  History row data
         * @param   {Function}                  next        Callback function to call after row is processed
         */
        function processHistoryRow(differences, historyRow, next) {
            // Map all differences
            async.map(
                differences,

                /**
                 * Iterator function to process single difference data in one history row. Note that this
                 * function will call sub-function to handle specified difference handling. That function
                 * will eventually call this callback function.
                 *
                 * @param   {sails.helper.historyDifference}    difference  Difference data
                 * @param   {Function}                          callback    Callback function to call after differences are processed
                 */
                function(difference, callback) {
                    var valueOld    = false;
                    var valueIdOld  = false;
                    var valueNew    = false;
                    var valueIdNew  = false;
                    var columnType  = false;
                    var changeType  = '';

                    // On the first row skip all but parentId column
                    if (historyRow.index === 0 && difference.column !== 'parentId') {
                        callback(null, null);
                    } else {
                        if (difference.value.length === 3) {
                            changeType = 'delete';
                        } else if (difference.value.length == 2) {
                            changeType  = 'update';
                            valueOld    = difference.value[0];
                            valueIdOld  = difference.value[0];
                            valueNew    = difference.value[1];
                            valueIdNew  = difference.value[1];
                        } else {
                            changeType = 'insert';
                            valueNew   = difference.value[0];
                            valueIdNew = difference.value[0];
                        }

                        var differenceData = {
                            column:     difference.column,
                            columnType: columnType,
                            changeType: changeType,
                            valueNew:   valueNew,
                            valueOld:   valueOld,
                            valueIdOld: valueIdOld,
                            valueIdNew: valueIdNew
                        };

                        processHistoryRowColumn(differenceData, callback);
                    }
                },

                /**
                 * Callback function for single history row process which is called after all
                 * difference data for current history row is processed.
                 *
                 * Note that this callback will call main callback.
                 *
                 * @param   {Error}                         error   Possible error
                 * @param   {sails.helper.historyRowData[]} results History row data as an array
                 */
                function(error, results) {
                    // Store history row data
                    historyRow.data = _.groupBy(_.compact(results), function(result) {
                        return result.changeType;
                    });

                    next(error, historyRow);
                }
            );
        }

        /**
         * Private function to process single column data on history row.
         *
         * @param   {sails.helper.historyRowData}   data    Single column data
         * @param   {Function}                      next    Callback function to call after column is processed
         */
        function processHistoryRowColumn(data, next) {
            /**
             * Magic happens here, we can assume that attributes which ends with 'Id'
             * strings are actual relations to another models.
             *
             * In these cases we want to fetch actual text values for changed old and
             * new values.
             *
             * Note that fetching old and new value must be done at in same process
             * otherwise this doesn't work right.
             */
            if (data.column.match(/Id$/) !== null) {
                var object = data.column.charAt(0).toUpperCase() + data.column.slice(1, -2);

                // In project object managerId refers to User object
                if (object == 'Manager'
                    || object == 'CurrentUser'
                ) {
                    object = 'User';
                }

                data.columnType = 'relation';

                // Column is parentId, so this is relation to object itself
                if (data.column.match(/parentId$/) !== null) {
                    data.columnType = 'parent';

                    object = objectName;
                }

                // Only fetch possible relation data if change type is insert or update AND data object is present
                if (global[object] && typeof global[object] === 'object' && data.changeType != 'delete') {
                    // Fetch relation data for column
                    async.parallel(
                        {
                            // New value object data
                            dataNew: function(callback) {
                                if (data.valueIdNew) {
                                    global[object]
                                        .findOne(data.valueIdNew)
                                        .exec(function(error, objectData) {
                                            callback(error, objectData);
                                        });
                                } else {
                                    callback(null, false);
                                }
                            },

                            // New value object data
                            dataOld: function(callback) {
                                if (data.changeType == 'update' && data.valueIdOld) {
                                    global[object]
                                        .findOne(data.valueIdOld)
                                        .exec(function(error, objectData) {
                                            callback(error, objectData);
                                        });
                                } else {
                                    callback(null, false);
                                }
                            }
                        },

                        /**
                         * Callback function which is called after all specified parallel jobs are done.
                         *
                         * @param   {Error} error   Possible error
                         * @param   {{}}    results Actual data results
                         */
                        function(error, results) {
                            data.valueNew = (!results.dataNew) ? 'none' : results.dataNew.objectTitle();
                            data.valueOld = (!results.dataOld) ? 'none' : results.dataOld.objectTitle();

                            next(error, data);
                        }
                    );
                } else {
                    next(null, data);
                }
            } else { // No relation
                // Determine column type
                if ((data.valueOld === true && data.valueNew === false)
                    || (data.valueOld === false && data.valueNew === true)
                ) {
                    data.columnType = 'boolean';
                } else {
                    data.columnType = 'normal';
                }

                if (data.columnType == 'normal' && data.valueOld === false && !data.valueNew) {
                    next(null, null);
                } else {
                    next(null, data);
                }
            }
        }
    }
});
