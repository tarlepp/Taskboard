/**
 * /assets/linker/js/sprint.js
 *
 * This file contains all sprint specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form handlers
 */

/**
 * Sprint specified global event handlers. These events are following:
 *  - sprintAdd
 *  - sprintEdit
 *  - sprintDelete
 *  - sprintBacklog
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * This event handles sprint add functionality. Basically event triggers
     * modal dialog for adding new sprint, form validation and actual POST query
     * to server after form data is validated.
     *
     * After POST query knockout data is updated.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     * @param   {{}}                    [formData]  Possible form data, simple key/value
     */
    body.on("sprintAdd", function(event, trigger, formData) {
        trigger = trigger || false;
        formData = formData || {};

        var projectId = myViewModel.project().id();

        jQuery.get("/Sprint/add", {projectId: projectId, formData: formData})
        .done(function(content) {
            var title = "Add sprint";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery("#formSprintNew", modal);
                        var formItems = form.serializeJSON();

                        // Validate form and try to create new sprint
                        if (validateForm(formItems, modal)) {
                            // Create new sprint
                            socket.post("/Sprint", formItems, function(/** sails.json.sprint */data) {
                                if (handleSocketError(data)) {
                                    makeMessage("New sprint added to project successfully.", "success", {});

                                    modal.modal("hide");

                                    handleEventTrigger(trigger);

                                    // Update client bindings
                                    myViewModel.processSocketMessage("sprint", "create", data.id, data);
                                }
                            });
                        }

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initSprintForm(modal, false);
            });

            // Open bootbox modal
            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * This event handles sprint edit functionality. Basically event triggers
     * modal dialog for editing currently selected sprint, form validation and
     * actual PUT query to server after form data is validated.
     *
     * After PUT query knockout data is updated.
     *
     * @param   {jQuery.Event}          event           Event object
     * @param   {Number}                [sprintId]      Sprint id, if not given fallback to current sprint
     * @param   {sails.helper.trigger}  [trigger]       Trigger to process after actions
     * @param   {{}}                    [parameters]    Init parameters, this is passed to form init function
     */
    body.on("sprintEdit", function(event, sprintId, trigger, parameters) {
        sprintId = sprintId || myViewModel.sprint().id();
        trigger = trigger || false;
        parameters = parameters || {};

        jQuery.get("/Sprint/edit", {id: sprintId})
        .done(function(content) {
            var title = "Edit sprint";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery("#formSprintEdit", modal);
                        var formItems = form.serializeJSON();

                        // Validate form and try to create new sprint
                        if (validateForm(formItems, modal)) {
                            // Update sprint data
                            socket.put("/Sprint/" + sprintId, formItems, function(/** sails.json.sprint */data) {
                                if (handleSocketError(data)) {
                                    makeMessage("Sprint saved successfully.", "success", {});

                                    modal.modal("hide");

                                    handleEventTrigger(trigger);

                                    // Update client bindings
                                    myViewModel.processSocketMessage("sprint", "update", data.id, data);
                                }
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    className: "btn-danger pull-right",
                    callback: function() {
                        body.trigger("sprintDelete", [sprintId, {trigger: "sprintEdit", parameters: [sprintId, trigger, parameters]}]);
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initSprintForm(modal, true, parameters);
            });

            // Open bootbox modal
            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * This event handles sprint delete functionality.
     *
     * @param   {jQuery.Event}          event           Event object
     * @param   {Number}                [sprintId]      Sprint id, if not given fallback to current sprint
     * @param   {sails.helper.trigger}  [trigger]       Trigger to process after actions
     */
    body.on("sprintDelete", function(event, sprintId, trigger) {
        trigger = trigger || false;

        // Open confirm dialog
        bootbox.confirm({
            title: "danger - danger - danger",
            message: "Are you sure of sprint delete? Existing user stories in this sprint are moved to project backlog.",
            buttons: {
                cancel: {
                    className: "btn-default pull-left"
                },
                confirm: {
                    label: "Delete",
                    className: "btn-danger pull-right"
                }
            },
            callback: function(result) {
                if (result) {
                    // Delete sprint data
                    socket.delete("/Sprint/" + sprintId, function(/** sails.json.sprint */sprint) {
                        if (handleSocketError(sprint)) {
                            makeMessage("Sprint deleted successfully.", "success", {});

                            handleEventTrigger(trigger);

                            // Update client bindings
                            myViewModel.processSocketMessage("sprint", "destroy", sprint.id, sprint);

                            // If sprint is currently selected => reset sprint data
                            if (myViewModel.sprint().id() === sprint.id) {
                                myViewModel.resetSprint();
                            }
                        }
                    });
                } else {
                    handleEventTrigger(trigger);
                }
            }
        });
    });

    /**
     * This event handles sprint backlog functionality. Basically this just triggers
     * sprintEdit event with proper parameters.
     *
     * @param   {jQuery.Event}          event           Event object
     * @param   {Number}                [sprintId]      Sprint id, if not given fallback to current sprint
     * @param   {sails.helper.trigger}  [trigger]       Trigger to process after actions
     */
    body.on("sprintBacklog", function(event, sprintId, trigger) {
        sprintId = sprintId || myViewModel.sprint().id();
        trigger = trigger || false;

        // Used parameters with sprint edit event
        var parameters = {
            activeTab: "backlog"
        };

        // Trigger sprint edit
        body.trigger("sprintEdit", [sprintId, trigger, parameters]);
    });
});

/**
 * Function initializes sprint add/edit form to use. Note that form is
 * located in modal content.
 *
 * @param   {jQuery|$}  modal           Current modal content
 * @param   {Boolean}   edit            Are we editing existing sprint or not
 * @param   {{}}        [parameters]    Custom parameters
 */
function initSprintForm(modal, edit, parameters) {
    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery("#" + parameters.activeTab + "Tab").click();
    }

    var inputTitle = jQuery("input[name='title']", modal);

    inputTitle.focus().val(inputTitle.val());

    var containerStart = jQuery(".dateStart", modal);
    var containerEnd = jQuery(".dateEnd", modal);
    var inputStart = containerStart.find("input");
    var inputEnd = containerEnd.find("input");
    var bitsStart = inputStart.val().split("-");
    var bitsEnd = inputEnd.val().split("-");
    var valueStart = null;
    var valueEnd = null;
    var dateMin = myViewModel.project().dateStartObject();
    var dateMax = myViewModel.project().dateEndObject();
    var sprintId = edit ? myViewModel.sprint().id() : 0;

    if (bitsStart.length === 3) {
        valueStart = new Date(bitsStart[0], bitsStart[1] - 1, bitsStart[2], 3, 0, 0);
    }

    if (bitsEnd.length === 3) {
        valueEnd = new Date(bitsEnd[0], bitsEnd[1] - 1, bitsEnd[2], 3, 0, 0);
    }

    containerStart.bootstrapDP({
        format: "yyyy-mm-dd",
        weekStart: 1,
        calendarWeeks: true
    })
    .on("changeDate", function(event) {
        if (valueEnd && event.date.format("yyyy-mm-dd") > valueEnd.format("yyyy-mm-dd")) {
            if (valueStart) {
                containerStart.val(valueStart.format("yyyy-mm-dd"));
            } else {
                containerStart.val("");
            }

            makeMessage("Start date cannot be later than end date.", "error", {});

            containerStart.closest(".input-group").addClass("has-error");
        } else if ((event.date.format("yyyy-mm-dd") < dateMin.format("yyyy-mm-dd"))
            || (event.date.format("yyyy-mm-dd") > dateMax.format("yyyy-mm-dd"))
        ) {
            makeMessage("Start date conflicts with project duration. Start date must be between " + dateMin.format("yyyy-mm-dd") + " and " + dateMax.format("yyyy-mm-dd")  + ".", "error", {});

            containerStart.closest(".input-group").addClass("has-error");
        } else if (checkSprintDates(event.date, 1, sprintId, true) !== true) {
            containerStart.closest(".input-group").addClass("has-error");
        } else {
            valueStart = new Date(event.date);

            containerStart.bootstrapDP("hide");
            containerStart.closest(".input-group").removeClass("has-error");
        }
    });

    containerEnd.bootstrapDP({
        format: "yyyy-mm-dd",
        weekStart: 1,
        calendarWeeks: true
    })
    .on("changeDate", function(event) {
        if (valueStart && event.date.format("yyyy-mm-dd") < valueStart.format("yyyy-mm-dd")) {
            if (valueEnd) {
                containerEnd.val(valueEnd.format("yyyy-mm-dd"));
            } else {
                containerEnd.val("");
            }

            makeMessage("End date cannot be before than start date.", "error", {});

            containerEnd.closest(".input-group").addClass("has-error");
        } else if ((event.date.format("yyyy-mm-dd") < dateMin.format("yyyy-mm-dd"))
            || (event.date.format("yyyy-mm-dd") > dateMax.format("yyyy-mm-dd"))
        ) {
            makeMessage("End date conflicts with project duration. End date must be between " + dateMin.format("yyyy-mm-dd") + " and " + dateMax.format("yyyy-mm-dd")  + ".", "error", {});

            containerStart.closest(".input-group").addClass("has-error");
        } else if (checkSprintDates(event.date, 1, sprintId, true) !== true) {
            containerStart.closest(".input-group").addClass("has-error");
        } else {
            valueEnd = new Date(event.date);

            containerEnd.bootstrapDP("hide");
            containerEnd.closest(".input-group").removeClass("has-error");
        }
    });
}

/**
 * Function initializes sprint backlog tab content to use. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initSprintTabBacklog(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});

    // User clicks action menu link
    body.on("click", "ul.actionMenu-actions a", function() {
        var element = jQuery(this);
        var storyId = element.data("storyId");
        var action = element.data("action");
        var selector = element.data("selector");

        // We have popover selector, so hide it
        if (selector) {
            jQuery(selector).popover("hide");
        }

        // Hide current modal
        modal.modal("hide");

        // Trigger milestone action event
        body.trigger(action, [storyId, "sprintBacklog"]);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-add-new-story='true']");

    // User wants to add new story to current sprint
    body.on("click", "[data-add-new-story='true']", function() {
        var element = jQuery(this);
        var sprintId = element.data("sprintId");
        var projectId = element.data("projectId");

        // Hide current modal
        modal.modal("hide");

        // Trigger story add
        body.trigger("storyAdd", [projectId, sprintId, {trigger: "sprintBacklog", parameters: [sprintId]}]);
    });

    // Make story table to be sortable
    jQuery("#sprintBacklog tbody", container).sortable({
        axis: "y",
        helper: function(e, tr) {
            var helper = tr.clone();

            return helper.addClass("sortable");
        },
        stop: function(event, ui) {
            var table = jQuery("#sprintBacklog", container);
            var rows = table.find("tbody tr");
            var errors = false;
            var update = [];

            rows.fadeTo(0, 0.5);

            // Iterate each row
            rows.each(function(index) {
                var storyId = jQuery(this).data("storyId");

                /**
                 * Update story data via socket does not work - wtf
                 *
                 * This is a mystery, why socket doesn't work here? Am I missing something
                 * or am I just stupid?
                 */
                //socket.put("/Story/" + storyId, {priority: index + 1}, function(story) {
                //    if (handleSocketError(story)) {
                //        update.push(true);
                //
                //        myViewModel.processSocketMessage("story", "update", story.id, story);
                //    } else {
                //        update.push(false);
                //
                //        errors = true;
                //    }
                //
                //    // Check if all is done
                //    checkUpdate();
                //});

                jQuery.ajax({
                    url: "/Story/" + storyId,
                    data: {
                        priority: index + 1
                    },
                    type: "PUT",
                    dataType: "json"
                })
                .done(function() {
                    update.push(true);

                    // Check if all is done
                    checkUpdate();
                })
                .fail(function(jqXhr, textStatus, error) {
                    update.push(false);

                    errors = true;

                    handleAjaxError(jqXhr, textStatus, error);
                });
            });

            // Function to make sure that we have updated all rows.
            function checkUpdate() {
                if (update.length == rows.length) {
                    var message = "";
                    var type = "success";

                    if (errors) {
                        type = "error";
                        message = "Error in stories priority update"
                    } else {
                        message = "Stories priorities changed successfully";
                    }

                    makeMessage(message, type, {});

                    rows.fadeTo(0, 1);
                }
            }
        }
    });
}