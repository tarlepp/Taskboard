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
        return self.dateStartObject().format(myViewModel.user().momentFormatDate()) + " - " + self.dateEndObject().format(myViewModel.user().momentFormatDate());
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
    self.isDone         = ko.observable(data.isDone);

    // Calculate phase column width
    self.getColumnWidth = function(reservedSize, phasesCount) {
        var columnWidth = (100 - reservedSize) / phasesCount;

        return columnWidth + "%";
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
        return _.size(_.filter(myViewModel.tasks(), function(task) { return task.phaseId() === self.id(); } ));
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
        return self.dateStartObject().format(myViewModel.user().momentFormatDate()) + " - " + self.dateEndObject().format(myViewModel.user().momentFormatDate());
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
    self.timeStart      = ko.observable(data.timeStart);
    self.timeEnd        = ko.observable(data.timeEnd);
    self.isDone         = ko.observable(data.isDone);
    self.tasks          = ko.observableArray([]);

    // Formatted story title
    self.formattedTitle = ko.computed(function() {
        if (self.estimate() == -1) {
            return self.title();
        } else {
            return self.title() + " (" + (self.estimate() == -1 ? '???' : self.estimate()) + ")";
        }
    });

    self.storyRowId = ko.computed(function() {
        return "storyRow_" + self.id();
    });

    self.timeStartObject = ko.computed(function() {
        return dateConvertToMoment(self.timeStart());
    });

    self.timeEndObject = ko.computed(function() {
        return dateConvertToMoment(self.timeEnd());
    });

    // Story description tooltip text
    self.descriptionTooltip = ko.computed(function() {
        var description = self.description();

        // No description but VF case defined
        if (_.isUndefined(description) || description.length === 0) {
            description = "<em>No description...</em>";
        } else {
            description = description.stripTags().truncate(200, true).nl2br();
        }

        var parts = [];

        if (self.estimate() != -1) {
            parts.push("<tr><th>Estimate:</th><td>" + self.estimate() + "</td></tr>");
        }

        if (moment.isMoment(self.timeStartObject()) && self.timeStartObject().isValid()) {
            parts.push("<tr><th>Started:</th><td>" + self.timeStartObject().tz(myViewModel.user().momentTimezone()).format(myViewModel.user().momentFormatDateTime()) + "</td></tr>");
        }

        if (moment.isMoment(self.timeEndObject()) && self.timeEndObject().isValid()) {
            parts.push("<tr><th>Ended:</th><td>" + self.timeEndObject().tz(myViewModel.user().momentTimezone()).format(myViewModel.user().momentFormatDateTime()) + "</td></tr>");
        }

        if ((moment.isMoment(self.timeStartObject()) && self.timeStartObject().isValid())
            && (moment.isMoment(self.timeEndObject()) && self.timeEndObject().isValid())) {
            parts.push("<tr><th>Duration:</th><td>" + self.timeStartObject().from(self.timeEndObject(), true) + "</td></tr>");
        }

        description += "<hr /><table class='info'>" + parts.join("") + "</table>";

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
    self.currentUserId  = ko.observable(data.currentUserId);
    self.phaseId        = ko.observable(data.phaseId);
    self.typeId         = ko.observable(data.typeId);
    self.title          = ko.observable(data.title);
    self.description    = ko.observable(data.description);
    self.priority       = ko.observable(data.priority);
    self.timeStart      = ko.observable(data.timeStart);
    self.timeEnd        = ko.observable(data.timeEnd);
    self.timer          = ko.observable(moment());

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

    self.isMine = ko.computed(function() {
        return self.userId() === myViewModel.user().id();
    });

    self.timeStartObject = ko.computed(function() {
        return dateConvertToMoment(self.timeStart());
    });

    self.timeEndObject = ko.computed(function() {
        return dateConvertToMoment(self.timeEnd());
    });

    self.ownerUser = ko.computed(function() {
        return _.find(myViewModel.users(), function(user) { return user.id() === self.userId(); });
    });

    self.currentUser = ko.computed(function() {
        return _.find(myViewModel.users(), function(user) { return user.id() === self.currentUserId(); });
    });

    // Task description tooltip text
    self.descriptionTooltip = ko.computed(function() {
        var description = self.description();

        // No description but VF case defined
        if (_.isUndefined(description) || description.length === 0) {
            description = "<em>No description...</em>";
        } else {
            description = description.stripTags().truncate(200, true).nl2br();
        }

        var parts = [];

        // Owner block
        if (self.ownerUser()) {
            var rowSpan = moment.isMoment(self.timeEndObject()) ? 4 : 3;

            parts.push("<tr><th>Owner:</th><td>" + self.ownerUser().fullName() + "</td><td class='gravatar' rowspan='" + rowSpan + "'><img src='" + self.ownerUser().gravatar() + "' /></td></tr>");

            if (moment.isMoment(self.timeStartObject())) {
                parts.push("<tr><th>Started:</th><td>" + self.timeStartObject().tz(myViewModel.user().momentTimezone()).format(myViewModel.user().momentFormatDateTime()) + "</td></tr>");

                if (moment.isMoment(self.timeEndObject())) {
                    parts.push("<tr><th>Finished:</th><td>" + self.timeEndObject().tz(myViewModel.user().momentTimezone()).format(myViewModel.user().momentFormatDateTime()) + "</td></tr>");
                    parts.push("<tr><th>Duration:</th><td>" + self.timeStartObject().from(self.timeEndObject(), true) + "</td></tr>");
                } else {
                    parts.push("<tr><th>Duration:</th><td>" + self.timeStartObject().from(self.timer(), true) + " <span class='text-muted'>so far</span></td></tr>");
                }
            }

            description += "<hr /><table class='info'>" + parts.join("") + "</table>";
        }

        parts = [];

        if (self.currentUser()) {
            parts.push("<tr><th>Author:</th><td>" + self.currentUser().fullName() + "</td><td class='gravatar' rowspan='3'><img src='" + self.currentUser().gravatar() + "' /></td></tr>");
            parts.push("<tr><td colspan='2'><a href='javascript: void(0);' class='text-danger' onclick='myViewModel.releaseTask(" + self.id() + ");'><i class='fa fa-times'></i> Release this</a></td></tr>")
        }

        var phase = _.find(myViewModel.phases(), function(phase) { return phase.id() === self.phaseId(); });

        if (phase && phase.order() !== 0 && !phase.isDone()) {
            parts.push("<tr><td colspan='2'><a href='javascript: void(0);' class='text-success' onclick='myViewModel.takeTask(" + self.id() + ");'><i class='fa fa-thumb-tack'></i> Take this</a> " +
                "</td></tr>"
            );
        }

        if (parts.length > 0) {
            description += "<hr /><table class='info'>" + parts.join("") + "</table>";
        }

        // Get links that are attached to this object
        var links = _.filter(myViewModel.links(), function(link) {
            return link.objectName() === "Task" && link.objectId() === self.id();
        });

        // Yeah baby, we have some links attached
        if (links.length > 0) {
            parts = [];

            // Sort and group links by external link title
            var groupLinks = _.groupBy(_.sortBy(links, function(link) {
                return link.externalLink().title;
            }), function(link) {
                return link.externalLink().title;
            });

            // Iterate each link group
            _.each(groupLinks, function(links, title) {
                var bits = [];

                // Iterate each links in current group
                _.each(_.sortBy(links, function(link) {
                    return link.name();
                }), function(link) {
                    bits.push("<a href='" + link.link() +"' target='_blank'>" + link.name() + "</a>");
                });

                parts.push("<tr><th>" + title + ":</th><td>" + bits.join(", ") + "</td>");
            });

            description += "<hr /><table class='info'>" + parts.join("") + "</table>";
        }

        return description;
    });

    // Set interval to timer, this is needed to update tooltip duration data on tasks which are started
    if (moment.isMoment(self.timeStartObject()) && !moment.isMoment(self.timeEndObject())) {
        window.setInterval(function() { self.timer(moment()); }, 60000);
    }
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
    self.id                         = ko.observable(data.id);
    self.username                   = ko.observable(data.username);
    self.firstName                  = ko.observable(data.firstName);
    self.lastName                   = ko.observable(data.lastName);
    self.email                      = ko.observable(data.email);
    self.admin                      = ko.observable(data.admin);
    self.language                   = ko.observable(data.language);
    self.momentFormatDate           = ko.observable(data.momentFormatDate);
    self.momentFormatDateTime       = ko.observable(data.momentFormatDateTime);
    self.momentFormatTime           = ko.observable(data.momentFormatTime);
    self.momentTimezone             = ko.observable(data.momentTimezone);
    self.taskTemplateChangeLimit    = ko.observable(6);
    self.boardSettingHideDoneStories= ko.observable(data.boardSettingHideDoneStories);

    var taskTemplateChangeLimit = parseInt(data.taskTemplateChangeLimit);

    if (!isNaN(taskTemplateChangeLimit) && taskTemplateChangeLimit > 0) {
        self.taskTemplateChangeLimit(taskTemplateChangeLimit);
    }

    // Make formatted fullname
    self.fullName = ko.computed(function() {
        return self.firstName() + " " + self.lastName();
    });

    self.gravatar = ko.computed(function() {
        return getGravatarImageUrl(self.email());
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

/**
 * Object to present link.
 *
 * @param   {sails.json.type}    data
 * @constructor
 */
function Link(data) {
    var self = this;

    // Initialize object data
    self.id             = ko.observable(data.id);
    self.link           = ko.observable(data.link);
    self.name           = ko.observable(data.name);
    self.objectId       = ko.observable(data.objectId);
    self.objectName     = ko.observable(data.objectName);
    self.externalLink   = ko.observable(data.externalLink);
}
