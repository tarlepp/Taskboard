/**
 * /api/services/TaskboardInitService.js
 *
 * Taskboard init service. This is called only from config/bootstrap.js file on lifting sails.
 */
"use strict";

var async = require("async");
var moment = require("moment-timezone");

/**
 * Main taskboard app initialize method. Basically this will do following jobs:
 *
 *  - Create admin user, if he/she doesn't exists
 *  - Task types, if those doesn't exists already
 *  - Demo project, if no projects on database
 *
 * Each of these jobs are done in separate TaskboardInitService methods.
 *
 * @param   {Function}  next    Callback function that must be called after all jobs.
 */
exports.init = function(next) {
    // Call all necessary init jobs parallel
    async.parallel(
        {
            // Create admin user account
            admin: function(callback) {
                TaskboardInitService.createAdmin(callback);
            },

            // Create default task types
            types: function(callback) {
                TaskboardInitService.createTypes(callback);
            }
        },

        /**
         * Callback function which is been called after all parallel jobs are processed.
         *
         * @param   {Error} error
         * @param   {{}}    results
         */
        function(error, results) {
            if (error) {
                next(error, null);
            } else {
                // Create demo project if none exists
                TaskboardInitService.initDemoProject(results, next);
            }
        }
    );
};

/**
 * This method creates admin user to database if it doesn't exists already.
 *
 * @param   {Function}  next    Callback function to call after jobs
 */
exports.createAdmin = function(next) {
    User
        .findOne({username: "admin"})
        .exec(function(error, user) {
            if (error) {
                next(error, null);
            } else if (!user) {
                // Create admin user with default data
                User
                    .create({
                        username: "admin",
                        firstName: "John",
                        lastName: "Doe",
                        email: "john.doe@localhost.com",
                        admin: true,
                        password: "taskboardisawesome",
                        createdUserId: 1,
                        updatedUserId: 1
                    })
                    .exec(function(error, user) {
                        next(error, user);
                    });
            } else {
                next(null, user);
            }
        });
};

/**
 * This method creates admin user to database if it doesn't exists already.
 *
 * @param   {Function}  next    Callback function to call after jobs
 */
exports.createTypes = function(next) {
    Type
        .find()
        .exec(function(error, types) {
            if (error) {
                next(error, null);
            } else if (_.size(types) === 0) {
                // Specify "default" type data
                var defaultTypes = [
                    {title: "Task", order: "1", createdUserId: 1, updatedUserId: 1, chartColor: '#548dd4', class: "alert alert-warning", classText: "text-warning"},
                    {title: "Test", order: "2", createdUserId: 1, updatedUserId: 1, chartColor: '#8db3e2', class: "alert alert-success", classText: "text-success"},
                    {title: "Bug",  order: "3", createdUserId: 1, updatedUserId: 1, chartColor: '#92cddc', class: "alert alert-danger",  classText: "text-danger"}
                ];

                // Create default types and pass those to callback function
                async.map(
                    defaultTypes,
                    function(type, callback) {
                        Type
                            .create(type)
                            .exec(function(error, type) {
                                callback(error, type);
                            });
                    },
                    function(error, types) {
                        next(error, types)
                    }
                )
            } else {
                next(null, types);
            }
        });
};

/**
 * This method creates demo project to database. Note that this project is
 * created only if any project doesn't exist in database yet.
 *
 * @param   {{}}        data    Object that contains following data:
 *                               - admin, user object
 *                               - types, array of task type objects
 * @param   {Function}  next    Callback function that must be called after demo project init.
 */
exports.initDemoProject = function(data, next) {
    async.waterfall(
        [
            // Create project
            function(callback) {
                TaskboardInitService.createProject(data, callback);
            },

            // Create phases for project
            function (project, callback) {
                if (!project) {
                    callback(null, null, null);
                } else {
                    TaskboardInitService.createPhases(project, callback);
                }
            },

            // Create sprints
            function(project, phases, callback) {
                if (!project) {
                    callback(null, null, null, null);
                } else {
                    TaskboardInitService.createSprint(project, phases, callback);
                }
            },

            // Create stories
            function(project, phases, sprint, callback) {
                if (!project) {
                    callback(null, null, null, null, null);
                } else {
                    TaskboardInitService.createStories(data, project, phases, sprint, callback);
                }
            },

            // Create tasks
            function(project, phases, sprint, stories, callback) {
                if (!project) {
                    callback(null, null, null, null, null, null);
                } else {
                    TaskboardInitService.createTasks(data, project, phases, sprint, stories, callback);
                }
            }
        ],

        /**
         * Callback function which is been called after all specified jobs are processed.
         *
         * @param   {Error|String}              error
         * @param   {Null|sails.model.project}  project Project object
         * @param   {Null|sails.model.phase[]}  phases  Phase objects as an array
         * @param   {Null|sails.model.sprint}   sprint  Sprint object
         * @param   {Null|sails.model.story[]}  stories Story objects as an array
         * @param   {Null|sails.model.task[]}   tasks   Task objects as an array
         */
        function(error, project, phases, sprint, stories, tasks) {
            var output = {
                project: project,
                phases: phases,
                sprint: sprint,
                stories: stories,
                tasks: tasks
            };

            next(error);
        }
    );
};

