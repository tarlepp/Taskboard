/**
 * SprintController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var async = require("async");
var moment = require("moment-timezone");

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to SprintController)
     */
    _config: {},

    /**
     * Sprint add action. This will render a GUI where user can add new sprint to specified project.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    add: function(request, response) {
        var projectId = parseInt(request.param("projectId"), 10);

        response.view({
            projectId: projectId
        });
    },

    /**
     * Sprint edit action. This will render a GUI where user can edit specified sprint.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    edit: function(request, response) {
        var sprintId = parseInt(request.param("id"), 10);

        // Fetch sprint data for edit action
        async.parallel(
            {
                // Fetch single sprint data
                sprint: function(callback) {
                    DataService.getSprint(sprintId, callback);
                },

                // Determine user role in this sprint
                role: function(callback) {
                    AuthService.hasSprintAccess(request.user, sprintId, callback, true);
                }
            },

            /**
             * Callback function which is called after all specified parallel jobs are done.
             *
             * @param   {null|Error}    error   Error object
             * @param   {{
             *              sprint: sails.model.sprint,
             *              role: sails.helper.role
             *          }}              data    Object that contains sprint and role data
             */
            function (error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.view(data);
                }
            }
        );
    },

    /**
     * Sprint backlog action. This action will render a GUI where is listed all stories that are
     * attached to specified sprint. Within this GUI user can change stories priority, add/edit
     * those.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    backlog: function(request, response) {
        var sprintId = parseInt(request.param("id"), 10);

        // Initialize view data object
        var data = {
            stories: [],
            role: 0,
            sprint: {
                data: {},
                progressStory: 0,
                progressTask: 0,
                cntStoryDone: 0,
                cntStoryNotDone: 0,
                cntStoryTotal: 0,
                cntTaskDone: 0,
                cntTaskNotDone: 0,
                cntTaskTotal: 0
            }
        };

        // Fetch basic data for backlog action
        async.parallel(
            {
                // Fetch sprint data.
                sprint: function(callback) {
                    DataService.getSprint(sprintId, callback);
                },

                // Fetch sprint stories data.
                stories: function(callback) {
                    DataService.getStories({sprintId: sprintId}, callback);
                },

                // Determine user role in this sprint
                role: function(callback) {
                    AuthService.hasSprintAccess(request.user, sprintId, callback, true);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error   Error object
             * @param   {{
             *              sprint: sails.model.sprint,
             *              stories: sails.model.story[],
             *              role: sails.helper.role
             *          }}              result  Result object that contains 'sprint', 'stories' and 'role' data
             */
            function(error, result) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    // Store fetched data
                    data.sprint.data = result.sprint;
                    data.stories = result.stories;
                    data.role = result.role;

                    // Fetch phase data
                    fetchRelatedData();
                }
            }
        );

        /**
         * Private function to fetch all related data for sprint backlog GUI. Note that data in here are
         * depending on previously fetched data.
         *
         * After all jobs are done, function will render actual sprint backlog GUI for user.
         *
         * @return  void
         */
        function fetchRelatedData() {
            async.waterfall(
                [
                    // Fetch phase data
                    function(callback) {
                        DataService.getPhases({projectId: data.sprint.data.projectId}, function(error, phases) {
                            callback(error, phases);
                        });
                    },

                    // Fetch phase duration data
                    function(phases, callback) {
                        fetchPhaseDuration(phases, callback);
                    },

                    // Fetch task data
                    function(phases, callback) {
                        // Store phase data
                        data.phases = phases;

                        fetchTaskData(callback);
                    }
                ],

                /**
                 * Main callback which is called after all waterfall jobs are done, or error occurred
                 * while processing those.
                 *
                 * @param   {null|Error}            error
                 * @param   {sails.model.story[]}   stories
                 */
                function(error, stories) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        data.stories = stories;

                        // Make necessary statistics calculations.
                        calculateStatisticsData();

                        response.view(data);
                    }
                }
            );
        }

        /**
         * Private function to fetch sprint task phase duration times. This will sum tasks durations
         * for each phase in this sprint.
         *
         * @param   {sails.model.phase[]}   phases  Phase data
         * @param   {Function}              next    Callback function to call after job is done
         *
         * @return  void
         */
        function fetchPhaseDuration(phases, next) {
            async.map(
                phases,

                /**
                 * Function to determine duration in specified phase.
                 *
                 * @param   {sails.model.phase} phase
                 * @param   {Function}          callback
                 */
                function(phase, callback) {
                    var conditions = {
                        phaseId: phase.id,
                        sprintId: data.sprint.data.id
                    };

                    // Fetch sum of phase duration data
                    PhaseDuration
                        .find({sum: "duration"})
                        .where(conditions)
                        .done(function(error, result) {
                            if (error) {
                                callback(error, null);
                            } else {
                                phase.duration = result[0].duration ? result[0].duration : 0;

                                callback(null, phase);
                            }
                        });
                },

                /**
                 * Main callback function which is called after all phases are processed.
                 *
                 * @param   {null|Error}            error
                 * @param   {sails.model.phase[]}   phases
                 */
                function (error, phases) {
                    next(error, phases);
                }
            );
        }

        /**
         * Private function to fetch task data for each story in specified sprint.
         *
         * @param   {Function}  next    Callback function to call after job is done
         *
         * @return  void
         */
        function fetchTaskData(next) {
            // Map each sprint story and fetch task data of those
            async.map(
                data.stories,

                /**
                 * Iterator function which will fetch all tasks that are attached to current
                 * story and calculates some statistics data for story and sprint data.
                 *
                 * @param   {sails.model.story} story       Story object
                 * @param   {Function}          callback    Callback function to call after job is finished
                 */
                function(story, callback) {
                    DataService.getTasks({storyId: story.id}, function(error, tasks) {
                        if (error) {
                            callback(error, null);
                        } else {
                            // Add tasks to story data
                            story.tasks = tasks;

                            story.doneTasks = _.reduce(tasks, function(memo, task) {
                                return (task.isDone) ? memo + 1 : memo;
                            }, 0);

                            if (story.doneTasks > 0) {
                                story.progress = Math.round(story.doneTasks / tasks.length * 100);
                            } else {
                                story.progress = 0;
                            }

                            // Add task counts to sprint
                            data.sprint.cntTaskTotal = data.sprint.cntTaskTotal + story.tasks.length;
                            data.sprint.cntTaskDone = data.sprint.cntTaskDone + story.doneTasks;

                            callback(null, story);
                        }
                    });
                },

                /**
                 * Callback function which is been called after all stories are processed.
                 *
                 * @param   {null|Error}            error
                 * @param   {sails.model.story[]}   stories
                 */
                function(error, stories) {
                    next(error, stories);
                }
            )
        }

        /**
         * Private function to calculate some statistics data for sprint backlog GUI. This function
         * is called right before actual GUI rendering. At this point we have all the necessary data
         * fetched from database.
         *
         * @return  void
         */
        function calculateStatisticsData() {
            var totalTime = 0;
            var totalTimeNoFirst = 0;

            data.sprint.cntStoryTotal = data.stories.length;

            data.sprint.cntStoryDone = _.reduce(data.stories, function(memo, story) {
                return (story.isDone) ? memo + 1 : memo;
            }, 0);

            data.sprint.cntStoryNotDone = data.sprint.cntStoryTotal - data.sprint.cntStoryDone;

            if (data.sprint.cntStoryDone > 0) {
                data.sprint.progressStory = Math.round(data.sprint.cntStoryDone / data.sprint.cntStoryTotal * 100);
            } else {
                data.sprint.progressStory = 0;
            }

            data.sprint.cntTaskNotDone = data.sprint.cntTaskTotal - data.sprint.cntTaskDone;

            if (data.sprint.cntTaskDone > 0) {
                data.sprint.progressTask = Math.round(data.sprint.cntTaskDone / data.sprint.cntTaskTotal * 100);
            } else {
                data.sprint.progressTask = 0;
            }

            if (data.phases.length > 0) {
                totalTime = _.pluck(data.phases, "duration").reduce(function(memo, i) {
                    return memo + i;
                });

                totalTimeNoFirst = _.pluck(_.reject(data.phases, function(phase) {
                        return phase.order === 0;
                    }), "duration").reduce(function(memo, i) {
                    return memo + i;
                });
            }

            data.phaseDuration = {
                totalTime: totalTime,
                totalTimeNoFirst: totalTimeNoFirst
            };

            _.each(data.phases, function(phase) {
                phase.durationPercentage = (phase.duration > 0 && phase.order !== 0) ? phase.duration / totalTimeNoFirst * 100 : 0;
                phase.durationPercentageTotal = (phase.duration > 0) ? phase.duration / totalTime * 100 : 0;
            });
        }
    },

    /**
     * Sprint charts action. This will render a GUI that shows specified sprint charts.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    charts: function(request, response) {
        var sprintId = parseInt(request.param("id"), 10);

        // Get sprint and attached stories data
        async.parallel(
            {
                // Fetch sprint data
                sprint: function(callback) {
                    DataService.getSprint(sprintId, callback);
                },

                // Fetch sprint exclude days
                excludeDays: function(callback) {
                    DataService.getSprintExcludeDays(sprintId, callback);
                },

                // Fetch stories that are attached to this sprint
                stories: function(callback) {
                    DataService.getStories({sprintId: sprintId}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error} error   Error object
             * @param   {{}}    data Result data as an object that contains 'sprint' and 'stories'
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    getTaskData(data);
                }
            }
        );

        /**
         * Private function to fetch all task data that are attached specified sprint.
         *
         * @param   {{
         *              sprint: sails.model.sprint,
         *              stories: sails.model.story[],
         *              excludeDays: sails.model.excludeSprintDay[]
         *          }}  data
         */
        function getTaskData(data) {
            // Determine story id values for task search.
            var storyIds = _.map(data.stories, function(story) {
                return {storyId: story.id};
            });

            // We have some stories, so fetch tasks of those.
            if (storyIds.length > 0) {
                // Fetch stories tasks
                DataService.getTasks({or: storyIds}, function(error, tasks) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        data.tasks = tasks;

                        response.view(data);
                    }
                });
            } else { // Otherwise we don't have any tasks so render GUI
                data.tasks = [];

                response.view(data);
            }
        }
    },

    /**
     * Sprint chartDataTask action. This action handles the real data determination for sprint chart
     * GUI. This action is quite heavy because of all calculations what are made in this action.
     *
     * I think that there are some optimizations that can be done to this action, but not yet :D
     * Just leave this alone for a while, because it works like it should.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    chartDataTasks: function(request, response) {
        var sprintId = parseInt(request.param("sprintId"), 10);
        var data = {};

        // Get sprint and attached stories data
        async.parallel(
            {
                // Fetch sprint data
                sprint: function(callback) {
                    DataService.getSprint(sprintId, callback);
                },

                // Fetch sprint exclude days
                excludeDays: function(callback) {
                    DataService.getSprintExcludeDays(sprintId, callback);
                },

                // Fetch stories that are attached to this sprint
                stories: function(callback) {
                    DataService.getStories({sprintId: sprintId}, callback);
                },

                // Fetch task types
                types: function(callback) {
                    DataService.getTypes({}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error} error   Error object
             * @param   {{}}    results Result data as an object that contains 'sprint' and 'stories'
             */
            function(error, results) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    // Store results to data
                    data.sprint = results.sprint;
                    data.excludeDays = results.excludeDays;
                    data.stories = results.stories;
                    data.types = results.types;

                    // Fetch task data
                    fetchRelatedData();
                }
            }
        );

        /**
         * Private function to fetch all related data for sprint chart GUI. Note that this function
         * is quite "heavy" to run. First we will need to fetch some related data that we need for
         * calculations of statistic data.
         *
         * @return  void
         */
        function fetchRelatedData() {
            async.waterfall(
                [
                    // Fetch phase and task data
                    function(callback) {
                        getPhaseAndTaskData(callback);
                    },

                    /**
                     * Job to store task data for GUI and determine task durations in each phase.
                     *
                     * @param   {{
                     *              tasks: sails.model.task[],
                     *              phases: sails.model.phase[]
                     *          }}          results
                     * @param   {Function}  callback
                     */
                    function(results, callback) {
                        data.tasks = _.sortBy(results.tasks, function(task) {
                            return task.timeEnd;
                        });

                        data.tasksDone = _.filter(data.tasks, function(task) {
                            return task.isDone;
                        });

                        // Determine task durations in each phase
                        fetchTaskDuration(results.phases, callback);
                    }
                ],

                /**
                 * Main callback function which is called after all waterfall jobs are done. This will store
                 * determined phase data and then calculate all necessary statistics data for GUI charts.
                 *
                 * Necessary statistics calculations are done in separate private function that will process
                 * all fetched data and create actual chart data.
                 *
                 * After that data is processed it's sended back to client as in JSON object.
                 *
                 * @param   {null|Error}            error
                 * @param   {sails.model.phase[]}   phases
                 */
                function(error, phases) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        data.phases = phases;

                        parseChartData();

                        response.json(data);
                    }
                }
            );
        }

        /**
         * Private function to fetch task data. This is called after we have collect basic data for
         * the sprint chart GUI.
         *
         * @param   {Function}  next    Callback function that will be called after job is done.
         *
         * @return  void
         */
        function getPhaseAndTaskData(next) {
            async.parallel(
                {
                    // Fetch project phases data
                    phases: function(callback) {
                        DataService.getPhases({projectId: data.sprint.projectId}, callback);
                    },

                    // Fetch tasks that are attached to this sprint
                    tasks: function(callback) {
                        // Determine story id values for task search.
                        var storyIds = _.compact(_.map(data.stories, function(story) {
                            return story.ignoreInBurnDownChart ? false : { storyId: story.id };
                        }));

                        // Yeah, we got some stories, so fetch tasks of those.
                        if (storyIds.length > 0) {
                            DataService.getTasks({or: storyIds}, callback);
                        } else { // Otherwise just continue
                            callback(null, []);
                        }
                    }
                },

                /**
                 * Main callback function which is called after all parallel jobs are done.
                 *
                 * @param   {null|Error}    error
                 * @param   {{
                 *              phases: sails.model.phase[],
                 *              tasks: sails.model.task[]
                 *          }}            results
                 */
                function(error, results) {
                    next(error, results);
                }
            );
        }

        /**
         * Private function to determine tasks durations in each phase. This will map all provided
         * phase objects and adds duration data to each of those.
         *
         * After all phases are mapped with duration data function will call provided callback
         * function with phases data.
         *
         * @param   {sails.model.phase[]}   phases  Phase data
         * @param   {Function}              next    Callback to call after job is done
         */
        function fetchTaskDuration(phases, next) {
            async.map(
                phases,

                /**
                 * Function to determine duration in current phase.
                 *
                 * @param   {sails.model.phase} phase
                 * @param   {Function}          callback
                 */
                function(phase, callback) {
                    PhaseDuration
                        .find({sum: "duration"})
                        .where({phaseId: phase.id, sprintId: data.sprint.id})
                        .done(function(error, result) {
                            if (error) {
                                callback(error, null);
                            } else {
                                phase.duration = result[0].duration ? result[0].duration : 0;

                                callback(null, phase);
                            }
                        });
                },

                /**
                 * Main callback function which is called after all phases are processed.
                 *
                 * @param   {null|Error}            error
                 * @param   {sails.model.phase[]}   phases
                 */
                function (error, phases) {
                    next(error, phases);
                }
            );
        }

        /**
         * Private function to parse actual data for chart.
         */
        function parseChartData() {
            var initTasks = 0;
            var storyTasks = 0;
            var totalTimeNoFirst = 0;
            var totalTime = 0;
            var tasksOver = [];
            var taskCount = _.size(data.tasks);

            var taskTypes = _.groupBy(data.tasks, function(task) {
                return task.typeId;
            });

            if (data.phases.length > 0) {
                totalTime= _.pluck(data.phases, "duration").reduce(function(memo, i) {
                    return memo + i;
                });

                totalTimeNoFirst = _.pluck(_.reject(data.phases, function(phase) {
                        return phase.order === 0;
                    }), "duration").reduce(function(memo, i) {
                    return memo + i;
                });
            }

            data.phaseDuration = {
                totalTime: totalTime,
                totalTimeNoFirst: totalTimeNoFirst
            };

            _.each(data.phases, function(phase) {
                phase.durationPercentage = (phase.duration > 0 && phase.order !== 0) ? phase.duration / totalTimeNoFirst * 100 : 0;
                phase.durationPercentageTotal = (phase.duration > 0) ? phase.duration / totalTime * 100 : 0;
            });

            data.chartDataPhases = [];
            data.chartDataPhasesTotal = [];

            _.each(data.phases, function(phase) {
                if (phase.durationPercentage > 0) {
                    data.chartDataPhases.push({
                        name: phase.title,
                        color: phase.backgroundColor,
                        y: phase.durationPercentage,
                        duration: phase.duration
                    });
                }

                if (phase.durationPercentageTotal > 0) {
                    data.chartDataPhasesTotal.push({
                        name: phase.title,
                        color: phase.backgroundColor,
                        y: phase.durationPercentageTotal,
                        duration: phase.duration
                    });
                }
            });

            data.chartDataTaskTypes = [];

            _.each(taskTypes, function(tasks, typeId) {
                var type = _.find(data.types, function(type) {
                    return type.id == typeId;
                });

                var count = _.size(tasks);

                if (count > 0) {
                    data.chartDataTaskTypes.push({
                        name: type.title,
                        color: type.chartColor,
                        y: count / taskCount * 100,
                        count: count
                    });
                }
            });

            // Iterate each stories and determine initial and "over" tasks
            _.each(data.stories, function(story) {
                storyTasks = 0;

                // Story has not yet started, so all of its tasks are in "init" data
                if (!(story.timeStart && story.timeStart != '0000-00-00 00:00:00')) {
                    storyTasks = _.size(_.filter(data.tasks, function(task) {
                        return task.storyId === story.id;
                    }));
                } else { // Otherwise story is either in process or done
                    // calculate task count that are created before story start time
                    storyTasks = _.size(_.filter(data.tasks, function(task) {
                        return (task.storyId === story.id && task.createdAt <= story.timeStart);
                    }));

                    // Determine tasks that are added after story start
                    tasksOver = tasksOver.concat(_.filter(data.tasks, function(task) {
                        return (task.storyId === story.id && task.createdAt > story.timeStart);
                    }));
                }

                // Add current story init task count to main task count
                initTasks = initTasks + storyTasks;
            });

            data.tasksOver = _.sortBy(tasksOver, function(task) {
                return task.createdAt;
            });

            data.initTasks = initTasks;
            data.chartData = [];

            // Initialize statistics data
            data.statistics = {
                sprintDays: 0,
                workDays: 0,
                tasksPerDayIdeal: 0,
                tasksPerDayActual: 0
            };

            var dataActual = getActualData();

            data.pointStart = data.sprint.dateStartObject();
            data.pointActual = moment(_.last(dataActual).x);

            // Add 'Ideal task remaining' data
            data.chartData.push({
                name: "Ideal",
                nameShort: "Ideal",
                type: "spline",
                color: "#3276b1",
                dashStyle: "Dash",
                marker: {
                    enabled: false,
                    radius: 3
                },
                lineWidth: 1,
                zIndex: 10,
                data: getIdealData()
            });

            // Add 'Actual task remaining' data
            data.chartData.push({
                name: "Actual",
                nameShort: "Actual",
                type: "spline",
                color: "#c9302c",
                shadow: true,
                marker: {
                    enabled: false,
                    radius: 3
                },
                zIndex: 20,
                data: dataActual
            });

            // Add 'Done tasks' data
            data.chartData.push({
                name: "Done",
                nameShort: "Done",
                type: "column",
                color: "#47a447",
                zIndex: 5,
                data: getDoneData()
            });

            // Add 'Added tasks' data
            data.chartData.push({
                name: "Added",
                nameShort: "Added",
                type: "column",
                color: "#ec971f",
                zIndex: 0,
                data: getAddedData()
            });
        }

        /**
         * Private function to determine ideal data for charts. This is basically linear line where
         * start point is at sprint start and value for that point is sprint initial task count. End
         * point is at sprint end and value is zero.
         *
         * Output is an array of UTC date times and actual values.
         *
         * @returns {Array}
         */
        function getIdealData() {
            var output = [];
            var tasks = data.initTasks;
            var startTime = data.sprint.dateStartObject();
            var endTime = data.sprint.dateEndObject();
            var days = data.sprint.durationDays();

            // Used dates within calculations
            var currentDate = moment(startTime);
            var previousDate = Date.UTC(startTime.year(), startTime.month(), startTime.date());

            // Iterate sprint date range and remove exclude days
            while (endTime.diff(currentDate, "days") > 0) {
                // Exclude day founded, so decrease total day count
                if (_.find(data.excludeDays, function(day) { return currentDate.isSame(day.dayObject(), "days"); })) {
                    days = days - 1;
                }

                currentDate.add("days", 1);
            }

            // Calculate ideal tasks per day count
            var tasksPerDay = data.initTasks / (days - 1);

            // Store statistics data
            data.statistics.sprintDays = days;
            data.statistics.tasksPerDayIdeal = tasksPerDay;

            // Set current date to sprint start
            currentDate = moment(startTime);

            // Iterate sprint days and make ideal line data
            while (endTime.diff(currentDate, "days") > 0) {
                var ignore = isDateIgnored(currentDate);

                // Current date is valid for ideal line data
                if (!ignore) {
                    // Add data to output
                    output.push({
                        x: Date.UTC(currentDate.year(), currentDate.month(), currentDate.date()),
                        y: tasks,
                        previousX: previousDate ? previousDate : null,
                        notPlannedDay: false
                    });

                    // Store new previous date and task count for next round
                    previousDate = Date.UTC(currentDate.year(), currentDate.month(), currentDate.date());
                    tasks = tasks - tasksPerDay;
                }

                currentDate.add("days", 1);
            }

            // Add final point for ideal line
            output.push({
                x: Date.UTC(currentDate.year(), currentDate.month(), currentDate.date()),
                y: 0,
                previousX: previousDate ? previousDate : null,
                notPlannedDay: false
            });

            return output;
        }

        /**
         * Private function to get actual task data.
         *
         * @returns {Array}
         */
        function getActualData() {
            var output = [];
            var tasks = data.initTasks;
            var startTime = data.sprint.dateStartObject();
            var endTime = data.sprint.dateEndObject();
            var tasksDone = 0;
            var tasksOver = 0;
            var workDays = 0;

            // Used dates within calculations
            var currentDate = moment(startTime);
            var previousDate = Date.UTC(startTime.year(), startTime.month(), startTime.date());

            // Add first point of data
            output.push({
                x: Date.UTC(currentDate.year(), currentDate.month(), currentDate.date()),
                y: tasks,
                previousX: previousDate,
                notPlannedDay: isDateIgnored(currentDate)
            });

            // Group tasks for calculations
            var objectsTasksDone = _.groupBy(data.tasks, function(task) {
                return task.isDone ? task.timeEndObject().format("YYYY-MM-DD") : null;
            });

            var objectsTasksOver = _.groupBy(data.tasksOver, function(task) {
                return task.createdAtObject().format("YYYY-MM-DD");
            });

            // Iterate dates
            while (endTime.diff(currentDate, "days") >= 0) {
                // We are only interested days that are before current day
                if (currentDate.isBefore(moment().add("days", 1), "day")) {
                    // Determine if current date is ignored or not
                    var ignore = isDateIgnored(currentDate);
                    var date = currentDate.format("YYYY-MM-DD");
                    var notPlannedDay = false;

                    // Determine tasks count
                    tasksDone = objectsTasksDone[date] ? _.size(objectsTasksDone[date]) : 0;
                    tasksOver = objectsTasksOver[date] ? _.size(objectsTasksOver[date]) : 0;

                    // If current date has some tasks done or added, we must drawn this date
                    if (tasksDone > 0 || tasksOver > 0) {
                        notPlannedDay = ignore;
                        ignore = false;
                    }

                    // Date is valid to show
                    if (!ignore) {
                        // Calculate new task count based to previous tasks, done and added tasks count
                        tasks = tasks - tasksDone + tasksOver;

                        // Add new point data to output
                        output.push({
                            x: Date.UTC(currentDate.year(), currentDate.month(), currentDate.date()),
                            y: tasks,
                            previousX: previousDate ? previousDate : null,
                            notPlannedDay: notPlannedDay
                        });

                        // Add workdays
                        workDays = workDays + 1;

                        // Store new previous date
                        previousDate = Date.UTC(currentDate.year(), currentDate.month(), currentDate.date());
                    }
                }

                // Go to next date
                currentDate.add("days", 1);
            }

            // We have some tasks not done, this means that sprint has failed somehow
            if (tasks > 0) {
                // Loop days until we have today.
                while (moment().diff(currentDate, "days") >= 0 && tasks > 0) {
                    // We are only interested days that are before current day
                    if (currentDate.isBefore(moment().add("days", 1), "day")) {
                        ignore = isDateIgnored(currentDate);
                        date = currentDate.format("YYYY-MM-DD");

                        // Determine tasks count
                        tasksDone = objectsTasksDone[date] ? _.size(objectsTasksDone[date]) : 0;
                        tasksOver = objectsTasksOver[date] ? _.size(objectsTasksOver[date]) : 0;

                        // If current date has some tasks done or added, we must drawn this date
                        if (tasksDone > 0 || tasksOver > 0) {
                            ignore = false;
                        }

                        // Date is valid to show
                        if (!ignore) {
                            // Calculate new task count based to previous tasks, done and added tasks count
                            tasks = tasks - tasksDone + tasksOver;

                            // Add point data to output
                            output.push({
                                x: Date.UTC(currentDate.year(), currentDate.month(), currentDate.date()),
                                y: tasks,
                                previousX: previousDate ? previousDate : null,
                                notPlannedDay: true
                            });

                            // Add workdays
                            workDays = workDays + 1;

                            // Store new previous date
                            previousDate = Date.UTC(currentDate.year(), currentDate.month(), currentDate.date());
                        }
                    }

                    // Go to next date
                    currentDate.add("days", 1);
                }
            }

            // Store statistics data
            data.statistics.workDays = workDays;
            data.statistics.tasksPerDayActual = data.tasksDone.length / workDays;

            return output;
        }

        /**
         * Private function to get possible added task data for current sprint.
         *
         * @returns {Array}
         */
        function getAddedData() {
            var output = [];

            // Group task data by create date and iterate grouped data
            _.each(_.groupBy(data.tasksOver, function(task) { return task.createdAtObject().format("YYYY-MM-DD"); } ),
                function(tasks) {
                    //var date = tasks[0].createdAtObject().add("days", 1);
                    var date = tasks[0].createdAtObject();

                    output.push([Date.UTC(date.year(), date.month(), date.date()), _.size(tasks)]);
                }
            );

            return output;
        }

        /**
         * Private function to get done data for current sprint.
         *
         * @returns {Array}
         */
        function getDoneData() {
            var output = [];

            // Group task data by done date and iterate grouped data
            _.each(_.groupBy(data.tasksDone, function(task) { return task.timeEndObject().format("YYYY-MM-DD"); }),
                function(tasks) {
                    //var date = tasks[0].timeEndObject().add("days", 1);
                    var date = tasks[0].timeEndObject();

                    output.push([Date.UTC(date.year(), date.month(), date.date()), _.size(tasks)]);
                }
            );

            return output;
        }

        /**
         * Private function to determine if given date is ignored in sprint or not.
         *
         * @param   {moment}    momentObject
         * @returns {boolean}
         */
        function isDateIgnored(momentObject) {
            var ignore = false;

            // Sprint doesn't contain weekends
            if (data.sprint.ignoreWeekends) {
                var weekDay = momentObject.isoWeekday();

                if (weekDay === 6 || weekDay === 7) {
                    ignore = true;
                }
            }

            // Also ignore date if it is exclude day in sprint
            if (_.find(data.excludeDays, function(day) { return momentObject.isSame(day.dayObject(), "days"); })) {
                ignore = true;
            }

            return ignore;
        }
    }
};
