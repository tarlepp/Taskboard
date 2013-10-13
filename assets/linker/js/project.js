/**
 * /assets/linker/js/project.js
 *
 * This file contains all Project specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form handlers
 */

/**
 * Project specified global event handlers. These events are following:
 *  - projectAdd
 *  - projectEdit
 *  - projectBacklog
 *  - projectMilestones
 *  - projectPlanning
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * Project add event, this opens a modal bootbox dialog with project add form on it.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {sails.helper.trigger}  trigger     Trigger to process after actions
     * @param   {{}}                    formData    Possible form data, simple key/value
     */
    body.on("projectAdd", function(event, trigger, formData) {
        trigger = trigger || false;
        formData = formData || {};

        jQuery.get("/Project/add", {formData: formData})
        .done(function(content) {
            var title = "Add new project";
            var buttons = {
                label: "Save",
                className: "btn-primary pull-right",
                callback: function() {
                    var form = jQuery("#formProjectNew", modal);
                    var formItems = form.serializeJSON();

                    // Validate form and try to create new project
                    if (validateForm(formItems, modal)) {
                        // Create new project
                        socket.post("/Project", formItems, function(/** sails.json.project */data) {
                            if (handleSocketError(data, true)) {
                                makeMessage("Project created successfully.", "success", {});

                                modal.modal("hide");

                                // Trigger specified event
                                handleEventTrigger(trigger);

                                // Update client bindings
                                myViewModel.processSocketMessage("project", "create", data.id, data);
                            }
                        });
                    }

                    return false;
                }
            };

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initProjectForm(modal, false, {});
            });

            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Project edit event, this opens a modal bootbox dialog with project edit form on it.
     *
     * todo do we really need project id parameter?
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id, if not given fallback to current project
     * @param   {sails.helper.trigger}  trigger     Trigger to process after actions
     * @param   {{}}                    parameters  Init parameters, this is passed to form init function
     */
    body.on("projectEdit", function(event, projectId, trigger, parameters) {
        projectId = projectId || myViewModel.project().id();
        trigger = trigger || false;
        parameters = parameters || {};

        jQuery.get("/Project/edit", {id: projectId})
        .done(function(content) {
            var title = "Edit project";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery("#formProjectEdit", modal);
                        var formItems = form.serializeJSON();

                        // Validate form and try to update project data
                        if (validateForm(formItems, modal)) {
                            // Update project data
                            socket.put("/Project/"  + projectId, formItems, function(/** sails.json.project */data) {
                                if (handleSocketError(data, true)) {
                                    makeMessage("Project updated successfully.", "success", {});

                                    modal.modal("hide");

                                    // Trigger specified event
                                    handleEventTrigger(trigger);

                                    // Update client bindings
                                    myViewModel.processSocketMessage("project", "update", data.id, data);
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
                        // todo implement this
                        console.log("TODO TODO TODO: Implement project delete");

                        // Trigger specified event
                        handleEventTrigger(trigger);

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initProjectForm(modal, true, parameters);
            });

            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Project milestones event. This will open project edit modal dialog and activates Backlog
     * tab to be opened. Note that this just fires projectEdit event with specified parameters.
     *
     * User can edit existing backlog stories and add new ones from this UI.
     *
     * todo do we really need project id parameter?
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id, if not given fallback to current project
     * @param   {sails.helper.trigger}  trigger     Trigger to process after actions
     */
    body.on("projectBacklog", function(event, projectId, trigger) {
        projectId = projectId || myViewModel.project().id();
        trigger = trigger || false;

        // Used parameters for form init
        var parameters = {
            activeTab: "backlog"
        };

        body.trigger("projectEdit", [projectId, trigger, parameters]);
    });

    /**
     * Project milestones event. This will open project edit modal dialog and activates Milestones
     * tab to be opened. Note that this just fires projectEdit event with specified parameters.
     *
     * User can edit existing milestones, add new ones, show stories attached to milestones and edit
     * user stories which are attached to milestone.
     *
     * Also progress bars are shown about current progress of project milestones.
     *
     * todo do we really need project id parameter?
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id, if not given fallback to current project
     * @param   {sails.helper.trigger}  trigger     Trigger to process after actions
     */
    body.on("projectMilestones", function(event, projectId, trigger) {
        projectId = projectId || myViewModel.project().id();
        trigger = trigger || false;

        // Used parameters for form init
        var parameters = {
            activeTab: "milestones"
        };

        body.trigger("projectEdit", [projectId, trigger, parameters]);
    });

    /**
     * Project users event. This will open project edit modal dialog and activates Users tab to
     * be opened. Note that this just fires projectEdit event with specified parameters.
     *
     * User can attach and de-attach users to / from project and change user roles if needed.
     *
     * todo do we really need project id parameter?
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id, if not given fallback to current project
     * @param   {sails.helper.trigger}  trigger     Trigger to process after actions
     */
    body.on("projectUsers", function(event, projectId, trigger) {
        projectId = projectId || myViewModel.project().id();
        trigger = trigger || false;

        // Used parameters for form init
        var parameters = {
            activeTab: "users"
        };

        body.trigger("projectEdit", [projectId, trigger, parameters]);
    });

    /**
     * Project planning event, this opens a modal bootbox dialog with project backlog view on it.
     * In this dialog user can prioritize user stories and assign them to existing sprints or move
     * them back to backlog.
     *
     * todo do we really need project id parameter?
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id, if not given fallback to current project
     * @param   {sails.helper.trigger}  trigger     Trigger to process after actions
     */
    body.on("projectPlanning", function(event, projectId, trigger) {
        projectId = projectId || myViewModel.project().id();
        trigger = trigger || false;

        jQuery.get("/Project/planning", {id: projectId})
        .done(function(content) {
            var title = "Project planning view";
            var buttons = [
                {
                    label: "Add new sprint",
                    className: "btn-primary pull-right",
                    callback: function() {
                        modal.modal("hide");

                        body.trigger("sprintAdd", ["projectPlanning"]);

                        return false;
                    }
                },
                {
                    label: "Add new story",
                    className: "btn-primary pull-right",
                    callback: function() {
                        modal.modal("hide");

                        body.trigger("storyAdd", [projectId, 0, "projectPlanning"]);

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Add required class for backlog
            modal.addClass("modalProjectPlanning");

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initProjectPlanning(modal);
            });

            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Project user attach event,
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id
     * @param   {Number}                userId      User id
     * @param   {sails.helper.trigger}  trigger     Trigger to process after action,
     */
    body.on("projectUserAttach", function(event, projectId, trigger) {
        var options = [];

        // Fetch available users
        jQuery.ajax({
            type: "GET",
            url: "/ProjectUser/availableUsers/",
            data: { projectId: projectId },
            dataType: "json"
        })
        .done(function(/** sails.json.user[] */users) {
            // Define groups to use
            var groups = [
                {type: -1, name: "Manager"},
                {type: 1, name: "User"},
                {type: 0, name: "Viewer"}
            ];

            // Iterate users
            _.each(users, function(user) {
                // Iterate groups
                for (var i = 0; i < groups.length; i++) {
                    var group = groups[i];

                    // Add new user option
                    options.push({
                        value: group.type + "|" + user.id,
                        text: user.lastName + " " + user.firstName,
                        group: group.name
                    });
                }
            });

            // Make actual prompt
            makePrompt();
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });

        /**
         * Function to make actual prompt with user select with roles. If there
         * are no available users prompt is not shown and warning is shown to
         * user.
         */
        function makePrompt() {
            if (options.length === 0) {
                makeMessage("There is no users to attach to this project", "error");

                handleEventTrigger(trigger);
            } else {
                // Make prompt box
                var prompt = bootbox.prompt({
                    title: "Select user who you want to attach to this project",
                    buttons: {
                        cancel: {
                            label: "Cancel",
                            className: "btn-default pull-left"
                        },
                        confirm: {
                            label: "Attach user",
                            className: "btn-primary pull-right"
                        }
                    },
                    inputType: "select",
                    inputOptions: options,
                    show: false,
                    callback: function(result) {
                        if (result !== null) {
                            var values = result.split("|");

                            var data = {
                                projectId: projectId,
                                userId: values[1],
                                role: values[0]
                            };

                            // Attach user to project
                            socket.post("/ProjectUser/", data, function(/** sails.json.projectUser */projectUser) {
                                if (handleSocketError(projectUser)) {
                                    makeMessage("User attached successfully to project");
                                }

                                prompt.modal("hide");

                                handleEventTrigger(trigger);
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
            }
        }
    });

    /**
     * Project user de-attach event,
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {Number}                projectId   Project id
     * @param   {Number}                userId      User id
     * @param   {sails.helper.trigger}  trigger     Trigger to process after action,
     */
    body.on("projectUserDeAttach", function(event, projectId, userId, trigger) {
        bootbox.confirm({
            title: "danger - danger - danger",
            message: "Are you sure of user de-attach from project?",
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
                    var data = {
                        projectId: projectId,
                        userId: userId
                    };

                    // Fetch project user object.
                    socket.get("/ProjectUser", data, function(/** sails.json.projectUser */projectUser) {
                        if (handleSocketError(projectUser)) {
                            // User founded
                            if (projectUser.length === 1 && projectUser[0].id) {
                                // De-attach user from this project
                                socket.delete("/ProjectUser/" + projectUser[0].id, function(/** sails.json.projectUser */projectUser) {
                                    if (handleSocketError(projectUser)) {
                                        makeMessage("User de-attached successfully from project");
                                    }

                                    handleEventTrigger(trigger);
                                });
                            } else {
                                makeMessage("Project user not found", "error");

                                handleEventTrigger(trigger);
                            }
                        } else {
                            handleEventTrigger(trigger);
                        }
                    });
                } else {
                    handleEventTrigger(trigger);
                }
            }
        });
    });

    body.on("projectUserRoleChange", function(event, projectId, userId, roleId, trigger) {
        var options = [
            {value: -1, text: "Manager"},
            {value: 1, text: "User"},
            {value: 0, text: "Viewer"}
        ];

        // Make prompt box
        var prompt = bootbox.prompt({
            title: "Select new role for user in this project",
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-default pull-left"
                },
                confirm: {
                    label: "Change role",
                    className: "btn-primary pull-right"
                }
            },
            inputType: "select",
            inputOptions: options,
            show: false,
            callback: function(result) {
                prompt.modal("hide");

                if (result !== null) {
                    var data = {
                        projectId: projectId,
                        userId: userId
                    };

                    // Fetch project user object.
                    socket.get("/ProjectUser", data, function(/** sails.json.projectUser */projectUser) {
                        if (handleSocketError(projectUser)) {
                            // User founded
                            if (projectUser.length === 1 && projectUser[0].id) {
                                // Change user role
                                socket.put("/ProjectUser/" + projectUser[0].id, {role: result}, function(/** sails.json.projectUser */projectUser) {
                                    if (handleSocketError(projectUser)) {
                                        makeMessage("User role changed successfully");
                                    }

                                    handleEventTrigger(trigger);
                                });
                            } else {
                                makeMessage("Project user not found", "error");

                                handleEventTrigger(trigger);
                            }
                        } else {
                            handleEventTrigger(trigger);
                        }
                    });
                } else {
                    handleEventTrigger(trigger);
                }

                return false;
            }
        });

        // Initialize prompt select
        prompt.on("shown.bs.modal", function() {
            prompt.find("select").val(roleId);

            initSelectPrompt(prompt);
        });

        // Open bootbox prompt modal
        prompt.modal("show");
    });
});

/**
 * Function to initialize project form.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {bool}      edit        Are we editing or not
 * @param   {{}}        parameters  Parameters
 */
function initProjectForm(modal, edit, parameters) {
    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery("#" + parameters.activeTab + "Tab", modal).click();
    }

    var inputTitle = jQuery("input[name='title']", modal);

    inputTitle.focus().val(inputTitle.val());

    var containerStart = jQuery(".dateStart", modal);
    var containerEnd = jQuery(".dateEnd", modal);
    var inputStart = containerStart.find("input");
    var inputEnd = containerEnd.find("input");
    var bitsStart = inputStart.val().split("-");
    var bitsEnd = inputEnd.val().split("-");
    var valueStart = null;
    var valueEnd = null;
    var dateMin = null;
    var dateMax = null;

    if (bitsStart.length === 3) {
        valueStart = new Date(bitsStart[0], bitsStart[1] - 1, bitsStart[2], 3, 0, 0);
    }

    if (bitsEnd.length === 3) {
        valueEnd = new Date(bitsEnd[0], bitsEnd[1] - 1, bitsEnd[2], 3, 0, 0);
    }

    /**
     * We are editing project so we must check that project dates don't overlap
     * with existing sprints.
     */
    if (edit) {
        var sprintFirst = _.min(myViewModel.sprints(), function(sprint) { return sprint.dateStartObject().getTime(); } );
        var sprintLast = _.max(myViewModel.sprints(), function(sprint) { return sprint.dateEndObject().getTime(); } );

        dateMin = sprintFirst ? sprintFirst.dateStartObject() : null;
        dateMax = sprintLast ? sprintLast.dateEndObject() : null;
    }

    containerStart.bootstrapDP({
        format: "yyyy-mm-dd",
        weekStart: 1,
        calendarWeeks: true
    })
    .on("changeDate", function(event) {
        if (valueEnd && event.date.format("yyyy-mm-dd") > valueEnd.format("yyyy-mm-dd")) {
            if (valueStart) {
                containerStart.val(valueStart.format("yyyy-mm-dd"));
            } else {
                containerStart.val("");
            }

            makeMessage("Start date cannot be later than end date.", "error", {});

            containerStart.closest(".control-group").addClass("error");
        } else if (edit && event.date.format("yyyy-mm-dd") > dateMin.format("yyyy-mm-dd")) {
            makeMessage("Start date overlaps with project sprints. Start date cannot be before " + dateMin.format("yyyy-mm-dd") + ".", "error", {});

            containerStart.closest(".control-group").addClass("error");
        } else {
            valueStart = new Date(event.date);

            containerStart.bootstrapDP("hide");
            containerStart.closest(".control-group").removeClass("error");
        }
    });

    containerEnd.bootstrapDP({
        format: "yyyy-mm-dd",
        weekStart: 1,
        calendarWeeks: true
    })
    .on("changeDate", function(event) {
        if (valueStart && event.date.format("yyyy-mm-dd") < valueStart.format("yyyy-mm-dd")) {
            if (valueEnd) {
                containerEnd.val(valueEnd.format("yyyy-mm-dd"));
            } else {
                containerEnd.val("");
            }

            makeMessage("End date cannot be before than start date.", "error", {});

            containerEnd.closest(".control-group").addClass("error");
        } else if (edit && event.date.format("yyyy-mm-dd") < dateMax.format("yyyy-mm-dd")) {
            makeMessage("End date overlaps with project sprints. End date must be at least " + dateMax.format("yyyy-mm-dd") + ".", "error", {});

            containerEnd.closest(".control-group").addClass("error");
        } else {
            valueEnd = new Date(event.date);

            containerEnd.bootstrapDP("hide");
            containerEnd.closest(".control-group").removeClass("error");
        }
    });
}

/**
 * Function initializes project planning view modal content.
 *
 * @param   {jQuery|$}  modal   Current modal content
 */
function initProjectPlanning(modal) {
    var c = document.cookie;

    // Iterate each panel-collapse and open it if it was opened previously
    jQuery("#backlogAccordion", modal).find(".panel-collapse").each(function () {
        if (this.id) {
            var pos = c.indexOf(this.id + "_collapse_in=");

            if (pos > -1) {
                if (c.substr(pos).split("=")[1].indexOf("false")) {
                    jQuery(this).addClass("in");
                    jQuery(this).parent().find(".icon-chevron-right")
                        .removeClass("icon-chevron-right")
                        .addClass("icon-chevron-down");
                } else {
                    jQuery(this).removeClass("in");
                    jQuery(this).parent().find(".icon-chevron-down")
                        .removeClass("icon-chevron-down")
                        .addClass("icon-chevron-right");
                }
            }
        }
    });

    // Make collapse panels
    jQuery("#backlogAccordion", modal)
        .collapse()
        .on("hidden.bs.collapse", function(event) {
            event.stopPropagation();
        })
        .on("show.bs.collapse", function(e) {
            jQuery(this).css("overflow", "visible");

            jQuery(e.target).parent().find(".icon-chevron-right")
                .removeClass("icon-chevron-right")
                .addClass("icon-chevron-down");
        })
        .on("hide.bs.collapse", function(e) {
            jQuery(e.target).parent().find(".icon-chevron-down")
                .removeClass("icon-chevron-down")
                .addClass("icon-chevron-right");
        })
        .on("hidden.bs.collapse shown.bs.collapse", function() {
            jQuery(this).find(".panel-collapse").each(function() {
                if (this.id) {
                    document.cookie = this.id + "_collapse_in=" + jQuery(this).hasClass("in");
                }
            });
        });

    // User clicks edit action of story or sprint
    modal.on("click", "i.event", function(event) {
        event.preventDefault();

        var element = jQuery(this);
        var id = element.data("id");
        var trigger = element.data("type") + "Edit";

        jQuery("body").trigger(trigger, [id, "projectPlanning"]);

        modal.modal("hide");
    });

    // Make sortable
    jQuery(".sortable", modal).sortable({
        connectWith: ".sortable",
        zIndex:"5000",
        helper: "clone",
        cursor: "move",
        stop: function(event, ui) {
            modal.find('ul').fadeTo(0, 0.5);

            var list = ui.item.closest("ul");
            var sprintId = parseInt(list.data("sprintId"));
            var items = list.find("li");
            var stories = [];

            // Iterate current list data
            jQuery.each(items, function(key, item) {
                var storyId = jQuery(item).data("storyId");
                var data = {
                    priority: key + 1,
                    sprintId: sprintId
                };

                // Update user story priority and sprint id data
                jQuery.ajax({
                    type: "PUT",
                    url: "/Story/" + storyId,
                    data: data,
                    dataType: "json"
                })
                .done(function(/** sails.json.story */story) {
                    stories.push(story);

                    // Check if we have processed all data
                    checkData();
                })
                .fail(function(jqXhr, textStatus, error) {
                    handleAjaxError(jqXhr, textStatus, error);
                });

                /**
                 * This is weird... this doesn't work and causes all socket communication to
                 * fail after these put calls. Gotta be sails.js bug or am I missing something?
                 */
                // socket.put("/Story/" + storyId, data, function(/** sails.json.story */story) {
                //     console.log("put");
                //     if (handleSocketError(story)) {
                //         console.log("asdfasdf");
                //     }
                // });
            });

            /**
             * This function updates actual knockout data models after all
             * story updates are done to the server successfully.
             *
             * Note that sprint must be selected otherwise there is no need
             * to update knockout model data.
             *
             * Function checks that we have processed all story updates. This will
             * also
             */
            function checkData() {
                // Check that all is fine
                if (stories.length === items.length && myViewModel.sprint()) {
                    var currentSprintId = myViewModel.sprint().id();

                    // Iterate updated models
                    jQuery.each(stories, function(key, story) {
                        var storyId = story.id;
                        var sprintId = story.sprintId;

                        // Check if story exists in current scope
                        var _story = _.find(myViewModel.stories(), function(story) { return story.id() === storyId; });

                        // Story exists in current scope update OR delete it
                        if (typeof _story !== "undefined") {
                            // Story sprint changed, remove story from current scope
                            if (sprintId !== currentSprintId) {
                                myViewModel.stories.remove(_story);
                            }
                        } else if (sprintId === currentSprintId) {
                            myViewModel.stories.push(new Story(story));
                        }
                    });

                    makeMessage("User stories priorities changed successfully.", "success", {});

                    modal.find('ul').fadeTo(0, 1);
                } else if (stories.length === items.length) {
                    makeMessage("User stories priorities changed successfully.", "success", {});

                    modal.find('ul').fadeTo(0, 1);
                }
            }
        }
    });
}

/**
 * Function initializes project milestones tab to use in project edit. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initProjectTabMilestones(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    // Initialize action menu for project milestones and milestone stories
    initActionMenu(container, {});

    // User clicks action menu link
    body.on("click", "ul.actionMenu-actions a", function() {
        var element = jQuery(this);
        var projectId = element.data("projectId");
        var milestoneId = element.data("milestoneId");
        var storyId = element.data("storyId");
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
            trigger: "projectMilestones",
            parameters: [projectId]
        };

        // Determine used main action id
        var actionId = storyId || milestoneId;

        // Trigger milestone action event
        body.trigger(action, [actionId, trigger]);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-add-new-milestone='true']");

    // User wants to add new milestone to current sprint
    body.on("click", "[data-add-new-milestone='true']", function() {
        var element = jQuery(this);
        var projectId = element.data("projectId");

        // Hide current modal
        modal.modal("hide");

        // Specify used trigger to come back to this view
        var trigger = {
            trigger: "projectMilestones",
            parameters: [projectId]
        };

        // Trigger milestone add
        body.trigger("milestoneAdd", [projectId, trigger]);
    });
}

/**
 * Function initializes project backlog tab to use in project edit. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initProjectTabBacklog(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});

    // User clicks action menu link
    body.on("click", "ul.actionMenu-actions a", function() {
        var element = jQuery(this);
        var projectId = element.data("projectId");
        var storyId = element.data("storyId");
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
            trigger: "projectBacklog",
            parameters: [projectId]
        };

        // Trigger milestone action event
        body.trigger(action, [storyId, trigger]);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-add-new-story='true']");

    // User wants to add new milestone to current sprint
    body.on("click", "[data-add-new-story='true']", function() {
        var element = jQuery(this);
        var projectId = element.data("projectId");

        // Hide current modal
        modal.modal("hide");

        // Specify used trigger to come back to this view
        var trigger = {
            trigger: "projectBacklog",
            parameters: [projectId]
        };

        // Trigger milestone add
        body.trigger("storyAdd", [projectId, 0, trigger]);
    });

    if (myViewModel.role() !== 0) {
        // User changes story priority order
        jQuery("#projectBacklog tbody", container).sortable({
            axis: "y",
            helper: function(e, tr) {
                var helper = tr.clone();

                return helper.addClass("sortable");
            },
            stop: function() {
                var table = jQuery("#projectBacklog", container);
                var rows = table.find("tbody tr");
                var errors = false;
                var update = [];

                rows.fadeTo(0, 0.5);

                // Iterate each row
                rows.each(function(index) {
                    var storyId = jQuery(this).data("storyId");

                    // Hmm. this is weird, how cat it be that this is faster than sockets?
                    jQuery.ajax({
                        url: "/Story/" + storyId,
                        data: {
                            priority: index + 1
                        },
                        type: "PUT",
                        dataType: "json"
                    })
                    .done(function() {
                        update.push(true);

                        // Check if all is done
                        checkUpdate();
                    })
                    .fail(function(jqXhr, textStatus, error) {
                        update.push(false);

                        errors = true;

                        handleAjaxError(jqXhr, textStatus, error);
                    });
                });

                // Function to make sure that we have updated all rows.
                function checkUpdate() {
                    if (update.length == rows.length) {
                        var message = "";
                        var type = "success";

                        if (errors) {
                            type = "error";
                            message = "Error in stories priority update"
                        } else {
                            message = "Stories priorities changed successfully";
                        }

                        makeMessage(message, type, {});

                        rows.fadeTo(0, 1);
                    }
                }
            }
        });
    }
}

/**
 * Function initializes project statistics tab to use in project edit. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initProjectTabStatistics(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    container.find(".trunk8").trunk8({
        tooltip: false
    });

    jQuery("[data-toggle-details='true']", container).on("click", function() {
        var detailsContainer = jQuery("#" + jQuery(this).data("details"));

        detailsContainer.toggle();

        detailsContainer.find(".trunk8").trunk8({
            tooltip: false
        });
    });
}

/**
 * Function initializes project users tab to use in project edit. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initProjectTabUsers(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-add-new-user='true']");

    // User wants to add new user to project
    body.on("click", "[data-add-new-user='true']", function() {
        var element = jQuery(this);
        var projectId = element.data("projectId");

        // Hide current modal
        modal.modal("hide");

        var trigger = {
            trigger: "projectEdit",
            parameters: [projectId, null, {activeTab: "users"}]
        };

        body.trigger("projectUserAttach", [projectId, trigger]);
    });

    // Remove 'de-attach' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-remove-user='true']");

    // User wants to de-attach this user from project
    body.on("click", "[data-remove-user='true']", function() {
        var element = jQuery(this);
        var userId = element.data("userId");
        var projectId = element.data("projectId");

        // Hide current modal
        modal.modal("hide");

        var trigger = {
            trigger: "projectEdit",
            parameters: [projectId, null, {activeTab: "users"}]
        };

        body.trigger("projectUserDeAttach", [projectId, userId, trigger]);
    });

    // Remove 'role change' click listeners, this prevents firing this event multiple times
    body.off("click", "a.change-role");

    // User wants to change user role in project
    body.on("click", "a.change-role", function() {
        var element = jQuery(this);
        var userId = element.data("userId");
        var projectId = element.data("projectId");
        var roleId = element.data("roleId");

        // Hide current modal
        modal.modal("hide");

        var trigger = {
            trigger: "projectEdit",
            parameters: [projectId, null, {activeTab: "users"}]
        };

        body.trigger("projectUserRoleChange", [projectId, userId, roleId, trigger]);
    });
}