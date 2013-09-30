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
});

function initUserList(modal) {
}

function initUserForm(modal) {
}
