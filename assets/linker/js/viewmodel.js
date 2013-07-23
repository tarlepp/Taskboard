/**
 * Project change binding handler, this is activated when
 * user changes project selection.
 *
 * @type {{init: Function}}
 */
ko.bindingHandlers.changeProject = {
    /**
     * Init function for project change event.
     *
     * @param   {String}                    element             Name of the current element
     * @param                               valueAccessor
     * @param                               allBindingsAccessor
     * @param   {models.knockout.viewModel} viewModel
     * @param                               bindingContext
     */
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var elementProject = jQuery(element);
        var elementSprint = jQuery('#selectSprint');

        // Actual change event is triggered
        elementProject.change(function() {
            var value = parseInt(elementProject.val(), 10);

            // Reset used data
            viewModel.phases([]);
            viewModel.stories([]);
            viewModel.sprints([]);
            viewModel.backlog([]);
            viewModel.project(null);
            viewModel.sprint(null);

            // Seems like a real project
            if (!isNaN(value)) {
                // Iterate all projects
                jQuery.each(viewModel.projects(), function(key, project) {
                    // Current project is selected, add it to knockout bindings
                    if (value == project.id()) {
                        viewModel.project(project);
                    }
                });

                // Specify parameters to fetch backlog story data
                var parameters = {
                    projectId: value,
                    sprintId: 0,
                    sort: 'priority ASC'
                };

                // Fetch project backlog story JSON data
                jQuery.getJSON("/story/", parameters)
                .done(function(/** models.rest.story[] */stories) {
                    // Map fetched JSON data to story objects
                    var storyObjects = ko.utils.arrayMap(stories, function(/** models.rest.story */story) {
                        return new Story(story);
                    });

                    // Assign stories to backlog
                    viewModel.backlog(storyObjects);
                })
                .fail(function(jqXhr, textStatus, error) {
                    viewModel.backlog([]);

                    handleAjaxError(jqXhr, textStatus, error);
                });

                // Specify parameters to fetch project sprint data
                parameters = {
                    projectId: value,
                    sort: 'dateStart ASC'
                };

                // Fetch project sprint data
                jQuery.getJSON("/sprint/", parameters)
                .done(function(/** models.rest.sprint[] */sprints) {
                    // Map fetched JSON data to sprint objects
                    var mappedData = ko.utils.arrayMap(sprints, function(/** models.rest.sprint */sprint) {
                        return new Sprint(sprint);
                    });

                    viewModel.sprints(mappedData);

                    // Set project specified min/max sprint dates
                    viewModel.updateProjectSprintDates();

                    if (mappedData.length > 0) {
                        elementSprint.removeAttr('disabled');

                        // @todo this has some bug, fix later
                        jQuery('option:selected', elementSprint).text(elementSprint.data('textChooseSprint'));
                    } else {
                        elementSprint.attr('disabled', 'disabled');

                        // @todo maybe bug, check and fix later
                        jQuery('option:selected', elementSprint).text(elementSprint.data('textNoData'));
                    }
                })
                .fail(function(jqXhr, textStatus, error) {
                    viewModel.sprints([]);

                    handleAjaxError(jqXhr, textStatus, error);
                });

                // Specify parameters to fetch project phase data
                parameters = {
                    projectId: value,
                    sort: 'order ASC'
                };

                // Fetch project phase data
                jQuery.getJSON("/phase/", parameters)
                .done(function(/** models.rest.phase[] */phases) {
                    // Map fetched JSON data to sprint objects
                    var mappedData = ko.utils.arrayMap(phases, function(/** models.rest.phase */phase) {
                        return new Phase(phase);
                    });

                    viewModel.phases(mappedData);

                    jQuery('body').trigger('initializeCheck', 'phases');
                })
                .fail(function(jqXhr, textStatus, error) {
                    viewModel.phases([]);

                    handleAjaxError(jqXhr, textStatus, error);
                });
            }
        });
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
     * Init function for sprint change event.
     *
     * @param   {String}                    element             Name of the current element
     * @param                               valueAccessor
     * @param                               allBindingsAccessor
     * @param   {models.knockout.viewModel} viewModel
     * @param                               bindingContext
     */
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var elementSprint = jQuery(element);

        // Actual change event is triggered
        elementSprint.change(function() {
            var sprintId = parseInt(elementSprint.val(), 10);

            // Reset used child data
            viewModel.sprint(null);
            viewModel.stories([]);

            // NaN:s are not for us
            if (!isNaN(sprintId)) {
                // Iterate current project sprints
                jQuery.each(viewModel.sprints(), function(key, sprint) {
                    // Founded selected sprint, associate it to knockout bindings
                    if (sprintId == sprint.id()) {
                        viewModel.sprint(sprint);
                    }
                });

                // Specify parameters to fetch project sprint story data
                var parameters = {
                    sprintId: sprintId,
                    sort: 'priority ASC'
                };

                // Fetch sprint story data
                jQuery.getJSON("/story/", parameters)
                .done(function(/** models.rest.story[] */stories) {
                    // Map fetched JSON data to story objects
                    var mappedData = ko.utils.arrayMap(stories, function(/** models.rest.story */story) {
                        return new Story(story);
                    });

                    viewModel.stories(mappedData);
                })
                .fail(function(jqXhr, textStatus, error) {
                    viewModel.stories([]);

                    handleAjaxError(jqXhr, textStatus, error);
                });
            }
        });
    }
};

/**
 * Actual TaskBoard knockout view model object. This contains all
 * necessary data for application.
 *
 * Note that this object is accessible via myViewModel variable in
 * all javascript code.
 *
 * @constructor
 */
