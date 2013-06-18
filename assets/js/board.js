jQuery(document).ready(function () {
    jQuery.fn.serializeJSON = function () {
        var json = {};
        jQuery.map(jQuery(this).serializeArray(), function (n, i) {
            var _ = n.name.indexOf('[');
            if (_ > -1) {
                var o = json;
                _name = n.name.replace(/\]/gi, '').split('[');
                for (var i = 0, len = _name.length; i < len; i++) {
                    if (i == len - 1) {
                        if (o[_name[i]]) {
                            if (typeof o[_name[i]] == 'string') {
                                o[_name[i]] = [o[_name[i]]];
                            }
                            o[_name[i]].push(n.value);
                        }
                        else o[_name[i]] = n.value || '';
                    }
                    else o = o[_name[i]] = o[_name[i]] || {};
                }
            }
            else {
                if (json[n.name] !== undefined) {
                    if (!json[n.name].push) {
                        json[n.name] = [json[n.name]];
                    }
                    json[n.name].push(n.value || '');
                }
                else json[n.name] = n.value || '';
            }
        });

        return json;
    };
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
    self.tasks          = ko.observableArray([]);

    self.getColumnWidth = function(reservedSize, phasesCount) {
        var columnWidth = (100 - reservedSize) / phasesCount;

        return columnWidth + '%';
    };



    self.getTasks = function(storyId, phaseId) {
        var tasks = [];

        jQuery.each(myViewModel.stories(), function(storyIndex, storyObject) {
            if (storyObject.id() === storyId) {
                jQuery.each(storyObject.tasks(), function(taskIndex, taskObject) {
                    if (taskObject.phaseId() == phaseId) {
                        tasks.push(taskObject);
                    }
                });
            }
        });

        return tasks;

        //console.log(phaseId);
        //console.log(storyId);
    };

    self.myBeforeMoveCallback = function(arg, event, ui) {
        console.log(arg.targetParent)
    };

    self.myAfterMoveCallback = function(arg, event, ui) {
        // console.log(arg.item.parent());
        console.log(ko.toJS(arg.item));
        console.log(arg.targetParent);

       // arg.item.phaseId(5);

        console.log(ko.toJS(arg.item));

        //console.log("Moved '" + arg.item.title() + "' from " + arg.sourceParentNode.id + " (index: " + arg.sourceIndex + ") to " + arg.targetParent.id + " (index " + arg.targetIndex + ")");
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

    var mappedData = ko.utils.arrayMap(tasks, function(task) {
        return new Task(ko.toJS(task));
    });

    self.tasks(mappedData);

    self.myDropCallback = function(arg, event, ui) {
       // console.log(arg.item.parent());
        console.log(ko.toJS(arg.item));
        console.log(arg.targetParent);

        arg.item.phaseId(2);

        console.log(ko.toJS(arg.item));

        //console.log("Moved '" + arg.item.title() + "' from " + arg.sourceParentNode.id + " (index: " + arg.sourceIndex + ") to " + arg.targetParent.id + " (index " + arg.targetIndex + ")");
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

    // Fetch story JSON data
    //jQuery.getJSON("/story/", parameters)
    //    .done(function(/** models.story[] */stories) {
    //        // Map fetched JSON data to story objects
    //        var mappedData = ko.utils.arrayMap(stories, function(/** models.story */story) {
    //            return new Story(story);
    //        });
    //
    //        self.stories(mappedData);
    //    });
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
    self.tasks          = ko.observableArray([]);
   // self.phases         = ko.observableArray([]);

    // Specify parameters to fetch task data
    var parameters = {
        storyId: self.id
    };

    // Fetch task JSON data
    jQuery.getJSON("/task/", parameters, function(/** models.task[] */tasks) {
        // Map fetched JSON data to task objects
        var mappedData = ko.utils.arrayMap(tasks, function(/** models.task */task) {
            return new Task(task);
        });

        self.tasks(mappedData);

        /*
        var mappedData = ko.utils.arrayMap(myViewModel.phases(), function(phase) {
            return new PhaseStory(phase, self.getTasks(phase.id()));
        });

        self.phases(mappedData)
        */
    });

    self.titleFormatted = ko.computed(function() {
        return self.title() + " (" + self.estimate() + ")";
    });

    self.getTasks = function(phaseId) {
        var output = [];

        ko.utils.arrayForEach(self.tasks(), function(task) {
            var taskPhaseId = parseInt(task.phaseId(), 10);

            if (isNaN(taskPhaseId)) {
                taskPhaseId = 0;
            }

            if (phaseId === taskPhaseId) {
                output.push(task);
            }
        });

        return output;
    };

    self.addNewTask = function(data, event) {
        var source = jQuery('#task-form-new').html();
        var template = Handlebars.compile(source);
        var templateData = {
            storyId: data.id(),
            users: ko.toJS(myViewModel.users())
        };

        //console.log(templateData);

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
                        var valid = true;

                        jQuery.each(formItems, function (key, value) {
                            var input = jQuery('#' + key);
                            var group = input.closest('.control-group');

                            if (input.prop('required') && jQuery.trim(input.val()) == '') {
                                group.addClass('error');

                                valid = false;
                            } else {
                                group.removeClass('error');
                            }
                        });

                        if (valid) {
                            jQuery.getJSON("/task/create/", formItems)
                                .done(function (/** models.task */task) {
                                    self.tasks.push(new Task(task));

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

        /*
        var task = {
            id: 22,
            storyId: data.id(),
            userId: 1,
            phaseId: 0,
            title: 'testi',
            description: 'lorem ipsum'
        };

        var newTask = new Task(task);

        self.tasks.push(newTask);

        console.log(data.id());
        console.log(event);
        */
    };

    self.myDropCallback = function (arg) {

        console.log("Moved '" + arg.item.title() + "' from " + arg.sourceParent.id + " (index: " + arg.sourceIndex + ") to " + arg.targetParent.id + " (index " + arg.targetIndex + ")");

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

