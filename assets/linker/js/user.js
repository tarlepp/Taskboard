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
 *  - userDelete
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * Current user wants to modify his/hers information in application.
     */
    body.on("click", "#navigation-static li.navbar-user a", function(event) {
        event.preventDefault();

        body.trigger("userEdit", [jQuery(this).data("userId")]);
    });

    /**
     * User list event, this opens a modal with list of current users.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
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

    /**
     * User add event, this opens a modal with user add form on it.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     * @param   {{}}                    [formData]  Possible form data, simple key/value
     */
    body.on('userAdd', function(event, trigger, formData) {
        trigger = trigger || false;
        formData = formData || {};

        jQuery.get("/User/add", {formData: formData})
            .done(function(content) {
                var title = "Add new user";
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
                    initUserForm(modal);
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
            var form = jQuery("#formUserNew", modal);
            var formItems = form.serializeJSON();

            // Validate current form items and try to update milestone data
            if (validateForm(formItems, modal)) {
                // Create new user
                socket.post("/User", formItems, function(/** sails.json.user */data) {
                    if (handleSocketError(data)) {
                        makeMessage("User created successfully.");

                        modal.modal("hide");

                        // User wants to close modal so just handle trigger
                        if (close) {
                            handleEventTrigger(trigger);
                        } else { // Otherwise trigger edit with same trigger
                            body.trigger("userEdit", [data.id, trigger]);
                        }
                    }
                });
            }
        }
    });

    /**
     * User edit event, this opens a modal with user edit form on it.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                userId      User id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on('userEdit', function(event, userId, trigger) {
        trigger = trigger || false;

        jQuery.get("/User/edit?id=" + userId)
            .done(function(content) {
                var title = "Edit user";
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
                    },
                    {
                        label: "Delete",
                        className: "btn-danger pull-right",
                        callback: function() {
                            // Trigger user delete event
                            body.trigger("userDelete", [userId, {trigger: "userEdit", parameters: [userId, trigger]}]);
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

        /**
         * Method makes actual save function for current model and closes dialog + fire specified
         * trigger event OR opens edit modal with specified trigger event.
         *
         * @param   {jQuery|$}                  modal
         * @param   {sails.helper.trigger|bool} trigger
         * @param   {boolean}                   close
         */
        function save(modal, trigger, close) {
            var formBasic = jQuery("#formUserEdit_1", modal);
            var formRegion = jQuery("#formUserEdit_2", modal);
            var formItems = jQuery.extend({}, formBasic.serializeJSON(), formRegion.serializeJSON());

            // Validate current form items and try to update milestone data
            if (validateForm(formItems, modal)) {
                // Update user data
                socket.put("/User/"  + userId, formItems, function(/** sails.json.user */data) {
                    if (handleSocketError(data)) {
                        makeMessage("User updated successfully.");

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

                            handleEventTrigger(trigger, "userEdit");
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
 * Function to initialize user list view.
 *
 * @param   {jQuery|$}  context     Current modal content
 * @param   {{}}        parameters  Used extra parameters
 */
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

/**
 * Function to initialize user add / edit view.
 *
 * @param   {jQuery|$}  context     Current modal content
 * @param   {{}}        parameters  Used extra parameters
 */
function initUserForm(context, parameters) {
    var body = jQuery("body");

    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery("#" + parameters.activeTab + "Tab").click();
    }

    // On key up event in date format inputs update date and time values
    jQuery("[data-change-dates='true']").keyup(function() {
        populateDateTimeFormats();
    });

    // On change event in language / timezone update date and time values
    jQuery("select[data-change-dates='true']").change(function() {
        populateDateTimeFormats();
    });

    // Updated times
    timedUpdate();
}

function timedUpdate () {
    populateDateTimeFormats();

    setTimeout(timedUpdate, 1000);
}

function populateDateTimeFormats() {
    // Set language for moment
    moment.lang(jQuery("select[name='language']").val());

    // Create new UTC time
    var now = moment().utc();

    // Try to change timezone
    try {
        now.tz(jQuery("select[name='momentTimezone'] :selected").text());
    } catch (error) {
        console.log("no good");
        console.log(jQuery("select[name='momentTimezone'] :selected").text());

        try {
            now.tz(jQuery("select[name='momentTimezone'] :selected").val());
        } catch (error) {
            console.log("no good");
            console.log(jQuery("select[name='momentTimezone'] :selected").val());

            // Weird what to do...
            return;
        }
    }

    // Update actual time and date values
    jQuery("#momentFormatDateShow").html(now.format(jQuery("input[name=momentFormatDate]").val()));
    jQuery("#momentFormatTimeShow").html(now.format(jQuery("input[name=momentFormatTime]").val()));
    jQuery("#momentFormatDateTimeShow").html(now.format(jQuery("input[name=momentFormatDateTime]").val()));
}

/**
 * Function initializes sign in history tab to use in user edit modal. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initUserTabSignInHistory(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});
}

/**
 * Function initializes projects tab to use in user edit modal. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initUserTabProjects(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});
}
