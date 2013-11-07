/**
 * StoryController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require("jquery");
var async = require("async");

module.exports = {
    /**
     * Story add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        var projectId = parseInt(req.param("projectId"), 10);
        var sprintId = parseInt(req.param("sprintId"), 10);
        var formData = req.param("formData") || {};

        // Required view data
        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
            projectId: projectId,
            sprintId: sprintId,
            formData: formData,
            milestones: false,
            types: false
        };

        // Fetch project milestones
        Milestone
            .find()
            .where({
                projectId: projectId
            })
            .sort('deadline ASC')
            .done(function(error, milestones) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.milestones = milestones;

                    makeView();
                }
            });

        // Fetch task types
        Type
            .find()
            .sort('order ASC')
            .done(function(error, types) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.types = types;

                    makeView();
                }
            });

        /**
         * Private function to make actual view with specified data.
         */
        function makeView() {
            var ready = true;

            jQuery.each(data, function(key, data) {
                if (data === false) {
                    ready = false;
                }
            });

            if (ready) {
                res.view(data);
            }
        }
    },

    /**
     * Story edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        var storyId = parseInt(req.param('id'), 10);

        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
            story: false,
            milestones: false,
            types: false
        };

        // Fetch story data
        Story
            .findOne(storyId)
            .done(function(error, story) {
                if (error) {
                    res.send(error, 500);
                } else if (!story) {
                    res.send("Story not found.", 404);
                } else {
                    data.story = story;

                    // Fetch project milestones
                    Milestone
                        .find()
                        .where({
                            projectId: data.story.projectId
                        })
                        .sort('deadline ASC')
                        .done(function(error, milestones) {
                            if (error) {
                                res.send(error, 500);
                            } else {
                                data.milestones = milestones;

                                makeView();
                            }
                        });

                    makeView();
                }
            });

        // Fetch task types
        Type
            .find()
            .sort('order ASC')
            .done(function(error, types) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.types = types;

                    makeView();
                }
            });



        /**
         * Private function to make actual view with specified data.
         */
        function makeView() {
            var ready = true;

            jQuery.each(data, function(key, data) {
                if (data === false) {
                    ready = false;
                }
            });

            if (ready) {
                res.view(data);
            }
        }
    },

    /**
     * Story split action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    split: function(req, res) {
        var storyId = parseInt(req.param('storyId'), 10);
        var sprintId = parseInt(req.param('sprintId'), 10);
        var projectId = parseInt(req.param('projectId'), 10);

        if (isNaN(storyId) || isNaN(sprintId) || isNaN(projectId)) {
            res.send("Required input data missing...", 400);
        }

        var data = {
            storyOld: false,
            storyNew: false,
            tasks: [],
            taskCnt: 0
        };

        // Fetch story data
        Story
            .findOne(storyId)
            .done(function(error, /** sails.model.story */story) {
                if (error) {
                    res.send(error, 500);
                } else if (!story) {
                    res.send("Story not found.", 404);
                } else {
                    cloneStory(story)
                }
            });

        /**
         * Private function to clone given story
         *
         * @param   {sails.model.story} story
         */
        function cloneStory(story) {
            // Remove story specified data
            delete story.id;
            delete story.createdAt;
            delete story.updatedAt;

            // Change story sprint data to user selected value
            story.sprintId = sprintId;

            // Create new story
            Story
                .create(story.toJSON())
                .done(function(error, /** sails.model.story */story) {
                    if (error) {
                        res.send(error, 500);
                    } else  {
                        // Send socket message about new story
                        Story.publishCreate(story.toJSON());

                        data.storyNew = story;

                        // Fetch phases which tasks are wanted to move to new story
                        Phase
                            .find()
                            .where({
                                isDone: 0,
                                projectId: projectId
                            })
                            .done(function(error, /** sails.model.phase[] */phases) {
                                if (error) {
                                    res.send(error, 500);
                                } else {
                                    var phaseIds = [];

                                    jQuery.each(phases, function(key, /** sails.model.phase */phase) {
                                        phaseIds.push({phaseId: phase.id});
                                    });

                                    if (phaseIds.length > 0) {
                                        changeTasks(phaseIds);
                                    } else {
                                        finalizeClone();
                                    }
                                }
                            });
                    }
                });
        }

        /**
         * Private function to change tasks story id to new one. Note that
         * we only change tasks which are in specified phase.
         *
         * @param   {Array} phaseIds
         */
        function changeTasks(phaseIds) {
            // Fetch tasks which we want to assign to new story
            Task
                .find()
                .where({
                    storyId: storyId
                })
                .where({
                    or: phaseIds
                })
                .done(function(error, /** sails.model.task[] */tasks) {
                    if (error) {
                        res.send(error, 500);
                    } else {
                        data.taskCnt = tasks.length;

                        if (tasks.length === 0) {
                            finalizeClone();
                        }

                        jQuery.each(tasks, function(key, /** sails.model.task */task) {
                            // Update existing task data, basically just change story id to new one
                            Task
                                .update({
                                    id: task.id
                                },{
                                    storyId: data.storyNew.id
                                }, function(error, task) {
                                    // Error handling
                                    if (error) {
                                        res.send(error, 500);
                                    } else {
                                        // Send socket message about task update
                                        Task.publishUpdate(task[0].id, task[0].toJSON());

                                        data.tasks.push(task[0]);

                                        if (data.taskCnt === data.tasks.length) {
                                            finalizeClone();
                                        }
                                    }
                                });
                        });
                    }
                });
        }

        /**
         * Private function to finalize
         */
        function finalizeClone() {
            // Update story data
            Story
                .update(
                    {id: storyId},
                    {isDone: true},
                    function(error, /** sails.model.story[] */stories) {
                        data.storyOld = stories[0];

                        if (error) {
                            res.send(error, 500);
                        } else {
                            // Send socket message about story update
                            Story.publishUpdate(stories[0].id, stories[0].toJSON());

                            res.send(data);
                        }
                });
        }
    },

    /**
     * Story tasks
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    tasks: function(req, res) {
        var storyId = parseInt(req.param('id'), 10);

        async.parallel(
            {
                // Fetch user role in this story
                role: function(callback) {
                    AuthService.hasStoryAccess(req.user, storyId, callback, true);
                },

                // Fetch story data
                story: function(callback) {
                    DataService.getStory(storyId, callback);
                },

                // Fetch task data for story
                tasks: function(callback) {
                    DataService.getTasks({storyid: storyId}, callback);
                },

                // Fetch user data
                users: function(callback) {
                    DataService.getUsers({}, callback);
                },

                // Fetch types
                types: function(callback) {
                    DataService.getTypes({}, callback);
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
                    DataService.getPhases({projectId: data.story.projectId}, function(error, phases) {
                        if (error) {
                            res.send(error, error.status ? error.status : 500);
                        } else {
                            data.phases = phases;

                            makeView(data);
                        }
                    });
                }
            }
        );

        function makeView(data) {
            data.layout = req.isAjax ? "layout_ajax" : "layout";

            // Add relation data to each tasks
            _.each(data.tasks, function(task) {
                task.type = _.find(data.types, function(type) { return type.id === task.typeId; });
                task.user = _.find(data.users, function(user) { return user.id === task.userId; });
                task.phase = _.find(data.phases, function(phase) { return phase.id === task.phaseId; });
            });

            data.cntTaskTotal = data.tasks.length;
            data.cntTaskDone = _.reduce(data.tasks, function (memo, task) {
                return (task.isDone) ? memo + 1 : memo;
            }, 0);

            if (data.cntTaskDone> 0) {
                data.progressTask = Math.round(data.cntTaskDone  / data.cntTaskTotal * 100);
            } else {
                data.progressTask = 0;
            }

            res.view(data);
        }
    }
};