function ViewModel() {
    var self = this;

    // Specify used observable data
    self.projects   = ko.observableArray([]);
    self.phases     = ko.observableArray([]);
    self.users      = ko.observableArray([]);
    self.sprints    = ko.observableArray([]);
    self.stories    = ko.observableArray([]);
    self.types      = ko.observableArray([]);
    self.backlog    = ko.observableArray([]);
    self.project    = ko.observable();
    self.sprint     = ko.observable();

    // Fetch user data from server
    jQuery.getJSON("/user")
    .done(function(data) {
        // Map fetched JSON data to user objects
        var mappedData = ko.utils.arrayMap(data, function(/** models.rest.user */user) {
            return new User(user);
        });

        self.users(mappedData);

        jQuery('body').trigger('initializeCheck', 'users');
    })
    .fail(function(jqXhr, textStatus, error) {
        handleAjaxError(jqXhr, textStatus, error);
    });

    // Fetch task type data from server
    jQuery.getJSON("/type", {sort: 'order ASC'})
    .done(function(data) {
        // Map fetched JSON data to task type objects
        var mappedData = ko.utils.arrayMap(data, function(/** models.rest.type */type) {
            return new Type(type);
        });

        self.types(mappedData);

        jQuery('body').trigger('initializeCheck', 'types');
    })
    .fail(function(jqXhr, textStatus, error) {
        handleAjaxError(jqXhr, textStatus, error);
    });

    // Fetch project data from server
    jQuery.getJSON("/project")
    .done(function(data) {
        // Map fetched JSON data to project objects
        var mappedData = ko.utils.arrayMap(data, function(/** models.rest.project */project) {
            return new Project(project);
        });

        self.projects(mappedData);

        jQuery('body').trigger('initializeCheck', 'projects');
    })
    .fail(function(jqXhr, textStatus, error) {
        handleAjaxError(jqXhr, textStatus, error);
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
     * Method removes specified task from knockout bindings.
     *
     * Note: this doesn't seem to be very sensible, but it works :D
     *
     * @param   {number}    taskId      Task ID
     * @param   {number}    phaseId     Phase ID
     * @param   {number}    storyId     Story ID
     *
     * @returns {void}
     */
    self.deleteTask = function(taskId, phaseId, storyId) {
        // Iterate each story
        jQuery.each(myViewModel.stories(), function(storyKey, story) {
            if (ko.toJS(story.id()) === storyId) {
                // Iterate each phase
                jQuery.each(story.phases(), function(phaseKey, phase) {
                    if (ko.toJS(phase.id()) === phaseId) {
                        // Iterate phase tasks
                        jQuery.each(phase.tasks(), function(taskKey, task) {
                            if (ko.toJS(task.id()) === taskId) {
                                phase.tasks.remove(task);
                            }
                        });
                    }
                });
            }
        });
    };

    /**
     * Method deletes specified phase from knockout model bindings.
     *
     * @param   {number}    phaseId Phase ID
     *
     * @returns {void}
     */
    self.deletePhase = function(phaseId) {
        jQuery.each(myViewModel.phases(), function(key, phase) {
            if (phase.id() && ko.toJS(phase.id()) === phaseId) {
                myViewModel.phases.remove(phase);
            }
        });

        // TODO: delete phase from story phases
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
    self.openBacklog = function() {
        jQuery('body').trigger('projectBacklog');
    };

    /**
     * Method opens sprint add
     */
    self.sprintAdd = function() {
        jQuery('body').trigger('sprintAdd');
    };

    self.sprintEdit = function() {
        console.log('Implement sprint edit');
    };

    self.sprintDelete = function() {
        console.log('Implement sprint delete');
    };

    self.usersOpen = function() {
        console.log('Implement users');
    };

    /**
     * Method removes specified story from knockout bindings.
     *
     * @param   {number}    storyId Story ID
     *
     * @returns {void}
     */
    self.deleteStory = function(storyId) {
        // Iterate each story
        jQuery.each(myViewModel.stories(), function(storyKey, story) {
            if (story && ko.toJS(story.id()) === storyId) {
                myViewModel.stories.remove(story);
            }
        });
    };

    /**
     * Method updates project sprint min / max dates according to current
     * project sprint data.
     */
    self.updateProjectSprintDates = function() {
        var valuesStart = [];
        var valuesEnd = [];

        // Map fetched JSON data to sprint objects
        jQuery.each(self.sprints(), function(index, /** models.knockout.sprint */sprint) {
            var dateStart = ko.toJS(sprint.dateStartObject());
            var dateEnd = ko.toJS(sprint.dateEndObject());

            valuesStart.push(dateStart.getTime());
            valuesEnd.push(dateEnd.getTime());
        });

        // Set project specified min/max sprint dates
        myViewModel.project().sprintDateMin(new Date(Math.max.apply(Math, valuesStart)));
        myViewModel.project().sprintDateMax(new Date(Math.max.apply(Math, valuesEnd)));
    };

    /**
     * Generic nl2br method
     *
     * @param   {string}    value
     *
     * @returns {string}
     */
    self.nl2br = function(value) {
        return (value === null) ? '' : value.nl2br();
    };

    /**
     * Method returns specified number of words from given value.
     *
     * @param   {string}    value
     * @param   {number}    number
     *
     * @returns {string}
     */
    self.words = function(value, number) {
        return value.split(/\s+/,number).join(" ");
    };
}

var myViewModel = new ViewModel();

ko.applyBindings(myViewModel);
