/**
 * /api/services/DataService.js
 *
 * Generic data service, which is used to fetch generic data and call defined callback
 * after data fetching.
 */

/**
 * Service to fetch single project data from database.
 *
 * @param   {Number}    projectId   Project id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getProject = function(projectId, callback) {
    Project
        .findOne(projectId)
        .done(function(error, /** sails.model.project */ project) {
            if (error) {
                callback(error, null);
            } else if (!project) {
                var err = new Error();

                err.message = "Project not found.";
                err.status = 404;

                callback(err, null);
            } else {
                callback(null, project);
            }
        });
};

/**
 * Service to fetch single sprint data from database.
 *
 * @param   {Number}    sprintId    Sprint id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getSprint = function(sprintId, callback) {
    Sprint
        .findOne(sprintId)
        .done(function(error, /** sails.model.sprint */ sprint) {
            if (error) {
                callback(error, null);
            } else if (!sprint) {
                var err = new Error();

                err.message = "Sprint not found.";
                err.status = 404;

                callback(err, null);
            } else {
                callback(null, sprint);
            }
        });
};

/**
 * Service to fetch single milestone data from database.
 *
 * @param   {Number}    milestoneId Milestone id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getMilestone = function(milestoneId, callback) {
    Milestone
        .findOne(milestoneId)
        .done(function(error, /** sails.model.milestone */ milestone) {
            if (error) {
                callback(error, null);
            } else if (!milestone) {
                var err = new Error();

                err.message = "Milestone not found.";
                err.status = 404;

                callback(err, null);
            } else {
                callback(null, milestone);
            }
        });
};

/**
 * Service to fetch single story data from database.
 *
 * @param   {Number}    storyId     Story id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getStory = function(storyId, callback) {
    Story
        .findOne(storyId)
        .done(function(error, /** sails.model.story */ story) {
            if (error) {
                callback(error, null);
            } else if (!story) {
                var err = new Error();

                err.message = "Story not found.";
                err.status = 404;

                callback(err, null);
            } else {
                callback(null, story);
            }
        });
};

/**
 * Service to fetch single task data from database.
 *
 * @param   {Number}    taskId      Task id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getTask = function(taskId, callback) {
    Task
        .findOne(taskId)
        .done(function(error, /** sails.model.task */ task) {
            if (error) {
                callback(error, null);
            } else if (!task) {
                var err = new Error();

                err.message = "Task not found.";
                err.status = 404;

                callback(err, null);
            } else {
                callback(null, task);
            }
        });
};

/**
 * Service to fetch single user data from database.
 *
 * @param   {Number}    userId      User id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getUser = function(userId, callback) {
    User
        .findOne(userId)
        .done(function(error, /** sails.model.user */ user) {
            if (error) {
                callback(error, null);
            } else if (!user) {
                var err = new Error();

                err.message = "User not found.";
                err.status = 404;

                callback(err, null);
            } else {
                callback(null, user);
            }
        });
};

/**
 * Service to fetch single phase data from database.
 *
 * @param   {Number}    phaseId     Phase id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getPhase = function(phaseId, callback) {
    Phase
        .findOne(phaseId)
        .done(function(error, /** sails.model.phase */ phase) {
            if (error) {
                callback(error, null);
            } else if (!phase) {
                var err = new Error();

                err.message = "Phase not found.";
                err.status = 404;

                callback(err, null);
            } else {
                callback(null, phase);
            }
        });
};

/**
 * Service to fetch project data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getProjects = function(where, callback) {
    Project
        .find()
        .where(where)
        .sort("title ASC")
        .done(function(error, /** sails.model.project[] */ projects) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, projects);
            }
        });
};

/**
 * Service to fetch milestone data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getMilestones = function(where, callback) {
    Milestone
        .find()
        .where(where)
        .sort("deadline ASC")
        .sort("title ASC")
        .done(function(error, milestones) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, milestones);
            }
        });
};

/**
 * Service to fetch sprint data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getSprints = function(where, callback) {
    Sprint
        .find()
        .where(where)
        .sort("dateStart ASC")
        .done(function(error, sprints) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, sprints);
            }
        });
};

/**
 * Service to fetch story data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getStories = function(where, callback) {
    Story
        .find()
        .where(where)
        .sort("priority ASC")
        .sort("title ASC")
        .done(function(error, stories) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, stories);
            }
        });
};

/**
 * Service to fetch task data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getTasks = function(where, callback) {
    Task
        .find()
        .where(where)
        .sort("title ASC")
        .done(function(error, tasks) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, tasks);
            }
        });
};

/**
 * Service to fetch phase data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getPhases = function(where, callback) {
    Phase
        .find()
        .where(where)
        .sort("title ASC")
        .done(function(error, phases) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, phases);
            }
        });
};

/**
 * Service to fetch user data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getUsers = function(where, callback) {
    User
        .find()
        .where(where)
        .sort("lastName ASC")
        .done(function(error, users) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, users);
            }
        });
};

/**
 * Service to fetch type data from database.
 *
 * @param   {{}}        where       Used query conditions
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getTypes = function(where, callback) {
    Type
        .find()
        .where(where)
        .sort("order ASC")
        .done(function(error, types) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, types);
            }
        });
};

/**
 * Service to fetch specified user sign in data from database.
 *
 * @param   {Number}    userId      User id
 * @param   {Function}  callback    Callback function to call after query
 */
exports.getUserSignInData = function(userId, callback) {
    UserLogin
        .find()
        .where({userId: userId})
        .sort("stamp DESC")
        .done(function(error, data) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, data);
            }
        });
};