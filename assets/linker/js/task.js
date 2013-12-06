/**
 * /assets/linker/js/task.js
 *
 * This file contains all task specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form handlers
 */

/**
 * Task specified global event handlers. These events are following:
 *  - taskAdd
 *  - taskEdit
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * Task add event, this opens a modal bootbox dialog with task add form on it.
     *
     * Note that this event requires knockout story model in parameters.
     *
     * @param   {jQuery.Event}          event       Event object
     * @prop    {sails.knockout.story}  story       Story object
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     * @param   {{}}                    [formData]  Possible form data, simple key/value
     */
    body.on("taskAdd", function(event, story, trigger, formData) {
        trigger = trigger || false;
        formData = formData || {};

        jQuery.get("/Task/add", {projectId: story.projectId(), storyId: story.id(), formData: formData})
        .done(function(content) {
            var title = "Add new task to story '" + ko.toJS(story.title()) + "'";
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
                initTaskForm(modal);
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
            var form = jQuery("#formTaskNew", modal);
            var formItems = form.serializeJSON();

            // Validate current form items and try to create new task
            if (validateForm(formItems, modal)) {
                // Create new task
                socket.post("/Task", formItems, function(/** sails.json.task */data) {
                    if (handleSocketError(data)) {
                        makeMessage("Task created successfully.");

                        modal.modal("hide");

                        // User wants to close modal so just handle trigger
                        if (close) {
                            handleEventTrigger(trigger);
                        } else { // Otherwise trigger edit with same trigger
                            body.trigger("taskEdit", [data.id, trigger]);
                        }
                    }
                });
            }
        }
    });

    /**
     * Task edit event, this opens a modal bootbox dialog with task edit form on it.
     *
     * @param   {jQuery.Event}          event       Event object
     * @prop    {Number}                taskId      Task id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("taskEdit", function(event, taskId, trigger) {
        trigger = trigger || false;

        jQuery.get("/Task/edit", {id: taskId})
        .done(function(content) {
            var title = "Edit task";
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
                        // Trigger story delete event
                        body.trigger("taskDelete", [taskId, {trigger: "taskEdit", parameters: [taskId, trigger]}]);
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initTaskForm(modal);
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
            var form = jQuery("#formTaskEdit", modal);
            var formItems = form.serializeJSON();

            // Validate current form items and try to update task data
            if (validateForm(formItems, modal)) {
                // Update task data
                socket.put("/Task/"  + taskId, formItems, function(/** sails.json.task */data) {
                    if (handleSocketError(data)) {
                        makeMessage("Task updated successfully.");

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
     * Task delete event, this opens a modal bootbox confirm about task delete.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                taskId      Task id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("taskDelete", function(event, taskId, trigger) {
        trigger = trigger || false;

        // Make confirm box
        bootbox.confirm({
            title: "danger - danger - danger",
            message: "Are you sure of task delete?",
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
                    // Delete task
                    socket.delete("/Task/" + taskId + "?_csrf=" + getCsrfToken(), function(task) {
                        if (handleSocketError(task)) {
                            makeMessage("Task deleted successfully.");

                            handleEventTrigger(trigger, "taskEdit");
                        }
                    });
                } else {
                    handleEventTrigger(trigger);
                }
            }
        });
    });
});

/**
 * Function initializes task add/edit form to use. Note that form is located in modal content.
 *
 * @param   {jQuery|$}  modal   Current modal content
 */
function initTaskForm(modal) {
    var inputTitle = jQuery('input[name="title"]', modal);

    inputTitle.focus().val(inputTitle.val());
}