/**
 * /assets/linker/js/phase.js
 *
 * This file contains all phase specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form handlers
 */

/**
 * Phase specified global event handlers. These events are following:
 *  - phasesEdit
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * Project phases edit event. This opens a modal dialog which contains all current project
     * phases. User can edit existing phases, add new ones and change phases order simply by
     * dragging them. All the phases are saved in "same" time.
     *
     * todo do we really need project id parameter?
     * todo optimize save event
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                [projectId] Project id, if not given fallback to current project
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("phasesEdit", function(event, projectId, trigger) {
        projectId = projectId || myViewModel.project().id();
        trigger = trigger || false;

        jQuery.get("/Phase/edit", {id: projectId})
        .done(function(content) {
            var title = "Project phases on board";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var errors = false;
                        var lines = jQuery("#projectPhases", modal).find("tbody tr");
                        var phases = [];
                        var isChecked = false;
                        var inputsIsDone = jQuery("#projectPhases", modal).find("input[type=radio]");

                        inputsIsDone.each(function() {
                            if (jQuery(this).is(":checked")) {
                                isChecked = true;
                            }
                        });

                        if (inputsIsDone.length > 0 && isChecked === false) {
                            inputsIsDone.last().attr("checked", "checked");
                        }

                        // Iterate each lines
                        lines.each(function(key) {
                            var row = jQuery(this);
                            var title = jQuery.trim(row.find("input[name='title[]']").val());
                            var backgroundColor = jQuery.trim(row.find("input[name='backgroundColor[]']").val());
                            var isDone = row.find("input[name='isDone[]']").is(":checked") ? 1 : 0;
                            var tasks = parseInt(row.find("input[name='tasks[]']").val(), 10);
                            var phaseId = parseInt(row.find("input[name='id[]']").val(), 10);

                            if (title.length == 0) {
                                makeMessage("Phase name cannot be empty.", "error", {});

                                row.addClass("has-error");

                                errors = true;
                            } else {
                                row.removeClass("has-error");

                                phases.push({
                                    id: phaseId,
                                    title: title,
                                    backgroundColor: "#" + backgroundColor,
                                    order: key,
                                    tasks: isNaN(tasks) ? 0 : tasks,
                                    isDone: isDone,
                                    projectId: projectId
                                });
                            }
                        });

                        /**
                         * Function to update or insert phase to database. This is used with
                         * async.map() method.
                         *
                         * @param   {sails.model.phase} item        Single phase item
                         * @param   {Function}          callback    Callback function to call after job
                         */
                        var phaseUpdate = function(item, callback) {
                            var phaseId = item.id;

                            delete item.id;

                            // Add CSRF token to data
                            item._csrf = getCsrfToken();

                            // Insert new phase
                            if (isNaN(phaseId)) {
                                socket.post("/Phase/", item, function(data) {
                                    if (handleSocketError(data, true)) {
                                        callback(null, data);
                                    } else {
                                        callback(data, null);
                                    }
                                });
                            } else { // Update phase data
                                socket.put("/Phase/" + phaseId, item, function(data) {
                                    if (handleSocketError(data, true)) {
                                        callback(null, data);
                                    } else {
                                        callback(data, null);
                                    }
                                });
                            }
                        };

                        /**
                         * Used callback function on phase insert / update async.map() function.
                         *
                         * @param   {Null|sails.error.socket}   error   Socket error or null
                         * @param   {Null|sails.model.phase[]}  results Phase data or null
                         */
                        var phaseCallback = function(error, results) {
                            if (!error) {
                                makeMessage("Project phases saved successfully.");
                            }

                            modal.modal("hide");

                            body.trigger("phasesEdit", [projectId, trigger]);
                        };

                        // We have no errors, so try to insert / update phase data
                        if (!errors) {
                            async.map(phases, phaseUpdate, phaseCallback);
                        }

                        return false;
                    }
                },
                {
                    label: "Add new phase",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var newRow = jQuery("#projectPhasesNew", modal).find("tr").clone();
                        var slider = newRow.find(".slider");
                        var cellValue = slider.parent().next("td");

                        cellValue.html("unlimited");

                        slider
                            .slider({
                                tooltip: "hide"
                            })
                            .on("slide", function(sliderEvent) {
                                cellValue.text(sliderEvent.value != 0 ? sliderEvent.value : "unlimited");
                            })
                        ;

                        jQuery(".colorPicker", newRow).each(function() {
                            var input = jQuery(this);
                            var colorContainer = input.parent().find("span.color");
                            var color = input.val();

                            colorContainer.css("background-color", color);

                            input.val(color.substr(1));

                            input.colpick({
                                layout: "hex",
                                colorScheme: "light",
                                onChange: function(hsb, hex, rgb, element, bySetColor) {
                                    colorContainer.css("background-color", "#" + hex);

                                    // Fill the text box just if the color was set using the picker, and not the colpickSetColor function.
                                    if (!bySetColor) {
                                        jQuery(element).val(hex);
                                    }
                                }
                            }).keyup(function(){
                                jQuery(this).colpickSetColor(this.value);
                            });

                            input.colpickSetColor(input.val());
                        });

                        jQuery("#projectPhases", modal).find("tbody").append(newRow);

                        var isChecked = false;
                        var inputsIsDone = jQuery("#projectPhases", modal).find("input[type=radio]");

                        inputsIsDone.each(function() {
                            if (jQuery(this).is(":checked")) {
                                isChecked = true;
                            }
                        });

                        if (inputsIsDone.length > 0 && isChecked === false) {
                            inputsIsDone.last().attr("checked", "checked");
                        }

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initProjectPhases(modal);
            });

            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });
});

