/**
 * HistoryController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require("jquery");
var JsonDiffPatch = require("jsondiffpatch");
var moment = require("moment-timezone");
var async = require("async");

module.exports = {
    /**
     * Main history action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    index: function(req, res) {
        var objectId = req.param("objectId");
        var objectName = req.param("objectName");
        var data = [];

        // Fetch history rows
        History
            .find()
            .where({
                objectName: objectName,
                objectId: objectId
            })
            .sort("id ASC")
            .done(function(error, data) {
                var histories = [];

                // Remove duplicate rows
                _.each(data, function(row, key) {
                    if (key === 0
                        || row.objectData !== data[key - 1].objectData
                        || row.message !== data[key - 1].message
                    ) {
                        histories.push(row);
                    }
                });

                // Process history data
                processHistoryData2(histories);
            });

        var index = 0;

        function processHistoryData2(histories) {
            async.map(
                histories,
                function(history, callback) {
                    var dateObject = DateService.convertDateObjectToUtc(history.createdAt);

                    var historyRow = {
                        message: (data.length === 0) ? "Object created" : history.message,
                        stamp: dateObject.tz(req.user.momentTimezone),
                        data: []
                    };

                    // Determine previous and current rows as JSON objects
                    var currentRow = JSON.parse(history.objectData);
                    var previousRow = {};

                    // We have a previous row data defined
                    if (!_.isUndefined(histories[index - 1].objectData)) {
                        previousRow = JSON.parse(histories[index - 1].objectData);
                    }

                    // Iterate ignore values of history data and delete those from current and previous history rows
                    _.each(sails.config.history.ignoreValues, function(value) {
                        delete previousRow[value];
                        delete currentRow[value];
                    });

                    // Calculate object difference to previous one
                    var difference = JsonDiffPatch.diff(previousRow, currentRow);

                    index++;

                    // We have no difference
                    if (_.isUndefined(difference)) {

                    } else { // Yeah some difference found...
                        _.each(difference, function(column, value) {

                        });
                    }
                },
                function(error, results) {
                }
            )
        }

        /**
         * Function process history data and fetches possible relation data
         * from models.
         *
         * Please note that this function is very complicated so be very
         * carefully when you change this functionality - good luck.
         *
         * @param   {sails.helper.history[]}  histories
         */
        function processHistoryData(histories) {
            var dataCount = histories.length;

            // First call makeView, this is needed for objects that have no history
            makeView();

            // Iterate history data
            jQuery.each(histories, function(key, history) {
                var dateObject = DateService.convertDateObjectToUtc(history.createdAt);

                var historyRow = {
                    stamp: dateObject.tz(req.user.momentTimezone),
                    data: []
                };

                // First record, assume that object is created at this point
                if (key === 0) {
                    historyRow.message = "Object created";

                    var currentRow = JSON.parse(history.objectData);

                    // Iterate ignore values of history data and delete those from current and previous history rows
                    _.each(sails.config.history.ignoreValues, function(value) {
                        delete currentRow[value];
                    });

                    jQuery.each(currentRow, function(column, value) {
                    // Parent id setted, so this is relation to object itself
                    if (column.match(/parentId$/) !== null) {
                        object = objectName;

                        // Only fetch possible relation data if change type is insert or update
                        if (global[object] && typeof global[object] === "object") {
                            // Fetch new value
                            global[object]
                                .findOne(value)
                                .done(function(error, objectData) {
                                    historyRow.data.push({
                                        column: column,
                                        columnType: "columnType",
                                        changeType: "changeType",
                                        valueNew: "valueNew",
                                        valueOld: "valueOld",
                                        valueIdOld: "valueIdOld",
                                        valueIdNew: "valueIdNew"
                                    });

                                    data.push(historyRow);

                                    makeView();
                                });
                        }
                    } else {
                        data.push(historyRow);

                        makeView();
                    }
                    });
                } else { // Otherwise we have some object data updated
                    if (history.message) {
                        historyRow.message = history.message;
                    }

                    // Determine previous and current rows as JSON objects
                    var previousRow = JSON.parse(histories[key - 1].objectData);
                    var currentRow = JSON.parse(history.objectData);

                    // Iterate ignore values of history data and delete those from current and previous history rows
                    _.each(sails.config.history.ignoreValues, function(value) {
                        delete previousRow[value];
                        delete currentRow[value];
                    });

                    // Calculate object difference to previous one
                    var difference = JsonDiffPatch.diff(previousRow, currentRow);

                    // No difference between objects
                    if (typeof difference == "undefined") {
                        dataCount--;

                        makeView();
                    } else { // Otherwise make data row
                        var changeCount = _.size(difference);

                        // Iterate each difference
                        jQuery.each(difference, function(column, value) {
                            var valueOld    = false;
                            var objectIdOld = false;
                            var valueNew    = false;
                            var objectIdNew = false;
                            var columnType  = false;
                            var changeType  = '';

                            if (value.length === 3) {
                                changeType = "delete";
                            } else if (value.length == 2) {
                                changeType = "update";

                                valueOld    = value[0];
                                objectIdOld = value[0];
                                valueNew    = value[1];
                                objectIdNew = value[1];
                            } else {
                                changeType = "insert";

                                valueNew    = value[0];
                                objectIdNew = value[0];
                            }

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
                            if (column.match(/Id$/) !== null) {
                                var object = column.charAt(0).toUpperCase() + column.slice(1, -2);

                                // In project object managerId refers to User object
                                if (object == "Manager") {
                                    object = "User";
                                }

                                columnType = 'relation';

                                // Parent id setted, so this is relation to object itself
                                if (column.match(/parentId$/) !== null) {
                                    object = objectName;
                                }

                                // Only fetch possible relation data if change type is insert or update
                                if (global[object] && typeof global[object] === "object" && changeType != 'delete') {
                                    // Fetch new value
                                    global[object]
                                        .findOne(objectIdNew)
                                        .done(function(error, objectData) {
                                            // Store real new value
                                            valueNew = (!objectData) ? "none" : objectData.objectTitle();

                                            // Fetch old value only in update
                                            if (changeType == 'update') {
                                                // Fetch old value
                                                global[object]
                                                    .findOne(objectIdOld)
                                                    .done(function(error, objectData) {
                                                        // Store real old value
                                                        valueOld = (!objectData) ? "none" : objectData.objectTitle();

                                                        // Make necessary checks if we can show page or not
                                                        checkData();
                                                    });
                                            } else {
                                                checkData();
                                            }
                                        });
                                } else {
                                    checkData();
                                }
                            } else { // No relation
                                // Determine column type
                                if (valueOld === true && valueNew === false
                                    || valueOld === false && valueNew === true
                                ) {
                                    columnType = 'boolean';
                                } else {
                                    columnType = 'normal';
                                }

                                checkData();
                            }

                            /**
                             * Private function to check that we have processed all required
                             * data for view.
                             *
                             * This function is called x times in this action.
                             */
                            function checkData() {
                                var ready = false;

                                // Add data to history row object
                                historyRow.data.push({
                                    column: column,
                                    columnType: columnType,
                                    changeType: changeType,
                                    valueNew: valueNew,
                                    valueOld: valueOld,
                                    valueIdOld: objectIdOld,
                                    valueIdNew: objectIdNew
                                });

                                // Check if have processed all required rows
                                if (changeCount == historyRow.data.length) {
                                    ready = true;

                                    // Add data to view object
                                    data.push(historyRow);
                                }

                                if (ready) {
                                    makeView();
                                }
                            }
                        });
                    }
                }
            });

            /**
             * This function will make actual view to client.
             */
            function makeView() {
                var ready = data.length === dataCount;

                // We're ready to show some stuff
                if (ready) {
                    // Data sorting function
                    function sortByStamp(a, b) {
                        if (a.stamp < b.stamp)
                            return 1;
                        if (a.stamp > b.stamp)
                            return -1;
                        return 0;
                    }

                    // Sort data
                    data.sort(sortByStamp);

                    // Make view
                    res.view({
                        layout: req.isAjax ? "layout_ajax" : "layout",
                        data: data
                    });
                }
            }
        }
    }
};
