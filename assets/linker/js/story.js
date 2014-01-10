/**
 * /assets/linker/js/story.js
 *
 * This file contains all story specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form handlers
 */
"use strict";

/**
 * Story specified global event handlers. These events are following:
 *  - storyAdd
 *  - storyEdit
 *  - storySplit
 *  - storyDelete
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * User story add event, this opens a modal bootbox dialog with user story add form on it.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                [projectId] Project id
     * @param   {Number}                [sprintId]  Sprint id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     * @param   {{}}                    [formData]  Possible form data, simple key/value
     */
    body.on("storyAdd", function(event, projectId, sprintId, trigger, formData) {
        projectId = projectId || myViewModel.project().id();
        trigger = trigger || false;
        formData = formData || {};

        if (typeof sprintId === "undefined") {
            if (myViewModel.sprint().id()) {
                sprintId = myViewModel.sprint().id();
            }
        }

        jQuery.get("/Story/add", {projectId: projectId, sprintId: sprintId, formData: formData})
        .done(function(content) {
            var title = "Add new user story";
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
                initStoryForm(modal);
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
            var form = jQuery("#formStoryNew", modal);
            var formItems = form.serializeJSON();

            // Validate form and try to create new user story
            if (validateForm(formItems, modal)) {
                // Create new user story
                socket.post("/Story", formItems, function(/** sails.json.story */data) {
                    if (handleSocketError(data)) {
                        makeMessage("User story created successfully.");

                        modal.modal("hide");

                        // User wants to close modal so just handle trigger
                        if (close) {
                            handleEventTrigger(trigger);
                        } else { // Otherwise trigger edit with same trigger
                            body.trigger("storyEdit", [data.id, trigger]);
                        }
                    }
                });
            }
        }
    });

    /**
     * User story edit event, this opens a modal bootbox dialog with user story edit form on it.
     *
     * @param   {jQuery.Event}          event           Event object
     * @param   {Number}                storyId         Story id
     * @param   {sails.helper.trigger}  [trigger]       Trigger to process after actions
     * @param   {{}}                    [parameters]    Init parameters, this is passed to form init function
     */
    body.on("storyEdit", function(event, storyId, trigger, parameters) {
        trigger = trigger || false;
        parameters = parameters || {};

        jQuery.get("/Story/edit", {id: storyId})
        .done(function(content) {
            var title = "Edit user story";
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
                    label: "Split story",
                    className: "btn-warning pull-right",
                    id: "split",
                    callback: function() {
                        // Trigger story split event
                        body.trigger("storySplit", [storyId, {trigger: "storyEdit", parameters: [storyId, trigger]}]);
                    }
                },
                {
                    label: "Delete",
                    className: "btn-danger pull-right",
                    callback: function() {
                        // Trigger story delete event
                        body.trigger("storyDelete", [storyId, {trigger: "storyEdit", parameters: [storyId, trigger]}]);
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initStoryForm(modal, parameters);
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
            var formBasic = jQuery("#formStoryEdit_1", modal);
            var formAdvanced = jQuery("#formStoryEdit_2", modal);
            var formItems = jQuery.extend({}, formBasic.serializeJSON(), formAdvanced.serializeJSON());

            // Validate current form items and try to update user story data
            if (validateForm(formItems, modal)) {
                // Update user story
                socket.put("/Story/" + storyId, formItems, function(/** sails.json.story */story) {
                    if (handleSocketError(story)) {
                        makeMessage("User story updated successfully.");

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
     * User story split event, this opens a modal bootbox prompt with sprint selection.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                storyId     Story id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("storySplit", function(event, storyId, trigger) {
        trigger = trigger || false;

        var options = [];

        // Add project backlog option
        options.push({value: 0, text: "Project backlog"});

        // Iterate project sprints and add those to option lists
        jQuery.each(myViewModel.sprints(), function(key, sprint) {
            options.push({value: sprint.id(), text: sprint.formattedTitle()});
        });

        // Make prompt box
        var prompt = bootbox.prompt({
            title: "Select sprint where to add new story",
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-default pull-left"
                },
                confirm: {
                    label: "Split story",
                    className: "btn-primary pull-right"
                }
            },
            inputType: "select",
            inputOptions: options,
            show: false,
            callback: function(result) {
                if (result !== null) {
                    jQuery.ajax({
                        type: "POST",
                        url: "/Story/split",
                        data: {
                            storyId: storyId,
                            sprintId: result,
                            projectId: myViewModel.project().id(),
                            _csrf: getCsrfToken()
                        },
                        dataType: "json"
                    })
                    .done(function() {
                        makeMessage("User story splitted successfully.");

                        prompt.modal("hide");

                        handleEventTrigger(trigger);
                    })
                    .fail(function(jqXhr, textStatus, error) {
                        handleAjaxError(jqXhr, textStatus, error);
                    });
                } else {
                    prompt.modal("hide");

                    handleEventTrigger(trigger);
                }

                return false;
            }
        });

        // Initialize prompt select
        prompt.on("shown.bs.modal", function() {
            initSelectPrompt(prompt);
        });

        // Open bootbox prompt modal
        prompt.modal("show");
    });

    /**
     * User story delete event, this opens a modal bootbox confirm about story delete.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                storyId     Story id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("storyDelete", function(event, storyId, trigger) {
        trigger = trigger || false;

        // Make confirm box
        bootbox.confirm({
            title: "danger - danger - danger",
            message: "Are you sure of story delete?",
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
                    // Delete story data
                    socket.delete("/Story/" + storyId, {_csrf: getCsrfToken()}, function(/** sails.json.story */story) {
                        if (handleSocketError(story)) {
                            makeMessage("User story deleted successfully.");

                            handleEventTrigger(trigger, "storyEdit");
                        }
                    });
                } else {
                    handleEventTrigger(trigger);
                }
            }
        });
    });

    /**
     * Story tasks event. This will open story edit modal dialog and activates tasks tab to
     * be opened. Note that this just fires storyEdit event with specified parameters.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                storyId     Story id
     * @param   {sails.helper.trigger}  trigger     Trigger to process after actions
     */
    body.on("storyTasks", function(event, storyId, trigger) {
        // Used parameters for form init
        var parameters = {
            activeTab: "tasks"
        };

        body.trigger("storyEdit", [storyId, trigger, parameters]);
    });
});

