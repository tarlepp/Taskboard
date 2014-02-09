"use strict";

/**
 * /assets/linker/js/externallink.js
 *
 * This file contains all project external link specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form / list handlers
 */

/**
 * Project external link specified global event handlers. These events are following:
 *  - projectExternalLinks
 *  - projectExternalLinksAdd
 *  - projectExternalLinksEdit
 *  - projectExternalLinksDelete
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * Project external link list event. This will open a modal dialog that contains all
     * external links that are attached to this project. Within this modal user can add,
     * edit and delete external links.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("projectExternalLinks", function(event, projectId, trigger) {
        trigger = trigger || false;

        // Fetch list modal content
        jQuery.get("/ExternalLink/list", {projectId: projectId})
            .done(function(content) {
                var title = "Project external link configuration";
                var buttons = [
                    {
                        label: "Add new link",
                        className: "btn-primary pull-right",
                        callback: function () {
                            modal.modal("hide");

                            body.trigger("projectExternalLinksAdd", [projectId, {trigger: "projectExternalLinks", parameters: [projectId]}]);

                            return false;
                        }
                    }
                ];

                // Create bootbox modal
                var modal = createBootboxDialog(title, content, buttons, trigger);

                // Make list init when dialog is opened.
                modal.on("shown.bs.modal", function() {
                    initProjectExternalLinksList(modal);
                });

                // Open bootbox modal
                modal.modal("show");
            })
            .fail(function(jqXhr, textStatus, error) {
                handleAjaxError(jqXhr, textStatus, error);
            });
    });

    /**
     * Project external link add event. This will open modal that contains form that
     * user can use to add new external link to current project.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("projectExternalLinksAdd", function(event, projectId, trigger) {
        trigger = trigger || false;

        // Fetch add modal content
        jQuery.get("/ExternalLink/add", {projectId: projectId})
            .done(function(content) {
                var title = "Add external link";
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
                    }
                ];

                // Create bootbox modal
                var modal = createBootboxDialog(title, content, buttons, trigger);

                // Make form init when dialog is opened.
                modal.on("shown.bs.modal", function() {
                    initProjectExternalLinksForm(modal);
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
            var form = jQuery("#formExternalLinkNew", modal);
            var formItems = form.serializeJSON();

            // Validate form and try to create new sprint
            if (validateForm(formItems, modal)) {
                // Create new sprint
                socket.post("/ExternalLink", formItems, function(/** sails.json.externalLink */data) {
                    if (handleSocketError(data)) {
                        makeMessage("New external link added to project successfully.", "success", {});

                        modal.modal("hide");

                        // User wants to close modal so pass just trigger
                        if (close) {
                            handleEventTrigger(trigger);
                        } else { // Otherwise trigger edit with same trigger
                            body.trigger("projectExternalLinksEdit", [data.id, trigger]);
                        }

                        // Update object links in view model
                        myViewModel.updateObjectLinks();
                    }
                });
            }
        }
    });

    /**
     * Project external link edit event. This will open modal that contains form with
     * specified external link data on it.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                linkId      Link id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("projectExternalLinksEdit", function(event, linkId, trigger) {
        trigger = trigger || false;

        // Fetch edit modal content
        jQuery.get("/ExternalLink/edit", {linkId: linkId})
            .done(function(content) {
                var title = "Edit external link";
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
                            // Trigger external link delete event
                            body.trigger("projectExternalLinksDelete", [linkId, {trigger: "projectExternalLinksEdit", parameters: [linkId, trigger]}]);
                        }
                    }
                ];

                // Create bootbox modal
                var modal = createBootboxDialog(title, content, buttons, trigger);

                // Make form init when dialog is opened.
                modal.on("shown.bs.modal", function() {
                    initProjectExternalLinksForm(modal);
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
            var form = jQuery("#formExternalLinkEdit", modal);
            var formItems = form.serializeJSON();

            // Validate form and try to create new sprint
            if (validateForm(formItems, modal)) {
                // Create new sprint
                socket.put("/ExternalLink/" + linkId, formItems, function(/** sails.json.externalLink */data) {
                    if (handleSocketError(data)) {
                        makeMessage("External link saved to project successfully.", "success", {});

                        modal.modal("hide");

                        // User wants to close modal so pass just trigger
                        if (close) {
                            handleEventTrigger(trigger);
                        } else { // Otherwise trigger edit with same trigger
                            body.trigger("projectExternalLinksEdit", [data.id, trigger]);
                        }

                        // Update object links in view model
                        myViewModel.updateObjectLinks();
                    }
                });
            }
        }
    });

    /**
     * Project external link delete event.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                linkId      Link id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("projectExternalLinksDelete", function(event, linkId, trigger) {
        trigger = trigger || false;

        bootbox.confirm({
            title: "danger - danger - danger",
            message: "Are you sure of external link delete? Note that all related links are also removed!",
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
                    socket.delete("/ExternalLink/" + linkId, {_csrf: getCsrfToken()}, function(/** sails.json.link */link) {
                        if (handleSocketError(link)) {
                            makeMessage("External link deleted successfully.");

                            handleEventTrigger(trigger, "projectExternalLinksEdit");
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
 * Function to initialize external link list view.
 *
 * @param   {jQuery|$}  context         Current modal content
 * @param   {{}}        [parameters]    Used extra parameters
 */
function initProjectExternalLinksList(context, parameters) {
    var body = jQuery("body");

    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery("#" + parameters.activeTab + "Tab").click();
    }

    // User clicks action menu link
    body.on("click", "ul.actionMenu-actions a", function() {
        var element = jQuery(this);
        var linkId = element.data("linkId");
        var projectId = element.data("projectId");
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
            trigger: "projectExternalLinks",
            parameters: [projectId]
        };

        // Trigger story action event
        body.trigger(action, [linkId, trigger]);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-add-new-link='true']");

    // User wants to add new story to current sprint
    body.on("click", "[data-add-new-link='true']", function() {
        var element = jQuery(this);
        var projectId = element.data("projectId");

        // Hide current modal
        context.modal("hide");

        // Specify trigger to fire after story action
        var trigger = {
            trigger: "projectExternalLinks",
            parameters: [projectId]
        };

        // Trigger story add
        body.trigger("projectExternalLinksAdd", [projectId, trigger]);
    });
}

/**
 * Function to initialize external link add / edit view
 *
 * @param   {jQuery|$}  context         Current modal content
 */
function initProjectExternalLinksForm(context) {
    var body = jQuery("body");
    var elementLink = context.find("input[name='link']");
    var elementInfo = context.find("#decodedUrl");

    // Add type watch listener to URL input element
    elementLink.typeWatch({
        wait: 150,
        captureLength: 0,
        callback: parseLinkParameters
    });

    // First try to parse existing URL parameters
    parseLinkParameters(elementLink.val());

    /**
     * Private helper function to parse actual parameters from given URL to
     * show in help box in form.
     *
     * @param   {String}    link
     */
    function parseLinkParameters(link) {
        var regExp = /:\w+/g;
        var parameters = link.match(regExp);
        var info = "";

        if (parameters) {
            parameters = _.map(parameters, function(parameter) {
                return parameter.substring(1);
            });

            info = "<blockquote style='margin-bottom: 0;'>" + parameters.join("<br />") + "</blockquote>";
        } else if (link.length === 0) {
            info = elementInfo.data("text-original");
        } else {
            info = elementInfo.data("text-no-parameters");
        }

        elementInfo.html(info);
    }
}