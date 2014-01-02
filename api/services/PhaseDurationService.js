/**
 * /api/services/PhaseDurationService.js
 *
 * Phase duration service.
 */
"use strict";

var async = require("async");
var moment = require("moment-timezone");

/**
 * Method to write task phase duration data to database.
 *
 * @param   {sails.model.task}  task    Task object
 */
exports.write = function(task) {
    /**
     * Fetch needed data for phase duration write. Basically we need following data:
     *  - Phase data of current task
     *  - Latest duration row
     *
     * Those are fetched parallel and after that
     */
    async.parallel(
        {
            /**
             * Fetch task phase data.
             *
             * @param   {Function}  callback    Function to call after job is done.
             */
            phase: function(callback) {
                DataService.getPhase(task.phaseId, callback);
            },

            /**
             * Job to fetch latest "open" phase duration row.
             *
             * @param   {Function}  callback    Function to call after job is done.
             */
            current: function(callback) {
                PhaseDuration
                    .findOne()
                    .where({
                        taskId: task.id,
                        open: true
                    })
                    .sort("id DESC")
                    .done(callback);
            }
        },

        /**
         * Main callback function which is called after all parallel jobs are done.
         *
         * @param   {Error|null}    error
         * @param   {{}}            data
         */
        function(error, data) {
            if (error) {
                sails.log.error(error);
            } else {
                // We have existing row AND task phase is changed, so close existing duration row
                if (data.current && data.current.phaseId !== task.phaseId) {
                    durationEnd(data.current);
                }

                // New phase is not yet "done" and duration data not yet exist OR task phase is changed => create new row
                if (!data.phase.isDone && (!data.current || data.current.phaseId !== task.phaseId)) {
                    durationStart();
                }
            }
        }
    );

    /**
     * Private function to start new task duration. This will just
     * add new row to 'PhaseDuration' table with current task data.
     */
    function durationStart() {
        PhaseDuration
            .create({
                taskId: task.id,
                phaseId: task.phaseId,
                timeStart: new Date()
            })
            .done(function(error, row) {
                if (error) {
                    sails.log.error(error);
                }
            });
    }

    /**
     * Private function to end specified task duration row.
     *
     * @param   {{}}    current
     */
    function durationEnd(current) {
        // Set required data for updated object
        current.open = false;
        current.timeEnd = new Date();
        current.duration = moment(current.timeEnd).diff(current.timeStartObject(), "seconds");

        // Save object
        current.save(function(error) {
            if (error) {
                sails.log.error(error);
            }
        });
    }
};

/**
 * Method to remove existing phase duration rows.
 *
 * @param   {{}}    where   Where conditions
 */
exports.remove = function(where) {
    PhaseDuration
        .destroy(where)
        .done(function(error, data) {
            if (error) {
                sails.log.error(error);
            }
        });
};