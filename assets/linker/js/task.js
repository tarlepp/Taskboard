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
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery("#formTaskNew", modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to create new task
                        if (validateForm(formItems, modal)) {
                            // Create new task
                            socket.post("/Task", formItems, function(/** sails.json.task */task) {
                                if (handleSocketError(task)) {
                                    makeMessage("Task created successfully.");

                                    modal.modal("hide");

                                    handleEventTrigger(trigger);

                                    // Update client bindings
                                    myViewModel.processSocketMessage("task", "create", task.id, task);
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
                initTaskForm(modal);
            });

            // Open bootbox modal
            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Task edit event, this opens a modal bootbox dialog with task edit form on it.
     *
     * @param   {jQuery.Event}          event       Event object
     * @prop    {sails.knockout.task}   task        Task object
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("taskEdit", function(event, task, trigger) {
        trigger = trigger || false;

        jQuery.get("/Task/edit", {id: task.id()})
        .done(function(content) {
            var title = "Edit task";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery("#formTaskEdit", modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to update task data
                        if (validateForm(formItems, modal)) {
                            // Update task data
                            socket.put("/Task/"  + task.id(), formItems, function(/** sails.json.task */task) {
                                if (handleSocketError(task)) {
                                    makeMessage("Task updated successfully.");

                                    modal.modal("hide");

                                    handleEventTrigger(trigger);

                                    // Update client bindings
                                    myViewModel.processSocketMessage("task", "update", task.id, task);
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
                                    socket.delete("/Task/" + task.id(), function(task) {
                                        if (handleSocketError(task)) {
                                            makeMessage("Task deleted successfully.");

                                            handleEventTrigger(trigger);

                                            // Update client bindings
                                            myViewModel.processSocketMessage("task", "destroy", task.id, task);
                                        }
                                    });
                                } else {
                                    body.trigger('taskEdit', [task, trigger]);
                                }
                            }
                        });
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