/**
 * Function to initialize story form.
 *
 * @param   {jQuery|$}  modal           Current modal content
 * @param   {{}}        [parameters]    Parameters
 */
function initStoryForm(modal, parameters) {
    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery("#" + parameters.activeTab + "Tab", modal).click();
    }

    var inputTitle = jQuery("input[name='title']", modal);

    inputTitle.focus().val(inputTitle.val());

    var slider = jQuery(".estimateSlider", modal);
    var input = slider.next("input");
    var show = jQuery(".sliderValue", modal);
    var currentValue = 0;

    // Specify fibonacci values for story sizes
    var values = [ -1, 0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100 ];

    jQuery.each(values, function(key, value) {
        if (value == input.val()) {
            currentValue = key;
        }
    });

    show.val(currentValue == 0 ? "???" : values[currentValue]);

    // Note that this slider only accepts fibonacci values
    slider.slider({
        min: 0,
        max: values.length - 1,
        value: currentValue,
        step: 1,
        slide: function(event, ui) {
            input.val(values[ui.value]);

            if (ui.value === 0) {
                show.val("???");
            } else {
                show.val(values[ui.value]);
            }
        }
    });
}

/**
 * Function initializes story tasks tab to use in task edit modal. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initStoryTabTasks(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-add-new-task='true']");

    // User wants to add new user to project
    body.on("click", "[data-add-new-task='true']", function() {
        var element = jQuery(this);
        var storyId = element.data("storyId");

        // Hide current modal
        modal.modal("hide");

        // Specify used trigger to come back to this view
        var trigger = {
            trigger: "storyEdit",
            parameters: [storyId, null, {activeTab: "tasks"}]
        };

        // Find specified story object
        var story = _.find(myViewModel.stories(), function(story) { return story.id() === storyId; });

        body.trigger("taskAdd", [story, trigger]);
    });

    // User clicks action menu link
    body.on("click", "ul.actionMenu-actions a", function() {
        var element = jQuery(this);
        var storyId = element.data("storyId");
        var taskId = element.data("taskId");
        var action = element.data("action");
        var selector = element.data("selector");

        // We have popover selector, so hide it
        if (selector) {
            jQuery(selector).popover("hide");
        }

        // Hide current modal
        modal.modal("hide");

        // Specify used trigger to come back to this view
        var trigger = {
            trigger: "storyEdit",
            parameters: [storyId, null, {activeTab: "tasks"}]
        };

        // Trigger milestone action event
        body.trigger(action, [taskId, trigger]);
    });

    if (myViewModel.role() < 0) {
        // User changes task priority order
        jQuery("#storyTasks tbody", container).sortable({
            axis: "y",
            helper: function(e, tr) {
                var helper = tr.clone();

                return helper.addClass("sortable");
            },
            stop: function() {
                var table = jQuery("#storyTasks", container);
                var rows = table.find("tbody tr.taskRow");
                var taskIds = [];

                rows.fadeTo(0, 0.5);

                // Get used task id and priority values
                rows.each(function(index) {
                    var taskId = jQuery(this).data("taskId");

                    if (taskId) {
                        taskIds.push({taskId: taskId, priority: index + 1, row: jQuery(this)});
                    }
                });

                // Make necessary updates
                async.map(
                    taskIds,
                    function (item, callback) {
                        // This is weird, why this is faster than socket.put() call? possible bug in sails.js?
                        jQuery
                            .ajax({
                                url: "/Task/" + item.taskId,
                                data: {
                                    priority: item.priority,
                                    _csrf: getCsrfToken()
                                },
                                type: "PUT",
                                dataType: "json"
                            })
                            .done(function() {
                                item.row.find("td.task-priority").html(item.priority);

                                callback(null, item.taskId);
                            })
                            .fail(function(jqXhr, textStatus, error) {
                                var errorMessage = {
                                    jqXhr: jqXhr,
                                    textStatus: textStatus,
                                    error: error
                                };

                                callback(errorMessage, null);
                            });
                    },
                    function(error, results) {
                        if (error) {
                            handleAjaxError(error.jqXhr, error.textStatus, error.error);
                        }

                        var message = "";
                        var type = "success";

                        if (error) {
                            type = "error";
                            message = "Error in task priority update";
                        } else {
                            message = "Tasks priorities changed successfully";
                        }

                        makeMessage(message, type);

                        rows.fadeTo(0, 1);
                    }
                );
            }
        });
    }
}