/**
 * This method creates a demo project to taskboard if none exists in database.
 *
 * @param   {{}}        data    Object that contains following data:
 *                               - admin, user object
 *                               - types, array of task type objects
 * @param   {Function}  next    Callback function to call after job is finished
 */
exports.createProject = function(data, next) {
    Project
        .find()
        .exec(function(error, projects) {
            if (error) {
                next(error, null);
            } else if (_.size(projects) === 0) { // No project(s) found create demo project
                // Specify demo project data
                var projectData = {
                    managerId: data.admin.id,
                    title: "Demo project",
                    description: "This is a demo project, which is created automatic if any other projects doesn't exists yet.",
                    dateStart: moment().format("YYYY-MM-DD"),
                    dateEnd: moment().add("years", 1).format("YYYY-MM-DD"),
                    createdUserId: 1,
                    updatedUserId: 1
                };

                // Create demo project
                Project
                    .create(projectData)
                    .exec(function(error, project) {
                        next(error, project);
                    });
            } else { // Database contains projects so skip demo project init
                next(null, null);
            }
        });
};

/**
 * This method creates phases for specified project.
 *
 * @param   {sails.model.project}   project Project object
 * @param   {Function}              next    Callback function to call after job is finished
 */
exports.createPhases = function(project, next) {
    // Specify project phase data
    var phaseData = [
        {projectId: project.id, createdUserId: 1, updatedUserId: 1, title: "Tasks",      backgroundColor: "#c6d9f0", order: 1, tasks: 0, isDone: false},
        {projectId: project.id, createdUserId: 1, updatedUserId: 1, title: "In process", backgroundColor: "#92cddc", order: 2, tasks: 3, isDone: false},
        {projectId: project.id, createdUserId: 1, updatedUserId: 1, title: "To review",  backgroundColor: "#8db3e2", order: 3, tasks: 3, isDone: false},
        {projectId: project.id, createdUserId: 1, updatedUserId: 1, title: "Reviewed",   backgroundColor: "#548dd4", order: 4, tasks: 6, isDone: false},
        {projectId: project.id, createdUserId: 1, updatedUserId: 1, title: "Done",       backgroundColor: "#0070c0", order: 5, tasks: 0, isDone: true}
    ];

    // Create specified phases
    async.map(
        phaseData,

        /**
         * Iterator function which will create specified phase.
         *
         * @param   {sails.model.phase} phase
         * @param   {Function}          callback
         */
        function(phase, callback) {
            Phase
                .create(phase)
                .exec(function(error, story) {
                    callback(error, story);
                });
        },

        /**
         * Main callback function which is called after all specified phases are iterated.
         *
         * @param   {Error|null}            error
         * @param   {sails.model.phase[]}   phases
         */
        function(error, phases) {
            next(error, project, phases);
        }
    );
};

/**
 * This method creates sprints for specified demo project.
 *
 * @param   {sails.model.project}   project Project object
 * @param   {sails.model.phase[]}   phases  Array of phase objects
 * @param   {Function}              next    Callback function to call after job is finished
 */
exports.createSprint = function(project, phases, next) {
    // Specify sprint data
    var sprintData = {
        projectId: project.id,
        title: "First sprint",
        description: "This is a first sprint in demo project.",
        dateStart: moment(project.dateStart).format("YYYY-MM-DD"),
        dateEnd: moment(project.dateStart).add("days", 30).format("YYYY-MM-DD"),
        createdUserId: 1,
        updatedUserId: 1
    };

    // Create new sprint
    Sprint
        .create(sprintData)
        .exec(function(error, sprint) {
            next(error, project, phases, sprint);
        });
};

/**
 * Method creates stories to default stories to demo project and assign those to
 * specified demo sprint and project backlog.
 *
 * @param   {{}}                    data    Object that contains following data:
 *                                           - admin, user object
 *                                           - types, array of task type objects
 * @param   {sails.model.project}   project Project object
 * @param   {sails.model.phase[]}   phases  Array of phase objects
 * @param   {sails.model.sprint}    sprint  Sprint object
 * @param   {Function}              next    Callback function to call after job is finished
 */
