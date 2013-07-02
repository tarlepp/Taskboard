jQuery(document).ready(function () {
    /*

    */
});

ko.bindingHandlers.changeProject = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var elementProject = jQuery(element);
        var elementSprint = jQuery('#selectSprint');

        elementProject.change(function() {
            var value = parseInt(elementProject.val(), 10);

            if (isNaN(value)) {
                elementSprint.attr('disabled', 'disabled');

                jQuery('option:selected', elementSprint).text(elementSprint.data('textChooseProject'));

                viewModel.phases([]);
            } else {
                var parameters = {};

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

                            jQuery('option:selected', elementSprint).text(elementSprint.data('textChooseSprint'));
                        } else {
                            elementSprint.attr('disabled', 'disabled');

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

ko.bindingHandlers.changeSprint = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var elementSprint = jQuery(element);

        elementSprint.change(function() {
            var sprintId = parseInt(elementSprint.val(), 10);

            if (isNaN(sprintId)) {
                viewModel.stories([]);
            } else {
                // Specify parameters to fetch project sprint story data
                var parameters = {
                    sprintId: sprintId,
                    sort: 'priority ASC'
                };

                // Fetch project sprint data
                jQuery.getJSON("/story/", parameters)
                    .done(function(/** models.story[] */stories) {
                        // Map fetched JSON data to sprint objects
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

function handleAjaxError(jqxhr, textStatus, error) {
    var err = textStatus + ', ' + error;

    console.log( "Request Failed: " + err);
}

function ViewModel() {
    var self = this;

    self.projects   = ko.observableArray([]);
    self.phases     = ko.observableArray([]);
    self.users      = ko.observableArray([]);
    self.sprints    = ko.observableArray([]);
    self.project    = ko.observable();
    self.sprint     = ko.observable();
    self.stories    = ko.observableArray([]);

    jQuery.getJSON("/project", {sort: 'title ASC'})
        .done(function(data) {
            // Map fetched JSON data to project objects
            var mappedData = ko.utils.arrayMap(data, function(/** models.project */project) {
                return new Project(project);
            });

            self.projects(mappedData);
        });

    jQuery.getJSON("/user")
        .done(function(data) {
            // Map fetched JSON data to project objects
            var mappedData = ko.utils.arrayMap(data, function(/** models.user */user) {
                return new User(user);
            });

            self.users(mappedData);
        });

    self.trash = ko.observableArray([]);
    self.trash.id = "trash";

    self.addNewProject = function() {
        var source = jQuery('#project-form-new').html();
        var template = Handlebars.compile(source);
        var templateData = {
            users: ko.toJS(myViewModel.users())
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
                    label: "Add new Project",
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
                header: "Add a new project"
            }
        );

        modal.on('shown', function() {
            function startChange() {
                var startDate = start.value(),
                    endDate = end.value();

                if (startDate) {
                    startDate = new Date(startDate);
                    startDate.setDate(startDate.getDate());
                    end.min(startDate);
                } else if (endDate) {
                    start.max(new Date(endDate));
                } else {
                    endDate = new Date();
                    start.max(endDate);
                    end.min(endDate);
                }
            }

            function endChange() {
                var endDate = end.value(),
                    startDate = start.value();

                if (endDate) {
                    endDate = new Date(endDate);
                    endDate.setDate(endDate.getDate());
                    start.max(endDate);
                } else if (startDate) {
                    end.min(new Date(startDate));
                } else {
                    endDate = new Date();
                    start.max(endDate);
                    end.min(endDate);
                }
            }

            var start = $("#dateStart").kendoDatePicker({
                change: startChange
            }).data("kendoDatePicker");

            var end = $("#dateEnd").kendoDatePicker({
                change: endChange
            }).data("kendoDatePicker");

            start.max(end.value());
            end.min(start.value());
        })
    };
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

    if (parseInt(self.managerId) > 0) {
        // Fetch user JSON data
        jQuery.getJSON("/user/" + self.managerId)
            .done(function(/** models.user */user) {
                self.manager(new User(user));
            });
    }

    // Specify parameters to fetch sprint data
    var parameters = {
        projectId: self.id,
        sort: 'dateStart ASC'
    };

    // Fetch sprint JSON data
    //jQuery.getJSON("/sprint/", parameters)
    //    .done(function(/** models.sprint[] */sprints) {
    //        // Map fetched JSON data to sprint objects
    //        var mappedData = ko.utils.arrayMap(sprints, function(/** models.sprint */sprint) {
    //            return new Sprint(sprint);
    //        });
    //
    //        self.sprints(mappedData);
    //    });
}

function Phase(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.order          = ko.observable(data.order);

    self.getColumnWidth = function(reservedSize, phasesCount) {
        var columnWidth = (100 - reservedSize) / phasesCount;

        return columnWidth + '%';
    };
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

    // Specify parameters to fetch story data
    var parameters = {
        sprintId: self.id,
        sort: 'priority ASC'
    };
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
        storyId: self.id
    };

    // Fetch task JSON data
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

    self.titleFormatted = ko.computed(function() {
        return self.title() + " (" + self.estimate() + ")";
    });

    self.addNewTask = function(data, event) {
        var source = jQuery('#task-form-new').html();
        var template = Handlebars.compile(source);
        var templateData = {
            storyId: data.id(),
            users: ko.toJS(myViewModel.users())
        };

        bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                },
                {
                    label: "Add new Task",
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
                header: "Add a new task to story '" + data.title() + "'"
            }
        );
    };
}

function PhaseStory(phase, tasks) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(phase.id);
    self.title          = ko.observable(phase.title);
    self.description    = ko.observable(phase.description);
    self.order          = ko.observable(phase.order);
    self.tasks          = ko.observableArray([]);

    var mappedTasks = ko.utils.arrayMap(tasks, function(task) {
        return new Task(ko.toJS(task));
    });

    self.tasks(mappedTasks);

    self.myDropCallback = function(arg, event, ui) {
        var context = ko.contextFor(this);
        var foo = ko.toJS(context.$data);

        console.log('current phase: '+ arg.item.phaseId());
        console.log('update phase to: '+ foo.id);

        // Why the hell this doesn't work?
        console.log(context.$data.id());

        jQuery.getJSON("/task/update/" + arg.item.id(), {phaseId: foo.id})
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
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.user           = ko.observable("");

    if (parseInt(self.userId) > 0) {
        // Fetch user JSON data
        jQuery.getJSON("/user/" + self.userId)
            .done(function(/** models.user */user) {
                self.user(new User(user));
            });
    }

    // Fix tasks that have not yet
    if (self.phaseId() == null || self.phaseId() == 0) {
        var firstPhase = myViewModel.phases()[0];

        self.phaseId(firstPhase.id());
    }
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

