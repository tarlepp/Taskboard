/**
 * models.js
 *
 * This file contains all used knockout model objects.
 */

/**
 * Object to present project.
 *
 * @param   {models.rest.project}    data
 * @constructor
 */
function Project(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.managerId      = ko.observable(data.managerId);
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.dateStart      = ko.observable(data.dateStart);
    self.dateEnd        = ko.observable(data.dateEnd);
    self.manager        = ko.observable(null);
    self.sprints        = ko.observableArray([]);
    self.sprintDateMin  = ko.observable(null);
    self.sprintDateMax  = ko.observable(null);

    // Iterate users and set manager
    jQuery.each(myViewModel.users(), function(index, user) {
        if (self.managerId() === user.id()) {
            self.manager(user);
        }
    });

    self.dateStartObject = ko.computed(function() {
        return new Date(self.dateStart());
    });

    self.dateEndObject = ko.computed(function() {
        return new Date(self.dateEnd());
    });

    self.dateStartFormatted = ko.computed(function() {
        var date = new Date(self.dateStart());

        return date.format('yyyy-mm-dd');
    });

    self.dateEndFormatted = ko.computed(function() {
        var date = new Date(self.dateEnd());

        return date.format('yyyy-mm-dd');
    });
}

/**
 * Object to present project phases.
 *
 * @param   {models.rest.phase}    data
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
     * return 'text-danger' class otherwise empty string.
     */
    self.phaseTaskCountStatus = ko.computed(function() {
        return self.tasks() < 1 ? '' : (self.tasks() < self.cntTask() ? 'text-danger' : '');
    });

    /**
     * Method returns formatted phase task count text. This is shown
     * in phase title.
     *
     * Note that output varies with user selections and phase settings.
     */
    self.phaseTaskCountText = ko.computed(function() {
        var output;

        if (self.cntTask() == '' && self.cntTasksMax() == '') {
            output = '';
        } else {
            output = '(';

            if (myViewModel.sprint()) {
                output += self.cntTask() == '' ? 0 : self.cntTask();

                if (self.cntTasksMax() != '') {
                    output += '/' + self.cntTasksMax();
                }
            } else if (self.cntTasksMax() != '') {
                output += self.cntTasksMax();
            }

            output += ')';
        }

        return output;
    });
}

/**
 * Object to present sprint.
 *
 * @param   {models.rest.sprint}    data
 * @constructor
 */
function Sprint(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.dateStart      = ko.observable(data.dateStart);
    self.dateEnd        = ko.observable(data.dateEnd);
    self.stories        = ko.observableArray([]);

    self.dateStartObject = ko.computed(function() {
        return new Date(self.dateStart());
    });

    self.dateEndObject = ko.computed(function() {
        return new Date(self.dateEnd());
    });

    self.formattedDuration = ko.computed(function() {
        return self.dateStartObject().format('isoDate') + " - " + self.dateEndObject().format('isoDate');
    });

    // Make formatted sprint title
    self.formattedTitle = ko.computed(function() {
        return self.formattedDuration() + " " +  self.title();
    });

    // Sprint duration as in days
    self.duration = ko.computed(function() {
        return self.dateStartObject().getDate() - self.dateEndObject().getDate();
    });
}

/**
 * Object to present story.
 *
 * @param   {models.rest.story}    data
 * @constructor
 */
function Story(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.projectId      = ko.observable(data.projectId);
    self.sprintId       = ko.observable(data.sprintId);
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
    jQuery.getJSON("/task/", parameters, function(/** models.rest.task[] */tasks) {
        // Map fetched JSON data to task objects
        var tasksObjects = ko.utils.arrayMap(tasks, function(/** models.rest.task */task) {
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

        self.phases(phases);
    });

    // Sorted phases
    self.sortedPhases = ko.computed(function() {
        return self.phases().sort(function(a, b) {
            return a.order() > b.order() ? 1 : -1;
        });
    });

    // Formatted story title
    self.formattedTitle = ko.computed(function() {
        return self.title() + " (" + (self.estimate() == -1 ? '???' : self.estimate()) + ")";
    });

    self.storyRowId = ko.computed(function() {
        return "storyRow_" + self.id();
    });

    // Story description tooltip text
    self.descriptionTooltip = ko.computed(function() {
        var description = self.description();

        // No description but VF case defined
        if (description.length === 0) {
            description = "<em>No description...</em>";
        }

        var parts = [];

        parts.push("Estimate: " + (self.estimate() == -1 ? "???" : self.estimate()));

        // ValueFrame case defined
        if (self.vfCase()) {
            parts.push("ValueFrame case: <a href=''>#" + self.vfCase() + "</a>");
        }

        description += "<hr />" + parts.join("\n");

        return description;
    });

    /**
     * Method triggers add a new task for current story.
     *
     * @param   {models.knockout.story} data    Current story knockout model object
     * @param   {jQuery}                event   Event data
     */
    self.addNewTask = function(data, event) {
        jQuery('body').trigger('taskAdd', [data]);
    };
}

/**
 * Object to present story phase.
 *
 * @param   {models.rest.phase|models.rest.phaseStory}  phase   Phase data
 * @param   {models.knockout.task[]}                    tasks   Task data for current phase
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

    self.taskTemplate = function() {
        return self.tasks().length > 5 ? 'task-template-small' : 'task-template-normal';
    };

    self.myDropCallback = function(arg, event, ui) {
        var context = ko.contextFor(this);
        var phase = ko.toJS(context.$data);

        jQuery.ajax({
            type: 'PUT',
            url: "/task/" + arg.item.id(),
            data: {
                phaseId: phase.id
            },
            dataType: 'json'
        })
        .done(function (task) {
            // Todo: update task model data
        })
        .fail(function (jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    };
}

/**
 * Object to present task.
 *
 * @param   {models.rest.task}  data
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
    self.user           = ko.observable(null);

    // Iterate users and set manager
    jQuery.each(myViewModel.users(), function(index, user) {
        if (self.userId() === user.id()) {
            self.user(user);
        }
    });

    // Fix tasks that have not yet phase id defined
    if (self.phaseId() === null || self.phaseId() === 0) {
        self.phaseId(myViewModel.phases()[0].id());
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

    // Task description tooltip text
    self.descriptionTooltip = ko.computed(function() {
        if (self.description().length === 0) {
            return '';
        }

        return self.description();
    });
}

/**
 * Object to present user.
 *
 * @param   {models.rest.user}    data
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
 * @param   {models.rest.type}    data
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