/**
 * Project change binding handler, this is activated when
 * user changes project selection.
 *
 * @type {{init: Function}}
 */
ko.bindingHandlers.changeProject = {
    /**
     * Init function for project change.
     *
     * @param   {String}    element             Name of the current element
     * @param               valueAccessor
     * @param               allBindingsAccessor
     * @param   {ViewModel} viewModel
     */
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var elementProject = jQuery(element);

        // Actual change event is triggered
        elementProject.change(function() {
            var projectId = parseInt(elementProject.val(), 10);

            // Seems like a real project
            if (!isNaN(projectId)) {
                viewModel.initProject(projectId);
            }
        });
    },
    /**
     * Update function for project change
     *
     * @param   {String}    element         Name of the current element
     * @param               valueAccessor
     */
    update:function (element, valueAccessor) {
        jQuery(element).find('option').each(function() {
            var option = jQuery(this);

            if (option.text() == 'Choose project to show') {
                option.addClass('select-dummy-option text-muted');
            }
        });

        jQuery(element).selectpicker('refresh');
    }
};

/**
 * Sprint change binding handler, this is activated when
 * user changes sprint selection.
 *
 * @type {{init: Function}}
 */
ko.bindingHandlers.changeSprint = {
    /**
     * Init function for sprint change.
     *
     * @param   {String}    element             Name of the current element
     * @param               valueAccessor
     * @param               allBindingsAccessor
     * @param   {ViewModel} viewModel
     */
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var elementSprint = jQuery(element);

        elementSprint.change(function() {
            var sprintId = parseInt(elementSprint.val(), 10);

            if (!isNaN(sprintId)) {
                viewModel.initSprint(sprintId);
            }
        });
    },
    /**
     * Update function for sprint change
     *
     * @param   {String}    element         Name of the current element
     * @param               valueAccessor
     */
    update: function (element, valueAccessor) {
        jQuery(element).find('option').each(function() {
            var option = jQuery(this);

            if (option.text() == 'Choose sprint to show') {
                option.addClass('select-dummy-option text-muted');
            }
        });

        jQuery(element).selectpicker('refresh');
    }
};

/**
 * qTip knockout bindings.
 *
 * @type {{init: Function, update: Function}}
 */
ko.bindingHandlers.qtip = {
    init: function (element, valueAccessor) {
        var settings = ko.utils.unwrapObservable(valueAccessor()) || {};

        if (!jQuery.isEmptyObject(settings)) {
            // Add a class so we can search for all elements that have a Qtip
            // This is used in the jqDialog Binding so we can hide and destroy all Qtips associated with elements in a dialog
            jQuery(element).addClass('generated_qtip');

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                try {
                    jQuery(element).qtip("api").hide();
                    jQuery(element).qtip("api").destroy();
                    jQuery(element).removeClass('generated_qtip');
                } catch (err) {
                    // There was no Qtip defined on the element yet
                }
            });
        }
    },
    update: function (element, valueAccessor) {
        var settings = ko.utils.unwrapObservable(valueAccessor()) || {};

        if (!jQuery.isEmptyObject(settings)) {
            var textValue = ko.utils.unwrapObservable(settings.text);

            if (textValue) {
                try {
                    jQuery(element).qtip("api").hide();
                    jQuery(element).qtip("api").destroy();
                    jQuery(element).removeClass('generated_qtip');
                }
                catch (err) {
                    // There was no Qtip defined on the element yet
                }

                var options = settings.options ? settings.options : {};
                var width = settings.width ? settings.width : 'auto';

                jQuery(element).qtip(
                    jQuery.extend(
                        {},
                        {
                            content: {
                                title: settings.title,
                                text: textValue
                            },
                            show: {
                                event: 'mouseenter',
                                delay: 50,
                                solo: true
                            },
                            hide: {
                                event: 'click mouseleave'
                            },
                            style: {
                                classes: 'qtip-bootstrap',
                                width: width
                            },
                            position: {
                                my: 'left top',
                                at: 'center bottom',
                                adjust: {
                                    screen: true
                                },
                                viewport: jQuery(window)
                            }
                        },
                        options
                    )
                );
            }
            else {
                try {
                    jQuery(element).qtip("api").hide();
                    jQuery(element).qtip("api").destroy();
                    jQuery(element).removeClass('generated_qtip');
                }
                catch (err) {
                    // There was no Qtip defined on the element yet
                }
            }
        }
    }
};

/**
 * trunk8 bindings for knockout, usage:
 *
 * <h3 data-bind="text: title, trunk8: {lines: 1}"></h3>
 *
 * @type {{init: Function, update: Function}}
 */
