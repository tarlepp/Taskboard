"use strict";

jQuery(document).ready(function() {
    var body = jQuery("body");

    body.on("projectExternalLinks", function(event, projectId, trigger) {
        trigger = trigger || false;

        jQuery.get("/ExternalLink/list", {projectId: projectId})
            .done(function(content) {
                var title = "Project external link configuration";
                var buttons = [
                    {
                        label: "Add new link",
                        className: "btn-primary pull-right",
                        callback: function () {
                            modal.modal("hide");

                            body.trigger("projectExternalLinksAdd", projectId, [{trigger: "projectExternalLinks", parameters: [projectId]}]);

                            return false;
                        }
                    }
                ];

                // Create bootbox modal
                var modal = createBootboxDialog(title, content, buttons, trigger);

                // Make form init when dialog is opened.
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

    body.on("projectExternalLinksAdd", function(event, projectId, trigger) {
        trigger = trigger || false;

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
                        makeMessage("New sprint added to project successfully.", "success", {});

                        modal.modal("hide");

                        // User wants to close modal so pass just trigger
                        if (close) {
                            handleEventTrigger(trigger);
                        } else { // Otherwise trigger edit with same trigger
                            body.trigger("projectExternalLinksEdit", [data.id, trigger]);
                        }
                    }
                });
            }
        }
    });

    body.on("projectExternalLinksEdit", function(event, linkId, trigger) {
        console.log("external link edit");
    });
});

function initProjectExternalLinksList(modal) {
}

function initProjectExternalLinksForm(modal) {
    var body = jQuery("body");
    var elementLink = modal.find("input[name='link']");
    var elementInfo = modal.find("#decodedUrl");

    elementLink.typeWatch({
        wait: 150,
        captureLength: 0,
        callback: function(value) {
            var regExp = /:\w+/g;
            var parameters = value.match(regExp);
            var info = "";

            if (parameters) {
                parameters = _.map(parameters, function(parameter) {
                    return parameter.substring(1);
                });

                info = "<blockquote style='margin-bottom: 0;'>" + parameters.join("<br />") + "</blockquote>";
            } else if (value.length === 0) {
                info = elementInfo.data("text-original");
            } else {
                info = elementInfo.data("text-no-parameters");
            }

            elementInfo.html(info);
        }
    });
}