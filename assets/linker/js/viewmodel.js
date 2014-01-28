/**
 * /assets/linker/js/viewmodel.js
 *
 * @file Taskboard application knockout view model.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */

/**
 * Actual TaskBoard knockout view model object. This contains all necessary data for application.
 *
 * Note that this object is accessible via myViewModel variable in all javascript code.
 *
 * @constructor
 */
function ViewModel() {
    var self = this;
    var body = jQuery("body");

    // Cannot continue...
    if (typeof selectedProjectId === 'undefined'
        || typeof selectedSprintId === 'undefined'
        || typeof loggedUserId === 'undefined'
    ) {
        return;
    }

    // Specify used observable data

    // Base application observable data
    self.users      = ko.observableArray([]);
    self.types      = ko.observableArray([]);
    self.projects   = ko.observableArray([]);

    // Project related observable data
    self.phases     = ko.observableArray([]);   // This is updated when ever user changes project
    self.sprints    = ko.observableArray([]);   // This is updated when ever user changes project
    self.stories    = ko.observableArray([]);   // This is updated when ever user changes sprint
    self.tasks      = ko.observableArray([]);   // This is updated when ever user changes sprint

    // Selected project and sprint objects
    self.project    = ko.observable();
    self.sprint     = ko.observable();

    // Current user observable data
    self.user       = ko.observable(new User(userObject));

    /**
     * User role in current project
     *
     *  -3 = User is administrator
     *  -2 = Project manager (primary)
     *  -1 = Project manager
     *   0 = Only view rights
     *   1 = Normal user
     */
    self.role = ko.observable(0);

    // Observables for different logic contexts
    self.moveInProcess = ko.observable(false);

    // Selected id values, todo: are these really needed?
    self.selectedProjectId = ko.observable(selectedProjectId);
    self.selectedSprintId = ko.observable(selectedSprintId);

    // Loading observable, just push something to this if you're loading data, and afterwards just pop it out - simple
    self.loading = ko.observableArray([]);

    self.noProjectData = ko.observable(false);

    // Push data to loading state
    self.loading.push(true);

    // Get type data via socket
    socket.get("/Type", function(types) {
        if (handleSocketError(types)) {
            var mappedTypes = ko.utils.arrayMap(types, function(/** sails.json.type */type) {
                return new Type(type);
            });

            self.types(mappedTypes);

            body.trigger("initializeCheck", "types");
        }

        self.loading.pop();
    });


    // Push data to loading state
    self.loading.push(true);

    // Get user data via socket
    socket.get("/User", function(users) {
        if (handleSocketError(users)) {
            var mappedUsers = ko.utils.arrayMap(users, function(/** sails.json.user */user) {
                return new User(user);
            });

            self.users(mappedUsers);

            body.trigger("initializeCheck", "users");
        }

        self.loading.pop();
    });


    // Push data to loading state
    self.loading.push(true);

    // Get project data via socket
    socket.get("/ProjectUser/OwnProjects/", function(projects) {
        if (handleSocketError(projects)) {
            if (!projects || projects.length === 0) {
                self.noProjectData(true);
            }

            var mappedProjects = ko.utils.arrayMap(projects, function(/** sails.json.project */project) {
                return new Project(project);
            });

            self.projects(mappedProjects);

            body.trigger("initializeCheck", "projects");

            if (self.selectedProjectId() > 0) {
                self.initProject(self.selectedProjectId());
            }

            var selectProject = jQuery("#selectProject");

            selectProject.val(self.selectedProjectId());

            selectProject.find("option").each(function() {
                var option = jQuery(this);

                if (option.text() == "Choose project to show") {
                    option.addClass("select-dummy-option text-muted");
                }
            });

            selectProject.selectpicker("refresh");
        }

        self.loading.pop();
    });

    // Sorted project objects
    self.sortedProjects = ko.computed(function() {
        return self.projects().sort(function(a, b) {
            return a.title().toString().toLowerCase() > b.title().toString().toLowerCase() ? 1 : -1;
        });
    });

    // Sorted sprint objects
    self.sortedSprints = ko.computed(function() {
        return self.sprints().sort(function(a, b) {
            return a.dateStart() > b.dateStart() ? -1 : 1;
        });
    });

    // Sorted story objects
    self.sortedStories = ko.computed(function() {
        return self.stories().sort(function(a, b) {
            return a.priority() > b.priority() ? 1 : -1;
        });
    });

    // Sorted phases
    self.sortedPhases = ko.computed(function() {
        return self.phases().sort(function(a, b) {
            return a.order() > b.order() ? 1 : -1;
        });
    });

    // Sorted tasks
    self.sortedTasks = ko.computed(function() {
        return self.tasks().sort(function(a, b) {
            return a.priority() > b.priority() ? 1 : -1;
        });
    });

    /**
     * Project initialize method. This method is called when ever user changes project selection.
     *
     * @param   {Number}    projectId
     */
    self.initProject = function(projectId) {
        // Reset project specified data
        self.resetProject();

        // Search project
        var project = _.find(self.projects(), function(project) { return project.id() === projectId; });

        // We have a real project
        if (typeof project !== "undefined") {
            self.project(project);

            // Push data to loading state
            self.loading.push(true);

            // Get project phase data via socket
            socket.get("/Phase", {projectId: projectId}, function(phases) {
                if (handleSocketError(phases)) {
                    var mappedPhases = ko.utils.arrayMap(phases, function(/** sails.json.phase */phase) {
                        return new Phase(phase);
                    });

                    self.phases(mappedPhases);

                    body.trigger("initializeCheck", "phases");
                }

                self.loading.pop();
            });


            // Push data to loading state
            self.loading.push(true);

            // Get project sprint data via socket
            socket.get("/Sprint", {projectId: projectId}, function(sprints) {
                if (handleSocketError(sprints)) {
                    var mappedSprints = ko.utils.arrayMap(sprints, function(/** sails.json.sprint */sprint) {
                        return new Sprint(sprint);
                    });

                    self.sprints(mappedSprints);

                    if (self.selectedSprintId() > 0) {
                        self.initSprint(self.selectedSprintId());
                    }

                    var selectSprint = jQuery("#selectSprint");

                    selectSprint.val(self.selectedSprintId());

                    selectSprint.find("option").each(function() {
                        var option = jQuery(this);

                        if (option.text() == "Choose sprint to show") {
                            option.addClass("select-dummy-option text-muted");
                        }
                    });

                    selectSprint.selectpicker("refresh");
                }

                self.loading.pop();
            });


            // Push data to loading state
            self.loading.push(true);

            // Get user role in this project
            socket.get("/ProjectUser/getRole", {projectId: projectId}, function(role) {
                if (handleSocketError(role)) {
                    self.role(role);
                }

                self.loading.pop();
            });
        }
    };

    /**
     * Sprint initialize method. This method is called when ever user changes project selection.
     *
     * @param   {Number}    sprintId
     */
    self.initSprint = function(sprintId) {
        // Reset sprint data
        self.resetSprint();

        // Search sprint
        var sprint = _.find(self.sprints(), function(sprint) { return sprint.id() === sprintId; });

        // We have a real sprint
        if (typeof sprint !== "undefined") {
            self.sprint(sprint);

            // Push data to loading state
            self.loading.push(true);

            // Add current project + sprint to history state of browser
            window.history.pushState("", "Taskboard", "/board/" + self.project().id() + "/sprint/" + sprintId);

            // Get sprint stories via socket
            socket.get("/Story", {sprintId: sprintId}, function(stories) {
                if (handleSocketError(stories)) {
                    var storyIds = [];

                    var mappedStories = ko.utils.arrayMap(stories, function(/** sails.json.story */story) {
                        storyIds.push({storyId: story.id});

                        return new Story(story);
                    });

                    self.stories(mappedStories);

                    body.trigger("initializeCheck", "stories");

                    self.loading.pop();

                    // We have stories, so fetch tasks to them
                    if (_.size(storyIds) > 0) {
                        self.loading.push(true);

                        // Get story task data via socket
                        socket.get('/Task', {where: {or: storyIds}}, function(tasks) {
                            if (handleSocketError(stories)) {
                                var mappedTasks = ko.utils.arrayMap(tasks, function(/** sails.json.task */task) {
                                    return new Task(task);
                                });

                                self.tasks(mappedTasks);

                                fixBoardWidth();
                            }

                            self.loading.pop();
                        });
                    }
                }
            });
        }
    };


    /**
     * Method to reset all projects related data.
     *
     * Note that method also calls sprint reset.
     */
    self.resetProject = function() {
        // Reset project related data
        self.phases([]);
        self.sprints([]);
        self.project(false);
        self.role(0);

        self.resetSprint();
    };

    /**
     * Method to reset all sprint related data.
     */
    self.resetSprint = function() {
        // Reset sprint related data
        self.stories([]);
        self.tasks([]);
        self.sprint(false);
    };


    /**
     * Method returns used task template in board cell, used template is changed
     * if cell contains more than five tasks.
     *
     * @param   {Number}    phaseId Phase id
     * @param   {Number}    storyId Story id
     *
     * @returns {string}
     */
    self.getTaskTemplate = function(phaseId, storyId) {
        return (_.size(self.getTasks(phaseId, storyId)) > self.user().taskTemplateChangeLimit())
            ? 'task-template-small' : 'task-template-normal';
    };

    /**
     * Method returns tasks for asked story and phase.
     *
     * @param   {Number}    phaseId Phase id
     * @param   {Number}    storyId Story id
     *
     * @returns {Array}
     */
    self.getTasks = function(phaseId, storyId) {
        var output = [];

        for (var i = 0; i < self.tasks().length; i++) {
            var task = self.tasks()[i];

            if (task.storyId() === storyId && task.phaseId() === phaseId) {
                output.push(task);
            }
        }

        return output;
    };


    /**
     * Task draggable start callback function, basically we want to tell knockout that
     * we are moving some task in the board and hide all tooltips.
     *
     * @param   {jQuery.Event}  event   Event object
     * @param   {Object}        ui      UI object
     */
    self.taskDraggableStartCallback = function(event, ui) {
        self.moveInProcess(true);

        // This is to prevent canceled draggable
        setTimeout(function() {
            self.moveInProcess(false);
        }, 5000);

        jQuery('.qtip.qtip-bootstrap').qtip('hide');
    };

    /**
     * Task draggable before move callback function, basically we want to prevent
     * move for users who are only viewers in current project.
     *
     * @param   {knockout.sortable.arg} arg     Knockout sortable binding handler arguments
     * @param   {jQuery.Event}          event   Event object
     * @param   {Object}                ui      UI object
     */
    self.taskDraggableBeforeMoveCallback = function(arg, event, ui) {
        if (self.role() === 0) {
            self.moveInProcess(false);

            arg.cancelDrop = true;

            makeMessage("Insufficient rights to move tasks in this project.", "error");
        }
    };

    /**
     * Task draggable after move callback function, basically we want to prevent
     * move for users who are only viewers in current project. This is basically
     * done already but I want to be sure...
     *
     * If user has proper role to move tasks, method will update task data over
     * socket and after that update knockout bindings automatic.
     *
     * @param   {knockout.sortable.arg} arg     Knockout sortable binding handler arguments
     * @param   {jQuery.Event}          event   Event object
     * @param   {Object}                ui      UI object
     */
    self.taskDraggableAfterMoveCallback = function(arg, event, ui) {
        self.moveInProcess(false);

        // User don't have necessary role to move tasks
        if (self.role() === 0) {
            makeMessage("Insufficient rights to move tasks in this project.", "error");
        } else { // Otherwise proceed to update task data
            var context = ko.contextFor(this);
            var phase = ko.toJS(context.$data);

            // Update task data
            socket.put('/Task/' + arg.item.id(), {phaseId: phase.id, _csrf: getCsrfToken()}, function(/** sails.json.task */response) {
                if (handleSocketError(response, true)) {
                    // all was ok, nice!
                }
            });
        }
    };

    /**#@+
     * Project specified actions that can be triggered via knockout bindings.
     */

    // Method to trigger new project adding dialog.
    self.actionProjectAdd = function() {
        body.trigger("projectAdd");
    };

    // Method opens project edit.
    self.actionProjectEdit = function() {
        body.trigger("projectEdit", [self.project().id()]);
    };

    // Method opens project backlog
    self.actionProjectBacklog = function() {
        body.trigger("projectBacklog", [self.project().id()]);
    };

    // Method opens project planning view.
    self.actionProjectPlanning = function() {
        body.trigger("projectPlanning", [self.project().id()]);
    };

    // Method opens project milestone list dialog
    self.actionProjectMilestones = function() {
        body.trigger("projectMilestones", [self.project().id()]);
    };

    // Method opens project users dialog
    self.actionProjectUsers = function() {
        body.trigger("projectUsers", [self.project().id()]);
    };

    // Method opens project sprints
    self.actionProjectSprints = function() {
        body.trigger("projectSprints", [self.project().id()]);
    };

    // TODO
    self.actionProjectDelete = function() {
        if (self.role() < -1) {
            body.trigger("projectDelete", [self.project().id()]);
        } else {
            makeMessage("Insufficient rights to delete project.", "error");
        }
    };

    /**#@-*/


    /**#@+
     * Sprint specified actions that can be triggered via knockout bindings.
     */

    // Method opens sprint add
    self.actionSprintAdd = function() {
        if (self.role() < 0) {
            body.trigger("sprintAdd");
        } else {
            makeMessage("Insufficient rights to add new sprint to this project.", "error");
        }
    };

    // Method opens sprint edit
    self.actionSprintEdit = function() {
        body.trigger('sprintEdit', [self.sprint().id()]);
    };

    //Method opens sprint delete
    self.actionSprintDelete = function() {
        if (self.role() < 0) {
            body.trigger('sprintDelete', [self.sprint().id()]);
        } else {
            makeMessage("Insufficient rights to delete sprints in this project.", "error");
        }
    };

    // Method opens sprint backlog
    self.actionSprintBacklog = function() {
        body.trigger('sprintBacklog', [self.sprint().id()]);
    };

    // Method opens sprint charts
    self.actionSprintCharts = function() {
        body.trigger('sprintCharts', [self.sprint().id()]);
    };

    /**#@-*/


    /**
     * Method to trigger new story add dialog.
     *
     * @param   {Number}    projectId   Project ID
     * @param   {Number}    sprintId    Sprint ID
     */
    self.actionStoryAdd = function(projectId, sprintId) {
        if (self.role() === 0) {
            makeMessage("Insufficient rights to add new story to this project.", "error");
        } else {
            jQuery("body").trigger("storyAdd", [projectId, sprintId]);
        }
    };

    /**
     * Method opens project phases admin.
     *
     * Note that this needs project data.
     */
    self.actionPhasesEdit = function() {
        if (self.role() < 0) {
            jQuery("body").trigger("phasesEdit");
        } else {
            makeMessage("Insufficient rights to edit project phases.", "error");
        }
    };

    /**
     * Method opens user list view.
     *
     * Note that this action is allowed only for administrator users.
     */
    self.usersOpen = function() {
        jQuery("body").trigger("userList");
    };

    /**
     * Method to release task from specified user.
     *
     * @param   {number}    taskId
     */
    self.releaseTask = function(taskId) {
        jQuery.ajax({
            type: "POST",
            url: "/Task/releaseTask/",
            data: {
                id: taskId,
                _csrf: getCsrfToken()
            },
            dataType: "json"
        })
        .done(function(data) {
            // All ok, this is just fine :D
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    };

    /**
     * Method to take specified task ownership to user.
     *
     * @param   {number}    taskId
     */
    self.takeTask = function(taskId) {
        jQuery.ajax({
            type: "POST",
            url: "/Task/takeTask/",
            data: {
                id: taskId,
                _csrf: getCsrfToken()
            },
            dataType: "json"
        })
        .done(function(data) {
            // All ok, this is just fine :D
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    };

    /**
     * Method to process all socket messages. Basically this will update specified
     * knockout bindings according to message type.
     *
     * @param   {String}    model   Name of the model
     * @param   {String}    type    Message type; update, create, destroy
     * @param   {Number}    id      Object data id
     * @param   {
     *          sails.json.phase|
     *          sails.json.project|
     *          sails.json.sprint|
     *          sails.json.story|
     *          sails.json.task|
     *          sails.json.user
     *          }                   data    Object data
     */
    self.processSocketMessage = function(model, type, id, data) {
        console.log("Processing socket message for: '" + model + "' type: '" + type + "' id: '" + id + "'");

        var updateSelects = false;

        switch (type) {
            // Update events
            case 'update':
                switch (model) {
                    case 'project':
                        var project = _.find(self.projects(), function(project) { return project.id() === id; });

                        if (typeof project != 'undefined') {
                            self.projects.replace(project, new Project(data));
                        }

                        updateSelects = true;
                        break;
                    case 'phase':
                        //noinspection JSDuplicatedDeclaration
                        var phase = _.find(self.phases(), function(phase) { return phase.id() === id; });

                        if (typeof phase !== 'undefined') {
                            self.phases.replace(phase, new Phase(data));
                        }
                        break;
                    case 'sprint':
                        //noinspection JSDuplicatedDeclaration
                        var sprint = _.find(self.sprints(), function(sprint) { return sprint.id() === id; });

                        if (typeof sprint !== 'undefined') {
                            self.sprints.replace(sprint, new Sprint(data));

                            updateSelects = true;
                        }
                        break;
                    case 'story':
                        //noinspection JSDuplicatedDeclaration
                        var story = _.find(self.stories(), function(story) { return story.id() === id; });

                        if (typeof story !== 'undefined') {
                            self.stories.replace(story, new Story(data));
                        }
                        break;
                    case 'task':
                        //noinspection JSDuplicatedDeclaration
                        var task = _.find(self.tasks(), function(task) { return task.id() === id; });

                        if (typeof task != 'undefined') {
                            self.tasks.replace(task, new Task(data));

                            //noinspection JSDuplicatedDeclaration
                            var story = _.find(self.stories(), function(story) { return story.id() === data.storyId; });

                            self.stories.replace(story, _.clone(story));
                        }
                        break;
                    case 'user':
                        //noinspection JSDuplicatedDeclaration
                        var user = _.find(self.users(), function(user) { return user.id() === id; });

                        if (typeof user != 'undefined') {
                            self.users.replace(user, new User(data));
                        }

                        // User itself has been updated
                        if (id === self.user().id()) {
                            var currentTaskTemplateChangeLimit = self.user().taskTemplateChangeLimit();

                            // Create new current user object and replace existing one
                            self.user(new User(data));

                            // We need to update selects in this case (date formats...)
                            updateSelects = true;

                            // Weird this should be handled via valueHasMutated this will trigger task template change
                            if (currentTaskTemplateChangeLimit !== self.user().taskTemplateChangeLimit()) {
                                _.each(self.stories(), function(story) {
                                    self.stories.replace(story, _.clone(story));
                                });
                            }

                            // Change moment.js / numeral.js language
                            moment.lang(data.language);
                            numeral.language(data.language);
                        }
                        break;
                    default:
                        console.log("implement update for " + model);
                        break;
                }
                break;
            // Create events
            case 'create':
                switch (model) {
                    case 'project':
                        self.projects.push(new Project(data));

                        updateSelects = true;
                        break;
                    case 'phase':
                        if (self.project().id() === data.projectId) {
                            self.phases.push(new Phase(data));
                        }
                        break;
                    case 'sprint':
                        if (self.project().id() === data.projectId) {
                            self.sprints.push(new Sprint(data));

                            updateSelects = true;
                        }
                        break;
                    case 'story':
                        if (self.sprint().id() === data.sprintId) {
                            self.stories.push(new Story(data));
                        }
                        break;
                    case 'task':
                        //noinspection JSDuplicatedDeclaration
                        var story = _.find(self.stories(), function(story) { return story.id() === data.storyId; });

                        if (typeof story !== 'undefined') {
                            self.tasks.push(new Task(data));

                            self.stories.replace(story, _.clone(story));
                        }
                        break;
                    case 'user':
                        self.users.push(new User(data));
                        break;
                    default:
                        console.log("implement create for " + model);
                        break;
                }
                break;
            // Destroy events
            case 'destroy':
                switch (model) {
                    case 'phase':
                        //noinspection JSDuplicatedDeclaration
                        var phase = _.find(self.phases(), function(phase) { return phase.id() === id; });

                        if (typeof phase !== 'undefined') {
                            self.phases.remove(phase);
                        }
                        break;
                    case 'sprint':
                        //noinspection JSDuplicatedDeclaration
                        var sprint = _.find(self.sprints(), function(sprint) { return sprint.id() === id; });

                        if (typeof sprint !== 'undefined') {
                            if (myViewModel.sprint().id() === sprint.id) {
                                myViewModel.resetSprint();
                            }

                            self.sprints.remove(sprint);

                            updateSelects = true;
                        }
                        break;
                    case 'story':
                        //noinspection JSDuplicatedDeclaration
                        var story = _.find(self.stories(), function(story) { return story.id() === id; });

                        if (typeof story !== 'undefined') {
                            self.stories.remove(story);
                        }
                        break;
                    case 'task':
                        //noinspection JSDuplicatedDeclaration
                        var task = _.find(self.tasks(), function(task) { return task.id() === id; });

                        if (typeof task !== 'undefined') {
                            self.tasks.remove(task);

                            //noinspection JSDuplicatedDeclaration
                            var story = _.find(self.stories(), function(story) { return story.id() === task.storyId(); });

                            self.stories.replace(story, _.clone(story));
                        }
                        break;
                    default:
                        console.log("implement destroy for " + model);
                        break;
                }
                break;
            default:
                console.log("implement type " + type);
                break;
        }

        if (updateSelects) {
            jQuery("#selectProject").selectpicker("refresh");
            jQuery("#selectSprint").selectpicker("refresh");
        }
    };
}

/**
 * Create new Taskboard application view model.
 *
 * @type {ViewModel}
 */
var myViewModel = new ViewModel();

ko.applyBindings(myViewModel);