ko.bindingHandlers.trunk8 = {
    init: function (element, valueAccessor) {
        var settings = ko.utils.unwrapObservable(valueAccessor()) || {};
        var defaultSettings = {
            fill: '&hellip;'
        };

        jQuery(element).trunk8(jQuery.extend({}, defaultSettings, settings));
    },
    update: function (element, valueAccessor) {
        jQuery(element)
            .trunk8('update', jQuery(element).html())   // Update trunk8 data
            .prop('title', '')                          // Remove element title
            .addClass('trunk8')                         // Set helper class
        ;
    }
};

/**
 * Actual TaskBoard knockout view model object. This contains all necessary data for application.
 *
 * Note that this object is accessible via myViewModel variable in all javascript code.
 *
 * @constructor
 */
function ViewModel() {
    var self = this;
    var body = jQuery('body');

    // Specify used observable data

    // Generic observable data
    self.users      = ko.observableArray([]);
    self.types      = ko.observableArray([]);

    // Project related observable data
    self.projects   = ko.observableArray([]);
    self.phases     = ko.observableArray([]);   // This is updated when ever user changes project
    self.sprints    = ko.observableArray([]);   // This is updated when ever user changes project
    self.stories    = ko.observableArray([]);   // This is updated when ever user changes sprint
    self.tasks      = ko.observableArray([]);   // This is updated when ever user changes sprint

    // Selected project and sprint
    self.project    = ko.observable();
    self.sprint     = ko.observable();

    // Selected id values
    self.selectedProjectId = ko.observable(selectedProjectId);
    self.selectedSprintId = ko.observable(selectedSprintId);

    // Fetch types
    socket.get('/Type', function(types) {
        var mappedTypes = ko.utils.arrayMap(types, function(/** sails.json.type */type) {
            return new Type(type);
        });

        self.types(mappedTypes);

        body.trigger('initializeCheck', 'types');
    });

    // Fetch users
    socket.get('/User', function(users) {
        var mappedUsers = ko.utils.arrayMap(users, function(/** sails.json.user */user) {
            return new User(user);
        });

        self.users(mappedUsers);

        body.trigger('initializeCheck', 'users');
    });

    // Fetch projects
    socket.get('/Project', function(projects) {
        var mappedProjects = ko.utils.arrayMap(projects, function(/** sails.json.project */project) {
            return new Project(project);
        });

        self.projects(mappedProjects);

        body.trigger('initializeCheck', 'projects');

        if (self.selectedProjectId() > 0) {
            self.initProject(self.selectedProjectId());
        }
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
            return a.dateStart() > b.dateStart() ? 1 : -1;
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
        if (typeof project !== 'undefined') {
            self.project(project);

            // Fetch project phases
            socket.get('/Phase', {projectId: projectId}, function(phases) {
                var mappedPhases = ko.utils.arrayMap(phases, function(/** sails.json.phase */phase) {
                    return new Phase(phase);
                });

                self.phases(mappedPhases);

                body.trigger('initializeCheck', 'phases');
            });

            // Fetch project sprints
            socket.get('/Sprint', {projectId: projectId}, function(sprints) {
                var mappedSprints = ko.utils.arrayMap(sprints, function(/** sails.json.sprint */sprint) {
                    return new Sprint(sprint);
                });

                self.sprints(mappedSprints);

                // We have some sprint selected already
                if (self.selectedSprintId() > 0) {
                    self.initSprint(self.selectedSprintId());
                }
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
        if (typeof sprint !== 'undefined') {
            self.sprint(sprint);

            // Fetch project stories
            socket.get('/Story', {sprintId: sprintId}, function(stories) {
                var storyIds = [];

                var mappedStories = ko.utils.arrayMap(stories, function(/** sails.json.story */story) {
                    storyIds.push({storyId: story.id});

                    return new Story(story);
                });

                self.stories(mappedStories);

                body.trigger('initializeCheck', 'stories');

                if (_.size(storyIds) > 0) {
                    // Fetch stories task data
                    socket.get('/Task', {where: {or: storyIds}}, function(tasks) {
                        var mappedTasks = ko.utils.arrayMap(tasks, function(/** sails.json.task */task) {
                            return new Task(task);
                        });

                        self.tasks(mappedTasks);
                    });
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
        return (_.size(self.getTasks(phaseId, storyId)) > 5) ? 'task-template-small' : 'task-template-normal';
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
        return _.filter(self.tasks(), function(task) {
            return (task.storyId() == storyId && task.phaseId() == phaseId);
        });
    };

    // TODO refactor these
    self.taskDraggableStartCallback = function(event, ui) {
        jQuery('.qtip.qtip-bootstrap').qtip('hide');
    };

    self.taskDraggableBeforeMoveCallback = function(arg, event, ui) {
    };

    self.taskDraggableAfterMoveCallback = function(arg, event, ui) {
        var context = ko.contextFor(this);
        var phase = ko.toJS(context.$data);

        // Update task data
        socket.put('/Task/' + arg.item.id(), {phaseId: phase.id}, function(response) {
            var updatedTask = new Task(response);

            self.tasks.replace(arg.item, updatedTask);
        });
    };

    /**
     * Getter for current sprint ID.
     *
     * @returns {Number}
     */
    self.getSprintId = function() {
        return self.sprint() ? self.sprint().id() : 0;
    };

    /**
     * Method to trigger new project adding dialog.
     */
    self.addNewProject = function() {
        jQuery('body').trigger('projectAdd');
    };

    /**
     * Method to trigger new story add dialog.
     *
     * @param   {Number}    projectId   Project ID
     * @param   {Number}    sprintId    Sprint ID
     */
    self.addNewStory = function(projectId, sprintId) {
        jQuery('body').trigger('storyAdd', [projectId, sprintId]);
    };

    /**
     * Method to process all socket messages. Basically this will update specified
     * knockout bindings according to message type.
     *
     * todo implement missing types and models
     *
     * @param   {String}    model   Name of the model
     * @param   {String}    type    Message type
     * @param   {Number}    id      Object data id
     * @param   {{}}        data    Object data
     */
    self.processSocketMessage = function(model, type, id, data) {
        switch (type) {
            // Update events
            case 'update':
                switch (model) {
                    case 'project':
                        var project = _.find(self.projects(), function(project) { return project.id() === id; });

                        if (typeof project != 'undefined') {
                            self.projects.replace(project, new Project(data));
                        }
                        break;
                    case 'phase':
                        var phase = _.find(self.phases(), function(phase) { return phase.id() === id; });

                        if (typeof phase !== 'undefined') {
                            self.phases.replace(phase, new Phase(data));
                        }
                        break;
                    case 'sprint':
                        var sprint = _.find(self.sprints(), function(sprint) { return sprint.id() === id; });

                        if (typeof sprint !== 'undefined') {
                            self.sprints.replace(sprint, new Sprint(data));
                        }
                        break;
                    case 'story':
                        var story = _.find(self.stories(), function(story) { return story.id() === id; });

                        if (typeof story !== 'undefined') {
                            self.stories.replace(story, new Story(data));
                        }
                        break;
                    case 'task':
                        var task = _.find(self.tasks(), function(task) { return task.id() === id; });

                        if (typeof task != 'undefined') {
                            self.tasks.replace(task, new Task(data));
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
                        break;
                    case 'phase':
                        self.phases.push(new Phase(data));
                        break;
                    case 'sprint':
                        self.sprints.push(new Sprint(data));
                        break;
                    case 'story':
                        self.stories.push(new Story(data));
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
                        var phase = _.find(self.phases(), function(phase) { return phase.id() === id; });

                        if (typeof phase !== 'undefined') {
                            self.phases.remove(phase);
                        }
                        break;
                    case 'sprint':
                        var sprint = _.find(self.sprints(), function(sprint) { return sprint.id() === id; });

                        if (typeof sprint !== 'undefined') {
                            self.sprints.remove(sprint);
                        }
                        break;
                    case 'story':
                        var story = _.find(self.stories(), function(story) { return story.id() === id; });

                        if (typeof story !== 'undefined') {
                            self.stories.remove(story);
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
    };

    /**
     * Method to trigger new project adding dialog.
     */
    self.addNewProject = function() {
        jQuery('body').trigger('projectAdd');
    };

    /**
     * Method to trigger new story add dialog.
     *
     * @param   {Number}    projectId   Project ID
     * @param   {Number}    sprintId    Sprint ID
     */
    self.addNewStory = function(projectId, sprintId) {
        jQuery('body').trigger('storyAdd', [projectId, sprintId]);
    };

    /**
     * Method opens project phases admin.
     *
     * Note that this needs project data.
     */
    self.phasesEdit = function() {
        jQuery('body').trigger('phasesEdit');
    };

    /**
     * Method opens project edit.
     */
    self.editProject = function() {
        jQuery('body').trigger('projectEdit');
    };

    self.deleteProject = function() {
        console.log('Implement project delete');
    };

    /**
     * Method opens project backlog
     */
    self.projectBacklog = function() {
        jQuery('body').trigger('projectBacklog');
    };

    /**
     * Method opens project planning view.
     */
    self.projectPlanning = function() {
        jQuery('body').trigger('projectPlanning');
    };

    /**
     * Method opens sprint add
     */
    self.sprintAdd = function() {
        jQuery('body').trigger('sprintAdd');
    };

    /**
     * Method opens sprint edit
     */
    self.sprintEdit = function() {
        jQuery('body').trigger('sprintEdit');
    };

    /**
     * Method opens sprint delete
     */
    self.sprintDelete = function() {
        jQuery('body').trigger('sprintDelete', myViewModel.sprint().id());
    };

    self.usersOpen = function() {
        console.log('Implement users');
    };

    /**
     * Method opens project milestone list dialog
     */
    self.milestoneList = function() {
        jQuery('body').trigger('milestoneList', myViewModel.project().id());
    };
}

var myViewModel = new ViewModel();

ko.applyBindings(myViewModel);
