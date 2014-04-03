/**
 * ProjectController
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
 *
 * @bugs        :: api/controllers/ProjectController.js:636:62
 */
var async = require("async");

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ProjectController)
     */
    _config: {},

    /**
     * Project add action. This will render a GUI for new project add.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    add: function(request, response) {
        async.parallel(
            {
                // Fetch users
                users: function(callback) {
                    DataService.getUsers({}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {null|Error}                    error
             * @param   {{users: sails.model.user[]}}   data
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.view(data);
                }
            }
        );
    },

    /**
     * Project edit action. This will render a GUI for specified project edit.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    edit: function(request, response) {
        var projectId = parseInt(request.param("id"), 10);

        async.parallel(
            {
                // Fetch project data.
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                // Fetch taskboard user data.
                users: function(callback) {
                    DataService.getUsers({}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error   Possible error
             * @param   {{
             *              project: sails.model.project
             *              users: sails.model.user[]
             *          }}              data    Object that contains 'project' and 'users' objects
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.view(data);
                }
            }
        );
    },

    /**
     * Project backlog action that will render a GUI that contains all stories
     * that are not yet assigned to any sprint. These stories are in project backlog.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    backlog: function(request, response) {
        var projectId = parseInt(request.param("id"), 10);

        async.parallel(
            {
                // Fetch user role
                role: function(callback) {
                    AuthService.hasProjectAccess(request.user, projectId, callback, true);
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
             * @param   {null|Error}    error   Possible error
             * @param   {{
             *              role: sails.helper.role
             *              project: sails.model.project
             *              stories: sails.model.story[]
             *          }}              data    Data that contains 'role', 'project' and 'stories'
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.view(data);
                }
            }
        );
    },

    /**
     * Project milestones action, this will render a GUI that shows all milestones for specified
     * project and some statistics data of those progress.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    milestones: function(request, response) {
        var projectId = parseInt(request.param("id"), 10);

        var data = {
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
                    AuthService.hasProjectAccess(request.user, projectId, callback, true);
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
             * @param   {null|Error}    error
             * @param   {{
             *              role: sails.helper.role
             *              project: sails.model.project
             *              milestones: sails.model.milestone[]
             *          }}              results
             */
            function(error, results) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    data.role = results.role;
                    data.project = results.project;
                    data.milestones = results.milestones;
                    data.cntMilestonesTotal = data.milestones.length;

                    // Iterate each milestones and fetch stories of those
                    async.each(data.milestones, fetchStories, renderView);
                }
            }
        );

        /**
         * Private function to fetch all stories that belongs to specified milestone.
         *
         * @param   {sails.model.milestone} milestone   Milestone object
         * @param   {Function}              callback    Callback function to call when processing is done
         */
        function fetchStories(milestone, callback) {
            milestone.stories = false;

            // Fetch stories that belongs to specified milestone
            DataService.getStories({milestoneId: milestone.id}, function(error, stories) {
                if (error) {
                    callback(error);
                } else {
                    milestone.doneStories = _.reduce(stories, function(memo, story) {
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

                    var storyIds = _.map(stories, function(story) {
                        return { storyId: story.id };
                    });

                    // Add stories to milestone data
                    milestone.stories = stories;

                    // We have some stories, so fetch tasks of those
                    if (storyIds.length > 0) {
                        fetchTasks(milestone, storyIds, callback);
                    } else {
                        // Add tasks to milestone data
                        milestone.tasks = [];

                        callback(null);
                    }
                }
            });
        }

        /**
         * Private function to fetch all tasks that belongs to specified stories.
         *
         * @param   {sails.model.milestone} milestone   Milestone object
         * @param   {{storyId: {Number}}[]} storyIds    Story ids as an array of objects
         * @param   {Function}              callback    Callback function to call whenever process is "done"
         */
        function fetchTasks(milestone, storyIds, callback) {
            // Fetch tasks
            DataService.getTasks({or: storyIds}, function(error, tasks) {
                if (error) {
                   callback(error);
                } else {
                    data.cntTasksTotal = data.cntTasksTotal + tasks.length;

                    data.cntTasksDone = data.cntTasksDone + _.reduce(tasks, function(memo, task) {
                        return (task.isDone) ? memo + 1 : memo;
                    }, 0);

                    // Add tasks to milestone data
                    milestone.tasks = tasks;

                    callback(null);
                }
            });
        }

        /**
         * Private function to render actual view. This is called whenever error occurs in
         * sub-processes or all of those jobs are processed successfully.
         *
         * @param   {null|Error}    error   Possible error
         */
        function renderView(error) {
            if (error) {
                ResponseService.makeError(error, request, response);
            } else {
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

                response.view(data);
            }
        }
    },

    /**
     * Project planning action. This will render a simple GUI for project planning
     * where user can drag&drop stories between sprints and project backlog.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    planning: function(request, response) {
        var projectId = parseInt(request.param("id"), 10);

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
                    AuthService.hasProjectAccess(request.user, projectId, callback, true);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error   Possible error
             * @param   {{
             *              project: sails.model.project,
             *              stories: sails.model.story[],
             *              sprints: sails.model.sprint[],
             *              role: sails.helper.role
             *          }}              data    Object that contains 'project', 'stories', 'sprints' and 'role'
             */
            function(error, data) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.view(data);
                }
            }
        );
    },

    /**
     * Project statistics action. This is really "heavy" action to process because basically we're
     * fetching whole project data from database and make some calculations for that data.
     *
     * @todo should we just return basic data and handle drill downs by clicking on the gui?
     * @todo should we store some statistic data to main objects, so calculations are not needed?
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    statistics: function(request, response) {
        var projectId = parseInt(request.param("id"), 10);

        // Specify template data to use
        var data = {
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
                // Fetch project data
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                // Fetch project milestones
                milestones: function(callback) {
                    DataService.getMilestones({projectId: projectId}, callback);
                },

                // Fetch project sprint data
                sprints: function(callback) {
                    DataService.getSprints({projectId: projectId}, callback);
                },

                // Fetch project phases data
                phases: function(callback) {
                    DataService.getPhases({projectId: projectId}, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error   Possible error
             * @param   {{
             *              project: sails.model.project,
             *              milestones: sails.model.milestone[],
             *              sprints: sails.model.sprint[],
             *              phases: sails.model.phase[]
             *          }}              results Object that contains 'project', 'milestones', 'sprints' and 'phases'
             */
            function(error, results) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    data.project.data = results.project;

                    data.milestones.data = results.milestones;
                    data.milestones.cntTotal = results.milestones.length;

                    data.sprints.data = results.sprints;
                    data.sprints.cntTotal = results.sprints.length;

                    data.phases = results.phases;

                    // Fetch needed related data for view
                    fetchRelatedData();
                }
            }
        );

        /**
         * Private function to fetch needed related data that are needed for GUI. Related data
         * are following: sum of phase durations, stories, and tasks that are attached to these
         * stories.
         *
         * Note that tasks are fetched in sub process in story fetching.
         */
        function fetchRelatedData() {
            async.parallel(
                [
                    // Determine phase durations
                    function(callback) {
                        fetchPhaseDuration(callback);
                    },

                    // Fetch stories and task data of those
                    function(callback) {
                        fetchStories(callback);
                    }
                ],

                /**
                 * Callback function which is called after all parallel jobs are done.
                 *
                 * @param   {null|Error}    error   Possible error
                 */
                function(error) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        // Calculate statistics data
                        makeDetailedStatistics();

                        // Render view
                        response.view(data);
                    }
                }
            );
        }

        /**
         * Private function to fetch project task phase duration times. This will sum tasks durations
         * for each phase in this project.
         *
         * @param   {Function}  next    Main callback function which must be called after all is done
         */
        function fetchPhaseDuration(next) {
            async.map(
                data.phases,

                /**
                 * Function to determine duration in specified phase.
                 *
                 * @param   {sails.model.phase} phase
                 * @param   {Function}          callback
                 */
                function(phase, callback) {
                    PhaseDuration
                        .find({
                            sum: "duration"
                        })
                        .where({phaseId: phase.id})
                        .where({projectId: data.project.data.id})
                        .done(function(error, result) {
                            if (error) {
                                callback(error);
                            } else {
                                phase.duration = result[0].duration ? result[0].duration : 0;

                                callback(null);
                            }
                        });
                },

                /**
                 * Main callback function which is called after all phases are processed.
                 *
                 * @param   {null|Error}    error   Possible error
                 */
                function(error) {
                    next(error)
                }
            );
        }

        /**
         * Private function to fetch all stories that are attached to current project. Note that if stories
         * are found in project function triggers task fetch process, which will eventually call the main
         * callback function.
         *
         * @param   {Function}  next    Main callback function which must be called after all is done
         */
        function fetchStories(next) {
            DataService.getStories({projectId: projectId}, function(error, stories) {
                if (error) {
                    next(error)
                } else {
                    data.stories.data = stories;
                    data.stories.cntTotal = stories.length;
                    data.stories.cntDone = _.reduce(stories, function(memo, story) {
                        return (story.isDone) ? memo + 1 : memo;
                    }, 0);

                    if (data.stories.cntDone > 0) {
                        data.stories.progress = Math.round(data.stories.cntDone / data.stories.cntTotal * 100);
                    }

                    if (stories.length > 0) {
                        fetchStoriesTasks(next);
                    } else {
                        next(null);
                    }
                }
            });
        }

        /**
         * Private function to fetch all tasks that are attached to project stories. This is only
         * called if project contains any stories.
         *
         * @param   {Function}  next    Main callback function which must be called after all is done
         */
        function fetchStoriesTasks(next) {
            var storyIds = _.map(data.stories.data, function(story) {
                return { storyId: story.id };
            });

            DataService.getTasks({or: storyIds}, function(error, tasks) {
                if (error) {
                    next(error);
                } else {
                    data.tasks.data = tasks;
                    data.tasks.cntTotal = tasks.length;
                    data.tasks.cntDone = _.reduce(tasks, function(memo, task) {
                        return (task.isDone) ? memo + 1 : memo;
                    }, 0);

                    if (data.tasks.cntDone > 0) {
                        data.tasks.progress = Math.round(data.tasks.cntDone / data.tasks.cntTotal * 100);
                    }

                    next(null);
                }
            });
        }

        /**
         * Private function makes detailed statistics from fetched data. This function is
         * called right before rendering the statistics GUI.
         *
         * Basically this is just a data "formatter" function that process fetched data and
         * make some basic calculations about those.
         */
        function makeDetailedStatistics() {
            var totalTime = 0;
            var totalTimeNoFirst = 0;

            if (data.phases.length > 0) {
                totalTime =_.pluck(data.phases, "duration").reduce(function(memo, i) {
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
                phase.durationPercentage = (phase.duration > 0 && phase.order !== 0)
                    ? phase.duration / totalTimeNoFirst * 100 : 0;

                phase.durationPercentageTotal = (phase.duration > 0) ? phase.duration / totalTime * 100 : 0;
            });

            _.each(data.stories.data, function(story) {
                story.tasks = {
                    data: [],
                    cntTotal: 0,
                    cntDone: 0,
                    progress: 0
                };

                story.tasks.data = _.filter(data.tasks.data, function(task) {
                    return task.storyId === story.id;
                });

                story.tasks.cntTotal = story.tasks.data.length;

                story.tasks.cntDone = _.reduce(story.tasks.data, function(memo, task) {
                    return (task.isDone) ? memo + 1 : memo;
                }, 0);

                if (story.tasks.cntDone > 0) {
                    story.tasks.progress = Math.round(story.tasks.cntDone / story.tasks.cntTotal * 100);
                }
            });

            // Sort stories by tasks progress, story title and priority
            data.stories.data.sort(HelperService.dynamicSortMultiple("!tasks.progress", "title", "priority"));

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

                sprint.stories.data = _.filter(data.stories.data, function(story) {
                    return story.sprintId === sprint.id;
                });

                sprint.stories.cntTotal = sprint.stories.data.length;

                sprint.stories.cntDone = _.reduce(sprint.stories.data, function(memo, story) {
                    return (story.isDone) ? memo + 1 : memo;
                }, 0);

                if (sprint.stories.cntDone > 0) {
                    sprint.stories.progress = Math.round(sprint.stories.cntDone / sprint.stories.cntTotal * 100);

                    if (sprint.stories.cntDone === sprint.stories.cntTotal) {
                        data.sprints.cntDone = data.sprints.cntDone + 1;
                    }
                }
            });

            // Calculate sprints total progress if we have any done sprint
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

                milestone.stories.data = _.filter(data.stories.data, function(story) {
                    return story.milestoneId === milestone.id;
                });

                milestone.stories.cntTotal = milestone.stories.data.length;

                milestone.stories.cntDone = _.reduce(milestone.stories.data, function(memo, story) {
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
     * Project sprints action. This will render a GUI with project sprint progress and list of
     * those. Within this list user can edit sprints.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    sprints: function(request, response) {
        var projectId = parseInt(request.param("id"), 10);

        var data = {
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
                    AuthService.hasProjectAccess(request.user, projectId, callback, true);
                },

                // Fetch project data.
                project: function(callback) {
                    DataService.getProject(projectId, callback);
                },

                // Fetch project sprint data
                sprints: function(callback) {
                    DataService.getSprints({
                        projectId: projectId
                    }, callback);
                }
            },

            /**
             * Callback function which is been called after all parallel jobs are processed.
             *
             * @param   {null|Error}    error
             * @param   {{
             *              role: sails.helper.role,
             *              project: sails.model.project,
             *              sprints: sails.model.sprint[]
             *          }}              results
             */
            function(error, results) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    data.role = results.role;
                    data.project = results.project;
                    data.sprints = results.sprints;
                    data.cntSprintsTotal = data.sprints.length;

                    // Fetch story data
                    fetchStoryData();
                }
            }
        );

        /**
         * Private function to determine attached story data in current project sprints. This
         * will map each sprints and fetch stories that are attached to them.
         *
         * If stories are found function will call private function to fetch task data of each
         * sprint and determine current status of those.
         */
        function fetchStoryData() {
            async.map(
                data.sprints,

                /**
                 * Iterator function which is called to every sprint that project contains. This will
                 * fetch all attached stories of sprint and after that iterator will call private function
                 * to fetch tasks that are attached to sprint stories.
                 *
                 * @param   {sails.model.sprint}    sprint      Sprint object
                 * @param   {Function}              callback    Callback function to call after job is done
                 */
                function(sprint, callback) {
                    DataService.getStories({sprintId: sprint.id}, function(error, stories) {
                        if (error) {
                            callback(error, null);
                        } else {
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

                            // Fetch task data
                            fetchTaskData(sprint, callback);
                        }
                    });
                },

                /**
                 * Main callback function which will eventually render the GUI for user.
                 *
                 * @param   {null|Error}            error   Possible error
                 * @param   {sails.model.sprint[]}  results Sprint data
                 */
                function(error, results) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
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

                        response.view(data);
                    }
                }
            )
        }

        /**
         * Private function to fetch task data which are attached to current sprint stories.
         *
         * @param   {sails.model.sprint}    sprint  Sprint object
         * @param   {Function}              next    Callback function which must be called after this job
         */
        function fetchTaskData(sprint, next) {
            // Determine story id values for task data fetch
            var storyIds = _.map(sprint.stories, function(story) {
                return { storyId: story.id };
            });

            // We have stories so determine tasks of those stories
            if (storyIds.length > 0) {
                DataService.getTasks({or: storyIds}, function(error, tasks) {
                    if (error) {
                        next(error, null);
                    } else {
                        data.cntTasksTotal = data.cntTasksTotal + tasks.length;
                        data.cntTasksDone = data.cntTasksDone + _.reduce(tasks, function(memo, task) {
                            return (task.isDone) ? memo + 1 : memo;
                        }, 0);

                        // Add tasks to sprint data
                        sprint.tasks = tasks;

                        next(null, sprint);
                    }
                });
            } else { // Oh nou, no stories on this sprint
                sprint.tasks = [];

                next(null, sprint);
            }
        }
    }
};