/**
 * Function initializes project phases admin modal content.
 *
 * @param   {jQuery|$}  modal   Current modal content
 */
function initProjectPhases(modal) {
    // Initialize colorpicker
    jQuery(".colorPicker", modal).each(function() {
        var input = jQuery(this);
        var colorContainer = input.parent().find("span.color");
        var color = input.val();

        colorContainer.css("background-color", color);

        input.val(color.substr(1));

        input.colpick({
            layout: "hex",
            colorScheme: "light",
            onChange: function(hsb, hex, rgb, element, bySetColor) {
                colorContainer.css("background-color", "#" + hex);

                // Fill the text box just if the color was set using the picker, and not the colpickSetColor function.
                if (!bySetColor) {
                    jQuery(element).val(hex);
                }
            },
            onSubmit: function() {
                input.colpickHide();
            }
        }).keyup(function(){
            jQuery(this).colpickSetColor(this.value);
        });

        input.colpickSetColor(input.val());
    });

    // Initialize jQuery UI sliders for phase task count
    jQuery.each(jQuery("#projectPhases", modal).find(".slider"), function() {
        var slider = jQuery(this);
        var cellValue = slider.parent().next("td");

        slider
            .slider({
                tooltip: "hide"
            })
            .on("slide", function(sliderEvent) {
                cellValue.text(sliderEvent.value != 0 ? sliderEvent.value : "unlimited");
            })
        ;
    });

    // Fix for jQuery UI sortable helper
    var fixHelper = function(e, ui) {
        ui.children().each(function() {
            jQuery(this).width(jQuery(this).width());
        });

        return ui;
    };

    var sortable = jQuery("#projectPhases").find("tbody");

    // Make phases to be sortable
    sortable.sortable({
        helper: fixHelper,
        handle: 'td:first',
        axis: 'y',
        cursor: 'move',
        stop: function() {
            // Update order data
            jQuery.each(sortable.find('tr'), function(key) {
                var row = jQuery(this);
                var phaseId = row.data('phaseId');

                row.find('input[name="order['+ phaseId +']"]').val(key);
            });
        }
    })
    .disableSelection();

    // Phase delete
    modal.on("click", ".phaseDelete", function() {
        var row = jQuery(this).closest('tr');
        var phaseId = parseInt(row.data('phaseId'), 10);

        // Not a "real" phase (row is not yet saved), so just remove whole row
        if (isNaN(phaseId)) {
            row.remove();
        } else { // Otherwise we have a real phase
            // Fetch tasks that are attached to this phase
            socket.get("/Task", {phaseId: phaseId}, function(/** sails.json.task */tasks) {
                if (handleSocketError(tasks, true)) {
                    // Phase doesn't contain any tasks, so it can be deleted
                    if (_.size(tasks) === 0) {
                        modal.modal("hide");

                        var body = jQuery("body");

                        // Show confirm modal to user
                        bootbox.confirm({
                            title: "danger - danger - danger",
                            message: "Are you sure of phase delete?",
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
                                    socket.delete("/Phase/" + phaseId, {_csrf: getCsrfToken()}, function(/** sails.json.phase */data) {
                                        if (handleSocketError(data)) {
                                            makeMessage("Phase deleted successfully.", "success", {});

                                            body.trigger('phasesEdit');
                                        }
                                    });
                                } else {
                                    body.trigger('phasesEdit');
                                }
                            }
                        });
                    } else {
                        makeMessage("Cannot delete phase, because it contains tasks.", "error", {});
                    }
                }
            });
        }
    });
}