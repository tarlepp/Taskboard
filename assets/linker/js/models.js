/**
 * /assets/linker/js/models.js
 *
 * @file Contains all used knockout model objects.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */

/**
 * Object to present project.
 *
 * @param   {sails.json.project}  data
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

    self.dateStartObject = ko.computed(function() {
        return moment(self.dateStart());
    });

    self.dateEndObject = ko.computed(function() {
        return moment(self.dateEnd());
    });

    self.formattedDuration = ko.computed(function() {
        return self.dateStartObject().format(userObject.momentFormatDate) + " - " + self.dateEndObject().format(userObject.momentFormatDate);
    });

    // Make formatted project title
    self.formattedTitle = ko.computed(function() {
        return self.formattedDuration() + " " +  self.title();
    });

    // Project duration as in days
    self.duration = ko.computed(function() {
        return self.dateEndObject().diff(self.dateStartObject(), "days") + 1;
    });
}

/**
 * Object to present project phases.
 *
 * @param   {sails.json.phase}    data
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
     * @return  {Number}
     */
    self.cntTask = ko.computed(function() {
        return _.size(_.filter(myViewModel.tasks(), function(task) { return task.phaseId() === self.id(); }));
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
 * @param   {sails.json.sprint}     data
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

    self.dateStartObject = ko.computed(function() {
        return moment(self.dateStart());
    });

    self.dateEndObject = ko.computed(function() {
        return moment(self.dateEnd());
    });

    self.formattedDuration = ko.computed(function() {
        return self.dateStartObject().format(userObject.momentFormatDate) + " - " + self.dateEndObject().format(userObject.momentFormatDate);
    });

    // Make formatted sprint title
    self.formattedTitle = ko.computed(function() {
        return self.formattedDuration() + " " +  self.title();
    });

    // Sprint duration as in days
    self.duration = ko.computed(function() {
        return self.dateEndObject().diff(self.dateStartObject(), "days") + 1;
    });
}

/**
 * Object to present story.
 *
 * @param   {sails.json.story}  data
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
    self.timeStart      = ko.observable(data.timeStart);
    self.timeEnd        = ko.observable(data.timeEnd);
    self.tasks          = ko.observableArray([]);

    // Formatted story title
    self.formattedTitle = ko.computed(function() {
        return self.title() + " (" + (self.estimate() == -1 ? '???' : self.estimate()) + ")";
    });

    self.storyRowId = ko.computed(function() {
        return "storyRow_" + self.id();
    });

    self.timeStartObject = ko.computed(function() {
        return moment(self.timeStart());
    });

    self.timeEndObject = ko.computed(function() {
        return moment(self.timeEnd());
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

        if (moment.isMoment(self.timeStartObject()) && self.timeStartObject().isValid()) {
            parts.push("Started: " + self.timeStartObject().format(userObject.momentFormatDateTime) );
        }

        if (moment.isMoment(self.timeEndObject()) && self.timeEndObject().isValid()) {
            parts.push("Ended: " + self.timeEndObject().format(userObject.momentFormatDateTime) );
        }

        if ((moment.isMoment(self.timeStartObject()) && self.timeStartObject().isValid())
            && (moment.isMoment(self.timeEndObject()) && self.timeEndObject().isValid())) {
            parts.push("Duration: " + self.timeStartObject().from(self.timeEndObject(), true));
        }

        // ValueFrame case defined
        if (self.vfCase()) {
            parts.push("ValueFrame case: <a href=''>#" + self.vfCase() + "</a>");
        }

        description += "<hr />" + parts.join("<br />");

        return description;
    });

    /**
     * Method triggers add a new task for current story.
     *
     * @param   {models.knockout.story} data    Current story knockout model object
     * @param   {jQuery}                event   Event data
     */
    self.addNewTask = function(data, event) {
        if (myViewModel.role() === 0) {
            makeMessage("Insufficient rights to add new tasks to this project.", "error");
        } else {
            jQuery('body').trigger('taskAdd', [data]);
        }
    };
}

/**
 * Object to present task.
 *
 * @param   {sails.json.task}  data
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
    self.timeStart      = ko.observable(data.timeStart);
    self.timeEnd        = ko.observable(data.timeEnd);

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

    self.timeStartObject = ko.computed(function() {
        return moment(self.timeStart());
    });

    self.timeEndObject = ko.computed(function() {
        return moment(self.timeEnd());
    });
}

/**
 * Object to present user.
 *
 * @param   {sails.json.user}    data
 * @constructor
 */
function User(data) {
    var self = this;

    // Initialize object data
    self.id         = ko.observable(data.id);
    self.username   = ko.observable(data.username);
    self.firstName  = ko.observable(data.firstName);
    self.lastName   = ko.observable(data.lastName);
    self.email      = ko.observable(data.email);

    // Make formatted fullname
    self.fullName = ko.computed(function() {
        return self.firstName() + " " + self.lastName();
    });
}

/**
 * Object to present task type.
 *
 * @param   {sails.json.type}    data
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
