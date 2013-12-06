/**
 * /assets/linker/js/milestone.js
 *
 * This file contains all milestone specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form handlers
 */

/**
 * Milestone specified global event handlers. These events are following:
 *  - milestoneAdd
 *  - milestoneEdit
 *  - milestoneDelete
 *  - milestoneStories
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * Milestone add event. This opens a modal dialog with milestone add form.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     * @param   {{}}                    [formData]  Possible form data, simple key/value
     */
    body.on("milestoneAdd", function(event, projectId, trigger, formData) {
        trigger = trigger || false;
        formData = formData || {};

        jQuery.get("/Milestone/add", {projectId: projectId, formData: formData})
        .done(function(content) {
            var title = "Add new milestone";
            var buttons = [
                {
                    label: "Save and close",
                    className: "btn-primary pull-right",
                    callback: function() {
                        save(modal, trigger, true);

                        return false;
                    }
                },
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function () {
                        save(modal, trigger, false);

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initMilestoneForm(modal);
            });

            // Open bootbox modal
            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });

        /**
         * Method makes actual save function for current model and closes dialog + fire specified
         * trigger event OR opens edit modal with specified trigger event.
         *
         * @param   {jQuery|$}                  modal
         * @param   {sails.helper.trigger|bool} trigger
         * @param   {boolean}                   close
         */
        function save(modal, trigger, close) {
            var form = jQuery("#formMilestoneNew", modal);
            var formItems = form.serializeJSON();

            // Validate current form items and try to create new task
            if (validateForm(formItems, modal)) {
                // Create new milestone via socket
                socket.post("/Milestone/", formItems, function(/** sails.json.milestone */data) {
                    if (handleSocketError(data)) {
                        makeMessage("Milestone created successfully.");

                        modal.modal("hide");

                        // User wants to close modal so just handle trigger
                        if (close) {
                            handleEventTrigger(trigger);
                        } else { // Otherwise trigger edit with same trigger
                            body.trigger("milestoneEdit", [data.id, trigger]);
                        }
                    }
                });
            }
        }
    });

    /**
     * Milestone edit event, this opens a modal bootbox dialog with milestone edit form on it.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                milestoneId Milestone id
     * @param   {sails.helper.trigger}  trigger     Trigger to process after actions, if not defined fallback
     *                                              always to projectMilestones event.
     * @param   {{}}                    parameters  Init parameters, this is passed to form init function
     */
    body.on("milestoneEdit", function(event, milestoneId, trigger, parameters) {
        trigger = trigger || { trigger: "projectMilestones", parameters: [myViewModel.project().id()] };
        parameters = parameters || {};

        jQuery.get("/Milestone/edit", {id: milestoneId})
        .done(function(content) {
            var title = "Edit milestone";
            var buttons = [
                {
                    label: "Save and close",
                    className: "btn-primary pull-right",
                    callback: function() {
                        save(modal, trigger, true);

                        return false;
                    }
                },
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        save(modal, trigger, false);

                        return false;
                    }
                },
                {
                    label: "Delete",
                    className: "btn-danger pull-right",
                    callback: function() {
                        // Trigger milestone delete event
                        body.trigger("milestoneDelete", [milestoneId, {trigger: "milestoneEdit", parameters: [milestoneId, trigger]}]);
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initMilestoneForm(modal, parameters);
            });

            // Open bootbox modal
            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });

        /**
         * Method makes actual save function for current model and closes dialog + fire specified
         * trigger event OR opens edit modal with specified trigger event.
         *
         * @param   {jQuery|$}                  modal
         * @param   {sails.helper.trigger|bool} trigger
         * @param   {boolean}                   close
         */
        function save(modal, trigger, close) {
            var form = jQuery("#formMilestoneEdit", modal);
            var formItems = form.serializeJSON();

            // Validate current form items and try to update milestone data
            if (validateForm(formItems, modal)) {
                // Update milestone data
                socket.put("/Milestone/"  + milestoneId, formItems, function(/** sails.json.milestone */data) {
                    if (handleSocketError(data)) {
                        makeMessage("Milestone updated successfully.");

                        // User wants to close modal so just handle trigger
                        if (close) {
                            handleEventTrigger(trigger);

                            modal.modal("hide");
                        }
                    }
                });
            }
        }
    });

    /**
     * Milestone delete event,
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                milestoneId Milestone id
     * @param   {sails.helper.trigger}  trigger     Trigger to process after action,
     */
    body.on("milestoneDelete", function(event, milestoneId, trigger) {
        bootbox.confirm({
            title: "danger - danger - danger",
            message: "Are you sure of milestone delete?",
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-default pull-left"
                },
                confirm: {
                    label: "Delete",
                    className: "btn-danger pull-right"
                }
            },
            callback: function(result) {
                if (result) {
                    // Remove milestone via socket
                    socket.delete("/Milestone/" + milestoneId, {_csrf: getCsrfToken()}, function(/** sails.json.milestone */milestone) {
                        if (handleSocketError(milestone)) {
                            makeMessage("Milestone deleted successfully.");

                            handleEventTrigger(trigger, "milestoneEdit");
                        }
                    });
                } else {
                    handleEventTrigger(trigger);
                }
            }
        });
    });

    /**
     * This event handles milestone stories functionality. Basically this just triggers
     * milestoneEdit event with proper parameters.
     *
     * @param   {jQuery.Event}          event           Event object
     * @param   {Number}                milestoneId     Milestone id
     * @param   {sails.helper.trigger}  [trigger]       Trigger to process after actions
     */
    body.on("milestoneStories", function(event, milestoneId, trigger) {
        trigger = trigger || false;

        // Used parameters with milestone edit event
        var parameters = {
            activeTab: "stories"
        };

        // Trigger sprint edit
        body.trigger("milestoneEdit", [milestoneId, trigger, parameters]);
    });
});