exports.createStories = function(data, project, phases, sprint, next) {
    var typeTask = _.find(data.types, function(type) { return type.title === "Task"; });

    // Specify story data
    var storyData = [
        {
            projectId: project.id,
            sprintId: sprint.id,
            milestoneId: 0,
            typeId: typeTask.id,
            title: "My first user story",
            description: "This is a basic user story where you can add new tasks.",
            estimate: 5,
            priority: 1,
            createdUserId: 1,
            updatedUserId: 1
        },
        {
            projectId: project.id,
            sprintId: sprint.id,
            milestoneId: 0,
            typeId: typeTask.id,
            title: "Another user story",
            description: "You can add new user stories to current sprint by clicking '+' button on the board header row.",
            estimate: -1,
            priority: 2,
            createdUserId: 1,
            updatedUserId: 1
        },
        {
            projectId: project.id,
            sprintId: 0,
            milestoneId: 0,
            typeId: typeTask.id,
            title: "Planned user story",
            description: "This user story has no relation to any existing sprint, so it is in project backlog, where you can prioritize it.",
            estimate: 5,
            priority: 1,
            createdUserId: 1,
            updatedUserId: 1
        }
    ];

    // Create specified user stories
    async.map(
        storyData,

        /**
         * Iterator function which is called for every specified story object.
         *
         * @param   {sails.model.story} story
         * @param   {Function}          callback
         */
        function(story, callback) {
            Story
                .create(story)
                .exec(function(error, story) {
                    callback(error, story);
                });
        },

        /**
         * Main callback function which is called after all specified stories are created.
         *
         * @param   {Error|null}            error
         * @param   {sails.model.story[]}   stories
         */
        function(error, stories) {
            next(error, project, phases, sprint, stories);
        }
    );
};

/**
 * Method creates some demo tasks to specified project sprint.
 *
 * @param   {{}}                    data    Object that contains following data:
 *                                           - admin, user object
 *                                           - types, array of task type objects
 * @param   {sails.model.project}   project Project object
 * @param   {sails.model.phase[]}   phases  Array of phase objects
 * @param   {sails.model.sprint}    sprint  Sprint object
 * @param   {sails.model.story[]}   stories Array of story objects
 * @param   {Function}              next    Callback function to call after job is finished
 */
exports.createTasks = function(data, project, phases, sprint, stories, next) {
    var typeTask = _.find(data.types, function(type) { return type.title === "Task"; });
    var typeTest = _.find(data.types, function(type) { return type.title === "Test"; });
    var typeBug = _.find(data.types, function(type) { return type.title === "Bug"; });
    var phaseFirst = _.find(phases, function(phase) { return phase.title === "Tasks"; });
    var storyFirst = _.find(stories, function(story) { return story.title === "My first user story"; });

    // Specify task data
    var taskData = [
        {
            storyId: storyFirst.id,
            userId: data.admin.id,
            phaseId: phaseFirst.id,
            typeId: typeTask.id,
            title: "Normal task",
            description: "This is a 'normal' task, which you can drag around the board.",
            createdUserId: 1,
            updatedUserId: 1
        },
        {
            storyId: storyFirst.id,
            userId: data.admin.id,
            phaseId: phaseFirst.id,
            typeId: typeTest.id,
            title: "Test task",
            description: "This is a 'test' task, usually this means writing some kind of test to this user story.",
            createdUserId: 1,
            updatedUserId: 1
        },
        {
            storyId: storyFirst.id,
            userId: data.admin.id,
            phaseId: phaseFirst.id,
            typeId: typeBug.id,
            title: "Major bug in app",
            description: "This is a 'bug' task, you can track bugs with these tasks in each user story.",
            createdUserId: 1,
            updatedUserId: 1
        }
    ];

    // Create specified tasks
    async.map(
        taskData,

        /**
         * Iterator function to create specified task to database.
         *
         * @param   {sails.model.task}  task
         * @param   {Function}          callback
         */
        function(task, callback) {
            Task
                .create(task)
                .exec(function(error, task) {
                    callback(error, task);
                });
        },

        /**
         * Main callback function which is called after all specified tasks are created.
         *
         * @param   {Error|null}            error
         * @param   {sails.model.task[]}    tasks
         */
        function(error, tasks) {
            next(error, project, phases, sprint, stories, tasks);
        }
    );
};