/**
 * Project change binding handler, this is activated when
 * user changes project selection.
 *
 * @type {{init: Function}}
 */
ko.bindingHandlers.changeProject = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var elementProject = jQuery(element);
        var elementSprint = jQuery('#selectSprint');

        // Actual change event is triggered
        elementProject.change(function() {
            var value = parseInt(elementProject.val(), 10);

            // We are not interest in NaN values
            if (isNaN(value)) {
                elementSprint.attr('disabled', 'disabled');

                jQuery('option:selected', elementSprint).text(elementSprint.data('textChooseProject'));

                viewModel.phases([]);
                viewModel.project();
            } else { // Seems like a real project
                var parameters = {};

                // Iterate all projects
                jQuery.each(viewModel.projects(), function(key, project) {
                    // Current project is selected, add it to knockout bindings
                    if (value == project.id()) {
                        viewModel.project(project);
                    }
                });

                // Specify parameters to fetch project sprint data
                parameters = {
                    projectId: value,
                    sort: 'dateStart ASC'
                };

                // Fetch project sprint data
                jQuery.getJSON("/sprint/", parameters)
                    .done(function(/** models.sprint[] */sprints) {
                        // Map fetched JSON data to sprint objects
                        var mappedData = ko.utils.arrayMap(sprints, function(/** models.sprint */sprint) {
                            return new Sprint(sprint);
                        });

                        viewModel.sprints(mappedData);

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
                    .fail(function(jqxhr, textStatus, error) {
                        viewModel.sprints([]);

                        handleAjaxError(jqxhr, textStatus, error);
                    });

                // Specify parameters to fetch project phase data
                parameters = {
                    projectId: value,
                    sort: 'order ASC'
                };

                // Fetch project phase data
                jQuery.getJSON("/phase/", parameters)
                    .done(function(/** models.phase[] */phases) {
                        // Map fetched JSON data to sprint objects
                        var mappedData = ko.utils.arrayMap(phases, function(/** models.phase */phase) {
                            return new Phase(phase);
                        });

                        viewModel.phases(mappedData);
                    })
                    .fail(function(jqxhr, textStatus, error) {
                        viewModel.phases([]);

                        handleAjaxError(jqxhr, textStatus, error);
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
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var elementSprint = jQuery(element);

        // Actual change event is triggered
        elementSprint.change(function() {
            var sprintId = parseInt(elementSprint.val(), 10);

            // NaN:s are not for us
            if (isNaN(sprintId)) {
                viewModel.stories([]);
            } else {
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
                    .done(function(/** models.story[] */stories) {
                        // Map fetched JSON data to story objects
                        var mappedData = ko.utils.arrayMap(stories, function(/** models.story */story) {
                            return new Story(story);
                        });

                        viewModel.stories(mappedData);
                    })
                    .fail(function(jqxhr, textStatus, error) {
                        viewModel.stories([]);

                        handleAjaxError(jqxhr, textStatus, error);
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
    self.project    = ko.observable();
    self.sprint     = ko.observable();

    // Fetch project data from server
    jQuery.getJSON("/project")
        .done(function(data) {
            // Map fetched JSON data to project objects
            var mappedData = ko.utils.arrayMap(data, function(/** models.project */project) {
                return new Project(project);
            });

            self.projects(mappedData);
        });

    // Fetch user data from server
    jQuery.getJSON("/user")
        .done(function(data) {
            // Map fetched JSON data to user objects
            var mappedData = ko.utils.arrayMap(data, function(/** models.user */user) {
                return new User(user);
            });

            self.users(mappedData);
        });

    // Fetch task type data from server
    jQuery.getJSON("/type", {sort: 'order ASC'})
        .done(function(data) {
            // Map fetched JSON data to task type objects
            var mappedData = ko.utils.arrayMap(data, function(/** models.type */type) {
                return new Type(type);
            });

            self.types(mappedData);
        });

    // Sorted project objects
    self.sortedProjects = ko.computed(function() {
        return self.projects().sort(function(a, b) {
            return a.title().toLowerCase() > b.title().toLowerCase() ? 1 : -1;
        });
    });

    // Sorted sprint objects
    self.sortedSprints = ko.computed(function() {
        return self.sprints().sort(function(a, b) {
            return a.start() > b.start() ? 1 : -1;
        });
    });

    // Sorted story objects
    self.sortedStories = ko.computed(function() {
        return self.stories().sort(function(a, b) {
            return a.priority() > b.priority() ? 1 : -1;
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
     *
     * @todo    Should we just trigger some event here and pass data
     *          to actual function?
     */
    self.addNewProject = function() {
        var source = jQuery('#project-form-new').html();
        var template = Handlebars.compile(source);
        var templateData = {
            users: ko.toJS(myViewModel.users())
        };

        /**
         * Create bootbox dialog and show it to user.
         *
         * @type {jQuery}
         */
        var modal = bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formProjectNew');
                        var formItems = form.serializeJSON();

                        if (validateForm(formItems)) {
                            jQuery.getJSON("/project/create/", formItems)
                                .done(function (/** models.project */project) {
                                    self.projects.push(new Project(project));

                                    jQuery('div.bootbox').modal('hide');
                                })
                                .fail(function (jqxhr, textStatus, error) {
                                    handleAjaxError(jqxhr, textStatus, error);
                                });
                        }

                        return false;
                    }

                }
            ],
            {
                header: "Add new project"
            }
        );

        // Make form init when dialog is opened.
        modal.on('shown', function() {
            jQuery('input[name="title"]', modal).focus();
            jQuery('textarea', modal).autosize();

            var inputStart = jQuery("#dateStartContainer");
            var inputEnd = jQuery("#dateEndContainer");
            var bitsStart = inputStart.val().split('-');
            var bitsEnd = inputEnd.val().split('-');
            var valueStart = null;
            var valueEnd = null;

            if (bitsStart.length === 3) {
                valueStart = new Date(bitsStart[0], bitsStart[1] - 1, bitsStart[2]);
            }

            if (bitsEnd.length === 3) {
                valueEnd = new Date(bitsEnd[0], bitsEnd[1] - 1, bitsEnd[2]);
            }

            inputStart.bootstrapDP({
                format: 'yyyy-mm-dd',
                weekStart: 1,
                calendarWeeks: true
            }).on('changeDate', function(event) {
                if (valueEnd && event.date.valueOf() > valueEnd.valueOf()) {
                    if (valueStart) {
                        inputStart.val(valueStart.format('yyyy-mm-dd'));
                    } else {
                        inputStart.val('');
                    }

                    makeMessage('Start date cannot be later than end date.', 'error');

                    inputEnd.closest('.control-group').addClass('error');
                } else {
                    valueStart = new Date(event.date);
                    inputStart.bootstrapDP('hide');

                    inputEnd.closest('.control-group').removeClass('error');
                }
            });

            inputEnd.bootstrapDP({
                format: 'yyyy-mm-dd',
                weekStart: 1,
                calendarWeeks: true
            }).on('changeDate', function(event) {
                if (valueStart && event.date.valueOf() < valueStart.valueOf()) {
                    if (valueEnd) {
                        inputEnd.val(valueEnd.format('yyyy-mm-dd'));
                    } else {
                        inputEnd.val('');
                    }

                    makeMessage('End date cannot be before than start date.', 'error');

                    inputEnd.closest('.control-group').addClass('error');
                } else {
                    valueEnd = new Date(event.date);
                    inputEnd.bootstrapDP('hide');

                    inputEnd.closest('.control-group').removeClass('error');
                }
            });
        });
    };

    /**
     * Method to trigger new story add dialog.
     *
     * @param   {Number}    projectId   Project ID
     * @param   {Number}    sprintId    Sprint ID
     */
    self.addNewStory = function(projectId, sprintId) {
        var source = jQuery('#story-form-new').html();
        var template = Handlebars.compile(source);
        var templateData = {
            projectId: projectId,
            sprintId: sprintId,
            project: ko.toJS(self.project),
            sprint: ko.toJS(self.sprint)
        };

        var modal = bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formStoryNew');
                        var formItems = form.serializeJSON();

                        if (validateForm(formItems)) {
                            jQuery.getJSON("/story/create/", formItems)
                                .done(function (/** models.story */story) {
                                    self.stories.push(new Story(story));

                                    jQuery('div.bootbox').modal('hide');
                                })
                                .fail(function (jqxhr, textStatus, error) {
                                    handleAjaxError(jqxhr, textStatus, error);
                                });
                        }

                        return false;
                    }

                }
            ],
            {
                header: "Add new story"
            }
        );

        modal.on('shown', function() {
            jQuery('input[name="title"]', modal).focus();
            jQuery('textarea', modal).autosize();
        });
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
     * Method removes specified story from knockout bindings.
     *
     * @param   {number}    storyId Story ID
     *
     * @returns {void}
     */
    self.deleteStory = function(storyId) {
        // Iterate each story
        jQuery.each(myViewModel.stories(), function(storyKey, story) {
            if (ko.toJS(story.id()) === storyId) {
                myViewModel.stories.remove(story);
            }
        });
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

    self.trash = ko.observableArray([]);
    self.trash.id = "trash";
}

var myViewModel = new ViewModel();

ko.applyBindings(myViewModel);


/**
 * Object to present project.
 *
 * @param   {models.project}    data
 * @constructor
 */
function Project(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.managerId      = ko.observable(data.managerId);
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.manager        = ko.observable("");
    self.sprints        = ko.observableArray([]);
    self.backlog        = ko.observableArray([]);

    // Fetch project manager (user) data
    if (parseInt(self.managerId(), 10) > 0) {
        // Fetch user JSON data
        jQuery.getJSON("/user/" + self.managerId())
            .done(function(/** models.user */user) {
                self.manager(new User(user));
            });
    }

    // Specify parameters to fetch sprint data
    var parameters = {
        projectId: self.id,
        sort: 'dateStart ASC'
    };
}

/**
 * Object to present project phases.
 *
 * @param   {models.phase}    data
 * @constructor
 */
function Phase(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.order          = ko.observable(data.order);
    self.tasks          = ko.observable(data.tasks);

    // Calculate phase column width
    self.getColumnWidth = function(reservedSize, phasesCount) {
        var columnWidth = (100 - reservedSize) / phasesCount;

        return columnWidth + '%';
    };

    // Max task count for this phase
    self.cntTasksMax = ko.computed(function() {
        return self.tasks() < 1 ? "" : self.tasks();
    });

    /**
     * Task count for current phase
     *
     * @todo    Is there any other way to get task count for each phase?
     */
    self.cntTask = ko.computed(function() {
        var output = '';
        var phaseId = self.id();

        // We may have some stories
        if (myViewModel.stories()) {
            // Oh, yes we have stories
            if (myViewModel.stories().length > 0) {
                output = 0;

                // Iterate each story
                jQuery.each(myViewModel.stories(), function(storyKey, story) {
                    // Iterate each phase
                    jQuery.each(story.phases(), function(phaseKey, phase) {
                        /**
                         * Why phase.id() doesn't work?
                         *
                         * Workaround is to use ko.toJS, but this is not the *proper* way to do this.
                         */
                        if (ko.toJS(phase.id()) === phaseId) {
                            output += phase.tasks().length;
                        }
                    });
                });
            }
        }

        return output;
    });

    /**
     * Task count class getter.
     *
     * If actual task count is greater than specified phase task count, method will
     * return 'text-error' class otherwise empty string.
     */
    self.phaseTaskCountStatus = ko.computed(function() {
        return self.tasks() < 1 ? '' : (self.tasks() < self.cntTask() ? 'text-error' : '');
    });

    /**
     * Method returns formatted phase task count text. This is shown
     * in phase title.
     *
     */
    self.phaseTaskCountText = ko.computed(function() {
        var output;

        if (self.cntTask() == '') {
            output = '';
        } else {
            output = '(' + self.cntTask();

            if (self.cntTasksMax() != '') {
                output += ' | ' + self.cntTasksMax();
            }

            output += ')';
        }

        return output;
    });
}

/**
 * Object to present sprint.
 *
 * @param   {models.sprint}    data
 * @constructor
 */
function Sprint(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.start          = ko.observable(data.dateStart);
    self.end            = ko.observable(data.dateEnd);
    self.stories        = ko.observableArray([]);

    // Make formatted sprint title
    self.formattedTitle = ko.computed(function() {
        var start = new Date(self.start());
        var end = new Date(self.end());

        return start.format('isoDate') + " - " + end.format('isoDate') + " " +  self.title();
    });

    // Sprint duration as in days
    self.duration = ko.computed(function() {
        var start = new Date(self.start());
        var end = new Date(self.end());

        return end.getDate() - start.getDate();
    });
}

/**
 * Object to present story.
 *
 * @param   {models.story}    data
 * @constructor
 */
function Story(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.estimate       = ko.observable(data.estimate);
    self.priority       = ko.observable(data.priority);
    self.vfCase         = ko.observable(data.vfCase);
    self.phases         = ko.observableArray([]);

    // Specify parameters to fetch task data
    var parameters = {
        storyId: self.id()
    };

    // Fetch story task JSON data
    jQuery.getJSON("/task/", parameters, function(/** models.task[] */tasks) {
        // Map fetched JSON data to task objects
        var tasksObjects = ko.utils.arrayMap(tasks, function(/** models.task */task) {
            return new Task(task);
        });

        var phases = ko.utils.arrayMap(myViewModel.phases(), function(phase) {
            var phaseTasks = [];

            ko.utils.arrayForEach(tasksObjects, function(task) {
                var taskPhaseId = parseInt(task.phaseId(), 10);

                if (phase.id() === taskPhaseId) {
                    phaseTasks.push(task);
                }
            });

            return new PhaseStory(phase, phaseTasks);
        });

        self.phases(phases)
    });

    // Formatted story title
    self.formattedTitle = ko.computed(function() {
        return self.title() + " (" + self.estimate() + ")";
    });

    /**
     * Method triggers add a new task for current story.
     *
     * @param   data    Current story knockout model object
     * @param   event   Event data
     */
    self.addNewTask = function(data, event) {
        var source = jQuery('#task-form-new').html();
        var template = Handlebars.compile(source);
        var templateData = {
            storyId: data.id(),
            users: ko.toJS(myViewModel.users()),
            types: ko.toJS(myViewModel.types())
        };

        var modal = bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formTaskNew');
                        var formItems = form.serializeJSON();

                        if (validateForm(formItems)) {
                            jQuery.getJSON("/task/create/", formItems)
                                .done(function (/** models.task */task) {
                                    self.phases()[0].tasks.push(new Task(task));

                                    jQuery('div.bootbox').modal('hide');
                                })
                                .fail(function (jqxhr, textStatus, error) {
                                    handleAjaxError(jqxhr, textStatus, error);
                                });
                        }

                        return false;
                    }

                }
            ],
            {
                header: "Add new task to story '" + data.title() + "'"
            }
        );

        modal.on('shown', function() {
            jQuery('input[name="title"]', modal).focus();
            jQuery('textarea', modal).autosize();
        });
    };

    self.getStoryRowId = function() {
        return "storyRow_" + self.id();
    };
}

/**
 * Object to present story phase.
 *
 * @param   {models.phaseStory} phase   Phase data
 * @param   {models.task[]}     tasks   Task data for current phase
 * @constructor
 */
function PhaseStory(phase, tasks) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(phase.id);
    self.title          = ko.observable(phase.title);
    self.description    = ko.observable(phase.description);
    self.order          = ko.observable(phase.order);
    self.tasks          = ko.observableArray(tasks);

    self.myDropCallback = function(arg, event, ui) {
        var context = ko.contextFor(this);
        var phase = ko.toJS(context.$data);

        jQuery.getJSON("/task/update/" + arg.item.id(), {phaseId: phase.id})
            .done(function (task) {
                // Todo: update task model data
            })
            .fail(function (jqxhr, textStatus, error) {
                handleAjaxError(jqxhr, textStatus, error);
            });
    };
}

/**
 * Object to present task.
 *
 * @param   {models.task}    data
 * @constructor
 */
function Task(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.storyId        = ko.observable(data.storyId);
    self.userId         = ko.observable(data.userId);
    self.phaseId        = ko.observable(data.phaseId);
    self.typeId         = ko.observable(data.typeId);
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.user           = ko.observable("");

    // Fetch task owner (user) data.
    if (parseInt(self.userId()) > 0) {
        // Fetch user JSON data
        jQuery.getJSON("/user/" + self.userId())
            .done(function(/** models.user */user) {
                self.user(new User(user));
            });
    }

    // Fix tasks that have not yet phase id defined
    if (self.phaseId() == null || self.phaseId() == 0) {
        var firstPhase = myViewModel.phases()[0];

        self.phaseId(firstPhase.id());
    }

    // Task class determination, basically task type
    self.taskClass = ko.computed(function() {
        var output = '';

        jQuery.each(myViewModel.types(), function(key, type) {
            if (type.id() === self.typeId()) {
                output = type.class();
            }
        });

        return output;
    });
}

/**
 * Object to present user.
 *
 * @param   {models.user}    data
 * @constructor
 */
function User(data) {
    var self = this;

    // Initialize object data
    self.id         = ko.observable(data.id);
    self.name       = ko.observable(data.name);
    self.firstname  = ko.observable(data.firstname);
    self.surname    = ko.observable(data.surname);
    self.email      = ko.observable(data.email);

    // Make formatted fullname
    self.fullname = ko.computed(function() {
        return self.firstname() + " " + self.surname();
    });
}

/**
 * Object to present task type.
 *
 * @param   {models.type}    data
 * @constructor
 */
function Type(data) {
    var self = this;

    // Initialize object data
    self.id     = ko.observable(data.id);
    self.title  = ko.observable(data.title);
    self.order  = ko.observable(data.order);
    self.class  = ko.observable(data.class);
}