/**
 * Function initializes milestone form.
 *
 * @param   {jQuery|$}  context         Current modal content
 * @param   {{}}        [parameters]    Form parameters
 */
function initMilestoneForm(context, parameters) {
    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery("#" + parameters.activeTab + "Tab").click();
    }

    var body = jQuery("body");
    var inputTitle = jQuery("input[name='title']", context);
    var containerDeadline = jQuery(".deadline", context);

    inputTitle.focus().val(inputTitle.val());

    containerDeadline.bootstrapDP({
        format: "yyyy-mm-dd",
        weekStart: 1,
        calendarWeeks: true
    })
    .on("changeDate", function(event) {
        var eventDate = moment(
            new Date(
                Date.UTC(
                    event.date.getFullYear(),
                    event.date.getMonth(),
                    event.date.getDate(),
                    event.date.getHours(),
                    event.date.getMinutes(),
                    event.date.getSeconds()
                )
            )
        ).tz("Etc/Universal");

        var isValid = checkProjectDates(eventDate, false);

        if (isValid !== true) {
            makeMessage(isValid, "error");

            containerDeadline.closest(".input-group").addClass("has-error");
        } else {
            containerDeadline.closest(".input-group").removeClass("has-error");
            containerDeadline.bootstrapDP("hide");
        }
    });
}

/**
 * Function initializes milestone list to use. Note that milestone list
 * content is in modal parameter.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initMilestoneTabStories(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});

    // User clicks action menu link
    body.on("click", "ul.actionMenu-actions a", function() {
        var element = jQuery(this);
        var storyId = element.data("storyId");
        var milestoneId = element.data("milestoneId");
        var action = element.data("action");
        var selector = element.data("selector");

        // We have popover selector, so hide it
        if (selector) {
            jQuery(selector).popover("hide");
        }

        // Hide current modal
        modal.modal("hide");

        // Specify trigger to fire after story action
        var trigger = {
            trigger: "milestoneStories",
            parameters: [milestoneId]
        };

        // Trigger story action event
        body.trigger(action, [storyId, trigger]);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-add-new-story='true']");

    // User wants to add new story to current sprint
    body.on("click", "[data-add-new-story='true']", function() {
        var element = jQuery(this);
        var milestoneId = element.data("milestoneId");
        var projectId = element.data("projectId");

        // Hide current modal
        modal.modal("hide");

        // Specify trigger to fire after story action
        var trigger = {
            trigger: "milestoneStories",
            parameters: [milestoneId]
        };

        // Specify form data
        var formData = {
            milestoneId: milestoneId
        };

        // Trigger story add
        body.trigger("storyAdd", [projectId, 0, trigger, formData]);
    });
}