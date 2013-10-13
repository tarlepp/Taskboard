/**
 * ProjectController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require("jquery");
var async = require("async");

module.exports = {
    /**
     * Project add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

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
                    data.layout = "layout_ajax";

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
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

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
                    data.layout = "layout_ajax";

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
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

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
                    data.layout = "layout_ajax";

                    res.view(data);
                }
            }
        );
    },

    /**
     * Project milestones action
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    milestones: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

        var projectId = parseInt(req.param("id"), 10);

        var data = {
            layout: "layout_ajax",
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
                    DataService.getMilestones({
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
                jQuery.each(data.milestones, function(key, /** sails.model.milestone */milestone) {
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

            jQuery.each(data, function(key, data) {
                if (data === false) {
                    ok = false;
                }
            });

            if (ok) {
                if (data.milestones.length > 0) {
                    var show = true;

                    jQuery.each(data.milestones, function(key, /** sails.model.milestone */milestone) {
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
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

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
                 * Fetch project story data
                 *
                 * @param   {Function}  callback
                 */
                stories: function(callback) {
                    DataService.getStories({
                        projectId: projectId
                    }, callback);
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
             * @param   {{}}            data
             */
            function(error, data) {
                if (error) {
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.layout = "layout_ajax";

                    res.view(data);
                }
            }
        );
    },

    /**
     * Project statistics action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    statistics: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('id'), 10);

        // Specify template data to use
        var data = {
            layout: "layout_ajax",
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
                    DataService.getMilestones({
                        projectId: projectId
                    }, callback);
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
                    res.send(error, error.status ? error.status : 500);
                } else {
                    data.project.data = results.project;

                    data.milestones.data = results.milestones;
                    data.milestones.cntTotal = results.milestones.length;

                    data.sprints.data = results.sprints;
                    data.sprints.cntTotal = results.sprints.length;

                    fetchStories();
                }
            }
        );

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

                                    makeView();
                                });
                        } else {
                            makeView();
                        }
                    }
                });
        }

        /**
         * Function makes actual view if all necessary data is fetched
         * from database for template.
         */
        function makeView() {
            var ok = true;

            jQuery.each(data, function(key, data) {
                if (data.data === false) {
                    ok = false;
                }
            });

            if (ok) {
                makeDetailedStatistics();

                res.view(data);
            }
        }

        /**
         * Function makes detailed statistics from fetched data.
         */
        function makeDetailedStatistics() {
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
    }
};
