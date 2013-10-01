/**
 * /assets/linker/js/user.js
 *
 * This file contains all user specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form handlers
 */

/**
 * Task specified global event handlers. These events are following:
 *  - userList
 *  - userAdd
 *  - userEdit
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    body.on('userList', function(event, trigger) {
        trigger = trigger || false;

        jQuery.get("/User/list")
            .done(function(content) {
                var title = "Current users";
                var buttons = [
                    {
                        label: "Add new user",
                        className: "btn-primary pull-right",
                        callback: function () {
                            modal.modal("hide");

                            body.trigger("userAdd", [{trigger: "userList", parameters: []}]);

                            return false;
                        }
                    }
                ];

                // Create bootbox modal
                var modal = createBootboxDialog(title, content, buttons, trigger);

                // Make form init when dialog is opened.
                modal.on("shown.bs.modal", function() {
                    initUserList(modal);
                });

                // Open bootbox modal
                modal.modal("show");
            })
            .fail(function(jqXhr, textStatus, error) {
                handleAjaxError(jqXhr, textStatus, error);
            });
    });

    body.on('userAdd', function(event, trigger, formData) {
        trigger = trigger || false;
        formData = formData || {};

        jQuery.get("/User/add")
            .done(function(content) {
                var title = "Add new user";
                var buttons = [
                    {
                        label: "Save",
                        className: "btn-primary pull-right",
                        callback: function () {
                            console.log("implement user add");

                            modal.modal("hide");

                            handleEventTrigger(trigger);

                            return false;
                        }
                    }
                ];

                // Create bootbox modal
                var modal = createBootboxDialog(title, content, buttons, trigger);

                // Make form init when dialog is opened.
                modal.on("shown.bs.modal", function() {
                    initUserForm(modal);
                });

                // Open bootbox modal
                modal.modal("show");
            })
            .fail(function(jqXhr, textStatus, error) {
                handleAjaxError(jqXhr, textStatus, error);
            });
    });

    body.on('userEdit', function(event, userId, trigger) {
        trigger = trigger || false;

        jQuery.get("/User/edit?id=" + userId)
            .done(function(content) {
                var title = "Add new user";
                var buttons = [
                    {
                        label: "Save",
                        className: "btn-primary pull-right",
                        callback: function () {
                            console.log("implement user save");

                            modal.modal("hide");

                            handleEventTrigger(trigger);

                            return false;
                        }
                    }
                ];

                // Create bootbox modal
                var modal = createBootboxDialog(title, content, buttons, trigger);

                // Make form init when dialog is opened.
                modal.on("shown.bs.modal", function() {
                    initUserForm(modal);
                });

                // Open bootbox modal
                modal.modal("show");
            })
            .fail(function(jqXhr, textStatus, error) {
                handleAjaxError(jqXhr, textStatus, error);
            });
    });

    /**
     * User delete event,
     *
     * @param   {jQuery.Event}          event   Event object
     * @param   {Number}                userId  User id
     * @param   {sails.helper.trigger}  trigger Trigger to process after action,
     */
    body.on("userDelete", function(event, userId, trigger) {
        bootbox.confirm({
            title: "danger - danger - danger",
            message: "Are you sure of user delete?",
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
                    // Remove user via socket
                    socket.delete("/User/" + userId, function(/** sails.json.user */user) {
                        if (handleSocketError(user)) {
                            makeMessage("User deleted successfully.");

                            handleEventTrigger(trigger);
                        }
                    });
                } else {
                    handleEventTrigger(trigger);
                }
            }
        });
    });
});

function initUserList(context, parameters) {
    var body = jQuery("body");

    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery("#" + parameters.activeTab + "Tab").click();
    }

    // User clicks action menu link
    body.on("click", "ul.actionMenu-actions a", function() {
        var element = jQuery(this);
        var userId = element.data("userId");
        var action = element.data("action");
        var selector = element.data("selector");

        // We have popover selector, so hide it
        if (selector) {
            jQuery(selector).popover("hide");
        }

        // Hide current modal
        context.modal("hide");

        // Specify trigger to fire after story action
        var trigger = {
            trigger: "userList",
            parameters: []
        };

        // Trigger story action event
        body.trigger(action, [userId, trigger]);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-add-new-user='true']");

    // User wants to add new story to current sprint
    body.on("click", "[data-add-new-user='true']", function() {
        var element = jQuery(this);

        // Hide current modal
        context.modal("hide");

        // Specify trigger to fire after story action
        var trigger = {
            trigger: "userList",
            parameters: []
        };

        // Trigger story add
        body.trigger("userAdd", [trigger, {}]);
    });
}

function initUserForm(modal) {
}
