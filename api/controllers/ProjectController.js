/**
 * ProjectController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var async = require("async");

module.exports = {
    /**
     * Project add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        async.parallel(
            {
                /**
                 * Fetch taskboard user data.
                 *
                 * @param   {Function}  callback
                 */
                users: function(callback) {
                    DataService.getUsers({}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error|String}  error
             * @param   {{}}            data
             */
            function(error, data) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.layout = req.isAjax ? "layout_ajax" : "layout";

                    res.view(data);
                }
            }
        );
    },

    /**
     * Project edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        var projectId = parseInt(req.param("id"), 10);

        async.parallel(
            {
                /**
                 * Fetch project data.
                 *
                 * @param   {Function}  callback
                 */
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                /**
                 * Fetch taskboard user data.
                 *
                 * @param   {Function}  callback
                 */
                users: function(callback) {
                    DataService.getUsers({}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error|String}  error
             * @param   {{}}            data
             */
            function(error, data) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.layout = req.isAjax ? "layout_ajax" : "layout";

                    res.view(data);
                }
            }
        );
    },

    /**
     * Project backlog action
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    backlog: function(req, res) {
        var projectId = parseInt(req.param("id"), 10);

        async.parallel(
            {
                // Fetch user role
                role: function(callback) {
                    AuthService.hasProjectAccess(req.user, projectId, callback, true);
                },

                // Fetch project data.
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                // Fetch project stories that are in backlog.
                stories: function(callback) {
                    DataService.getStories({
                        projectId: projectId,
                        sprintId: 0
                    }, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error|String}  error
             * @param   {{}}            data
             */
            function(error, data) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.layout = req.isAjax ? "layout_ajax" : "layout";

                    res.view(data);
                }
            }
        );
    },

    /**
     * Project milestones action
     *
     * @todo this needs dome work
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    milestones: function(req, res) {
        var projectId = parseInt(req.param("id"), 10);

        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
            role: 0,
            milestones: false,
            project: false,
            progressMilestones: 0,
            progressStories: 0,
            progressTasks: 0,
            cntMilestonesDone: 0,
            cntMilestonesTotal: 0,
            cntStoriesDone: 0,
            cntStoriesTotal: 0,
            cntTasksDone: 0,
            cntTasksTotal: 0
        };

        async.parallel(
            {
                // Fetch user role
                role: function(callback) {
                    AuthService.hasProjectAccess(req.user, projectId, callback, true);
                },

                // Fetch project data.
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                // Fetch project milestone data.
                milestones: function(callback) {
                    DataService.getMilestones({projectId: projectId}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error|String}  error
             * @param   {{}}            results
             */
            function(error, results) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.role = results.role;
                    data.project = results.project;
                    data.milestones = results.milestones;
                    data.cntMilestonesTotal = data.milestones.length;

                    fetchStories();
                }
            }
        );

        /**
         * Function to fetch attached milestone stories.
         */
        function fetchStories() {
            // We have no milestones, so make view
            if (data.milestones.length === 0) {
                makeView();
            } else {
                // Iterate milestones
                _.each(data.milestones, function(/** sails.model.milestone */milestone) {
                    // Initialize milestone stories property
                    milestone.stories = false;

                    // Find all user stories which are attached to current milestone
                    Story
                        .find()
                        .where({
                            milestoneId: milestone.id
                        })
                        .sort("title ASC")
                        .done(function(error, stories) {

                            milestone.doneStories = _.reduce(stories, function (memo, story) {
                                return (story.isDone) ? memo + 1 : memo;
                            }, 0);

                            data.cntStoriesTotal = data.cntStoriesTotal + stories.length;
                            data.cntStoriesDone = data.cntStoriesDone + milestone.doneStories;

                            if (milestone.doneStories > 0) {
                                if (stories.length === milestone.doneStories) {
                                    data.cntMilestonesDone = data.cntMilestonesDone + 1;
                                }

                                milestone.progress = Math.round(milestone.doneStories / stories.length * 100);
                            } else {
                                milestone.progress = 0;
                            }

                            var storyIds = _.map(stories, function(story) { return {storyId: story.id}; });

                            if (storyIds.length > 0) {
                                // Find story tasks
                                Task
                                    .find()
                                    .where({or: storyIds})
                                    .done(function(error, tasks) {
                                        data.cntTasksTotal = data.cntTasksTotal + tasks.length;
                                        data.cntTasksDone = data.cntTasksDone + _.reduce(tasks, function (memo, task) {
                                            return (task.isDone) ? memo + 1 : memo;
                                        }, 0);

                                        // Add tasks to milestone data
                                        milestone.tasks = tasks;

                                        // Add stories to milestone data
                                        milestone.stories = stories;

                                        // Call view
                                        makeView();
                                    });
                            } else {
                                // Add tasks to milestone data
                                milestone.tasks = [];

                                // Add stories to milestone data
                                milestone.stories = stories;

                                // Call view
                                makeView();
                            }
                        });
                });
            }
        }

        /**
         * Function to make actual view for project milestone list.
         */
        function makeView() {
            var ok = true;

            _.each(data, function(data) {
                if (data === false) {
                    ok = false;
                }
            });

            if (ok) {
                if (data.milestones.length > 0) {
                    var show = true;

                    _.each(data.milestones, function(/** sails.model.milestone */milestone) {
                        if (milestone.stories === false) {
                            show = false;
                        }
                    });

                    if (show) {
                        if (data.cntMilestonesDone > 0) {
                            data.progressMilestones = Math.round(data.cntMilestonesDone / data.cntMilestonesTotal * 100);
                        } else {
                            data.progressMilestones = 0;
                        }

                        if (data.cntStoriesDone > 0) {
                            data.progressStories = Math.round(data.cntStoriesDone / data.cntStoriesTotal * 100);
                        } else {
                            data.progressStories = 0;
                        }

                        if (data.cntTasksDone > 0) {
                            data.progressTasks = Math.round(data.cntTasksDone / data.cntTasksTotal * 100);
                        } else {
                            data.progressTasks = 0;
                        }

                        res.view(data);
                    }
                } else {
                    res.view(data);
                }
            }
        }
    },

    /**
     * Project planning action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    planning: function(req, res) {
        var projectId = parseInt(req.param("id"), 10);

        async.parallel(
            {
                // Fetch project data.
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                // Fetch project story data
                stories: function(callback) {
                    DataService.getStories({projectId: projectId}, callback);
                },

                // Fetch project sprint data
                sprints: function(callback) {
                    DataService.getSprints({projectId: projectId}, callback);
                },

                // Fetch user role
                role: function(callback) {
                    AuthService.hasProjectAccess(req.user, projectId, callback, true);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error|String}  error
             * @param   {{}}            data
             */
            function(error, data) {
                if (error) {
                    res.send(error.status ? error.status : 500, error);
                } else {
                    data.layout = req.isAjax ? "layout_ajax" : "layout";

                    res.view(data);
                }
            }
        );
    },

    /**
     * Project statistics action.
     *
     * @todo this needs dome work
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    statistics: function(req, res) {
        var projectId = parseInt(req.param('id'), 10);

        // Specify template data to use
        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
            project: {
                data: false
            },
            milestones: {
                data: false,
                stories: [],
                progress: 0,
                cntDone: 0,
                cntTotal: 0
            },
            sprints: {
                data: false,
                stories: [],
                progress: 0,
                cntDone: 0,
                cntTotal: 0
            },
            stories: {
                data: false,
                progress: 0,
                cntDone: 0,
                cntTotal: 0
            },
            tasks: {
                data: false,
                progress: 0,
                cntDone: 0,
                cntTotal: 0
            }
        };

        async.parallel(
            {
                /**
                 * Fetch project data.
                 *
                 * @param   {Function}  callback
                 */
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                /**
                 * Fetch project milestones.
                 *
                 * @param   {Function}  callback
                 */
                milestones: function(callback) {
                    DataService.getMilestones({projectId: projectId}, callback);
                },

                /**
                 * Fetch project sprint data
                 *
                 * @param   {Function}  callback
                 */
                sprints: function(callback) {
                    DataService.getSprints({projectId: projectId}, callback);
                },

                /**
                 * Fetch project phases data
                 *
                 * @param   {Function}  callback
                 */
                phases: function(callback) {
                    DataService.getPhases({projectId: projectId}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error|String}  error
             * @param   {{}}            results
             */
            function(error, results) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.project.data = results.project;

                    data.milestones.data = results.milestones;
                    data.milestones.cntTotal = results.milestones.length;

                    data.sprints.data = results.sprints;
                    data.sprints.cntTotal = results.sprints.length;

                    data.phases = results.phases;

                    fetchPhaseDuration();
                }
            }
        );

        /**
         * Private function to fetch project task phase duration times. This will sum tasks durations
         * for each phase in this project.
         */
        function fetchPhaseDuration() {
            async.map(
                data.phases,

                /**
                 * Function to determine duration in specified phase.
                 *
                 * @param   {sails.model.phase} phase
                 * @param   {Function}          callback
                 */
                function (phase, callback) {
                    PhaseDuration
                        .find({
                            sum: "duration"
                        })
                        .where({phaseId: phase.id})
                        .where({projectId: data.project.data.id})
                        .done(function(error, result) {
                            if (error) {
                                callback(error, null);
                            } else {
                                phase.duration = result[0].duration ? result[0].duration : 0;

                                callback(null, phase.duration);
                            }
                        });
                },

                /**
                 * Main callback function which is called after all phases are processed.
                 *
                 * @param   {Error|null}    error
                 * @param   {{}}            result
                 */
                    function (error, result) {
                    if (error) {
                        res.send(error, error.status ? error.status : 500);
                    } else {
                        fetchStories();
                    }
                }
            );
        }

        function fetchStories() {
            // Fetch project stories
            Story
                .find()
                .where({
                    projectId: projectId
                })
                .sort('isDone DESC')
                .sort('title ASC')
                .done(function(error, stories) {
                    if (error) {
                        res.send(error, 500);
                    } else {
                        data.stories.data = stories;
                        data.stories.cntTotal = stories.length;
                        data.stories.cntDone = _.reduce(stories, function (memo, story) {
                            return (story.isDone) ? memo + 1 : memo;
                        }, 0);

                        if (data.stories.cntDone > 0) {
                            data.stories.progress = Math.round(data.stories.cntDone / data.stories.cntTotal * 100);
                        }

                        var storyIds = _.map(stories, function(story) { return {storyId: story.id}; });

                        if (storyIds.length > 0) {
                            Task
                                .find()
                                .where({or: storyIds})
                                .done(function(error, tasks) {
                                    data.tasks.data = tasks;
                                    data.tasks.cntTotal = tasks.length;
                                    data.tasks.cntDone = _.reduce(tasks, function (memo, task) {
                                        return (task.isDone) ? memo + 1 : memo;
                                    }, 0);

                                    if (data.tasks.cntDone > 0) {
                                        data.tasks.progress = Math.round(data.tasks.cntDone / data.tasks.cntTotal * 100);
                                    }

                                    makeDetailedStatistics();

                                    res.view(data);
                                });
                        } else {
                            makeDetailedStatistics();

                            res.view(data);
                        }
                    }
                });
        }

        /**
         * Function makes detailed statistics from fetched data.
         */
        function makeDetailedStatistics() {
            var totalTime = _.pluck(data.phases, "duration").reduce(function(memo, i) {return memo + i});
            var totalTimeNoFirst = _.pluck(_.reject(data.phases, function(phase) { return phase.order === 0 } ), "duration").reduce(function(memo, i) {return memo + i});

            data.phaseDuration = {
                totalTime: totalTime,
                totalTimeNoFirst: totalTimeNoFirst
            };

            _.each(data.phases, function(phase) {
                phase.durationPercentage = (phase.duration > 0 && phase.order !== 0) ? phase.duration / totalTimeNoFirst * 100 : 0;
                phase.durationPercentageTotal = (phase.duration > 0) ? phase.duration / totalTime * 100 : 0;
            });

            _.each(data.stories.data, function(story) {
                story.tasks = {
                    data: [],
                    cntTotal: 0,
                    cntDone: 0,
                    progress: 0
                };

                story.tasks.data = _.filter(data.tasks.data, function (task) {
                    return task.storyId === story.id;
                });

                story.tasks.cntTotal = story.tasks.data.length;

                story.tasks.cntDone = _.reduce(story.tasks.data, function (memo, task) {
                    return (task.isDone) ? memo + 1 : memo;
                }, 0);

                if (story.tasks.cntDone > 0) {
                    story.tasks.progress = Math.round(story.tasks.cntDone / story.tasks.cntTotal * 100);
                }
            });

            // Sort stories by tasks progress
            data.stories.data.sort(function(a, b) {
                if (a.tasks.progress < b.tasks.progress) {
                    return 1;
                } else if (a.tasks.progress > b.tasks.progress) {
                    return -1;
                } else {
                    return 0;
                }
            });

            /**
             * Iterate fetched sprints and add story data and stories statistics
             * data to it
             */
            _.each(data.sprints.data, function(sprint) {
                sprint.stories = {
                    data: [],
                    cntTotal: 0,
                    cntDone: 0,
                    progress: 0
                };

                sprint.stories.data = _.filter(data.stories.data, function (story) {
                    return story.sprintId === sprint.id;
                });

                sprint.stories.cntTotal = sprint.stories.data.length;

                sprint.stories.cntDone = _.reduce(sprint.stories.data, function (memo, story) {
                    return (story.isDone) ? memo + 1 : memo;
                }, 0);

                if (sprint.stories.cntDone > 0) {
                    sprint.stories.progress = Math.round(sprint.stories.cntDone / sprint.stories.cntTotal * 100);

                    if (sprint.stories.cntDone === sprint.stories.cntTotal) {
                        data.sprints.cntDone = data.sprints.cntDone + 1;
                    }
                }
            });

            // Calculate sprints total progress if
            if (data.sprints.cntDone > 0) {
                data.sprints.progress = Math.round(data.sprints.cntDone / data.sprints.cntTotal * 100);
            }

            _.each(data.milestones.data, function(milestone) {
                milestone.stories = {
                    data: [],
                    cntTotal: 0,
                    cntDone: 0,
                    progress: 0
                };

                milestone.stories.data = _.filter(data.stories.data, function (story) {
                    return story.milestoneId === milestone.id;
                });

                milestone.stories.cntTotal = milestone.stories.data.length;

                milestone.stories.cntDone = _.reduce(milestone.stories.data, function (memo, story) {
                    return (story.isDone) ? memo + 1 : memo;
                }, 0);

                if (milestone.stories.cntDone > 0) {
                    milestone.stories.progress = Math.round(milestone.stories.cntDone / milestone.stories.cntTotal * 100);

                    if (milestone.stories.cntDone === milestone.stories.cntTotal) {
                        data.milestones.cntDone = data.milestones.cntDone + 1;
                    }
                }
            });

            if (data.milestones.cntDone > 0) {
                data.milestones.progress = Math.round(data.milestones.cntDone / data.milestones.cntTotal * 100);
            }
        }
    },

    /**
     * Project sprints action.
     *
     * @todo this needs dome work
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    sprints: function(req, res) {
        var projectId = parseInt(req.param('id'), 10);

        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
            role: false,
            project: false,
            sprints: false,
            stories: false,
            tasks: false,
            progressSprints: 0,
            progressStories: 0,
            progressTasks: 0,
            cntSprintsDone: 0,
            cntSprintsTotal: 0,
            cntStoriesDone: 0,
            cntStoriesTotal: 0,
            cntTasksDone: 0,
            cntTasksTotal: 0
        };

        async.parallel(
            {
                // Fetch user role
                role: function(callback) {
                    AuthService.hasProjectAccess(req.user, projectId, callback, true);
                },

                /**
                 * Fetch project data.
                 *
                 * @param   {Function}  callback
                 */
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                /**
                 * Fetch project sprint data
                 *
                 * @param   {Function}  callback
                 */
                sprints: function(callback) {
                    DataService.getSprints({
                        projectId: projectId
                    }, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {Error|String}  error
             * @param   {{}}            results
             */
            function(error, results) {
                if (error) {
                    res.send(error.status ? error.status : 500, error);
                } else {
                    data.role = results.role;
                    data.project = results.project;
                    data.sprints = results.sprints;
                    data.cntSprintsTotal = data.sprints.length;

                    fetchStoryAndTaskData();
                }
            }
        );

        /**
         * Private function to fetch project sprints story and task data from database.
         *
         * Function will also make some calculations for statistics.
         */
        function fetchStoryAndTaskData() {
            async.map(
                data.sprints,
                function(sprint, callback) {
                    Story
                        .find()
                        .where({
                            sprintId: sprint.id
                        })
                        .sort("title ASC")
                        .done(function(error, stories) {
                            if (error) {
                                callback(error, null);
                            }

                            // Add stories to sprint data
                            sprint.stories = stories;

                            // Calculate done stories count
                            sprint.doneStories = _.reduce(stories, function(memo, story) {
                                return (story.isDone) ? memo + 1 : memo;
                            }, 0);

                            // Add global story counter data
                            data.cntStoriesTotal = data.cntStoriesTotal + stories.length;
                            data.cntStoriesDone = data.cntStoriesDone + sprint.doneStories;

                            // Some of sprint stories are done, so calculate sprint progress
                            if (sprint.doneStories > 0) {
                                if (stories.length === sprint.doneStories) {
                                    data.cntSprintsDone = data.cntSprintsDone + 1;
                                }

                                sprint.progress = Math.round(sprint.doneStories / stories.length * 100);
                            } else { // Otherwise sprint progress is zero
                                sprint.progress = 0;
                            }

                            // Determine story id values for task data fetch
                            var storyIds = _.map(stories, function(story) { return { storyId: story.id }; } );

                            if (storyIds.length > 0) {
                                // Find story tasks
                                Task
                                    .find()
                                    .where({or: storyIds})
                                    .done(function(error, tasks) {
                                        data.cntTasksTotal = data.cntTasksTotal + tasks.length;
                                        data.cntTasksDone = data.cntTasksDone + _.reduce(tasks, function(memo, task) {
                                            return (task.isDone) ? memo + 1 : memo;
                                        }, 0);

                                        // Add tasks to sprint data
                                        sprint.tasks = tasks;

                                        callback(null, sprint);
                                    });
                            } else {
                                // Add tasks to sprint data
                                sprint.tasks = [];

                                callback(null, sprint);
                            }
                        });
                },
                function(error, results) {
                    if (error) {
                        res.send(error.status ? error.status : 500, error);
                    } else {
                        data.sprints = results;

                        if (data.cntSprintsDone > 0) {
                            data.progressSprints = Math.round(data.cntSprintsDone / data.cntSprintsTotal * 100);
                        } else {
                            data.progressSprints = 0;
                        }

                        if (data.cntStoriesDone > 0) {
                            data.progressStories = Math.round(data.cntStoriesDone / data.cntStoriesTotal * 100);
                        } else {
                            data.progressStories = 0;
                        }

                        if (data.cntTasksDone > 0) {
                            data.progressTasks = Math.round(data.cntTasksDone / data.cntTasksTotal * 100);
                        } else {
                            data.progressTasks = 0;
                        }

                        res.view(data);
                    }
                }
            );
        }
    }
};
