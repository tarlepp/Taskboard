/**
 * /assets/linker/js/story.js
 *
 * This file contains all story specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form handlers
 */

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
        sprintId = sprintId || myViewModel.sprint().id();
        trigger = trigger || false;
        formData = formData || {};

        jQuery.get("/Story/add", {projectId: projectId, sprintId: sprintId, formData: formData})
        .done(function(content) {
            var title = "Add new user story";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery("#formStoryNew", modal);
                        var formItems = form.serializeJSON();

                        // Validate form and try to create new user story
                        if (validateForm(formItems, modal)) {
                            // Create new user story
                            socket.post("/Story", formItems, function(/** sails.json.story */story) {
                                if (handleSocketError(story)) {
                                    makeMessage("User story created successfully.");

                                    modal.modal("hide");

                                    handleEventTrigger(trigger);

                                    // Update client bindings
                                    myViewModel.processSocketMessage("story", "create", story.id, story);
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
                initStoryForm(modal);
            });

            // Open bootbox modal
            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * User story edit event, this opens a modal bootbox dialog with user story edit form on it.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                storyId     Story id
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     */
    body.on("storyEdit", function(event, storyId, trigger) {
        trigger = trigger || false;

        jQuery.get("/Story/edit", {id: storyId})
        .done(function(content) {
            var title = "Edit user story";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery("#formStoryEdit", modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to update user story data
                        if (validateForm(formItems, modal)) {
                            // Update user story
                            socket.put("/Story/" + storyId, formItems, function(/** sails.json.story */story) {
                                if (handleSocketError(story)) {
                                    makeMessage("User story updated successfully.");

                                    modal.modal("hide");

                                    handleEventTrigger(trigger);

                                    // Update client bindings
                                    myViewModel.processSocketMessage("story", "update", story.id, story);
                                }
                            });
                        }

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
                initStoryForm(modal);
            });

            // Open bootbox modal
            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
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
                            projectId: myViewModel.project().id()
                        },
                        dataType: "json"
                    })
                    .done(function(/** sails.json.storySplit */ data) {
                        makeMessage("User story splitted successfully.");

                        prompt.modal("hide");

                        handleEventTrigger(trigger);

                        // Try to find original story from current scope
                        var story = _.find(myViewModel.stories(), function(story) {
                            return story.id() === data.storyOld.id;
                        });

                        // Client binding updates

                        // Original story in current scope, so update it
                        if (typeof story !== "undefined") {
                            myViewModel.processSocketMessage("story", "update", data.storyOld.id, data.storyOld);
                        }

                        // If new story sprint is same as current add it to current scope
                        if (data.storyNew.sprintId === myViewModel.sprint().id()) {
                            myViewModel.processSocketMessage("story", "create", data.storyNew.id, data.storyNew);
                        }
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
                    socket.delete("/Story/" + storyId, function(/** sails.json.story */story) {
                        if (handleSocketError(story)) {
                            makeMessage("User story deleted successfully.");

                            handleEventTrigger(trigger);

                            // Update client bindings
                            myViewModel.processSocketMessage("story", "destroy", story.id, story)
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
 * Function to initialize story form.
 *
 * @param   {jQuery|$}  modal   Current modal content
 */
function initStoryForm(modal) {
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