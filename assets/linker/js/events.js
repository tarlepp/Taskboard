// Init events for container
var initContainer = {
    users: false,
    projects: false,
    types: false,
    phases: false
};

// Init events for container
var initNavigation = {
    users: false,
    projects: false
};

jQuery(document).ready(function() {
    var body = jQuery('body');

    /**
     * Event to check if all initialize methods are done. If all necessary init methods
     * are executed event trigger will un-hide specified dom elements.
     *
     * @param   {Event}     event       Current event object
     * @param   {String}    initMethod  Initialize event name
     */
    body.on('initializeCheck', function(event, initMethod) {
        var initContainerDone = true;
        var initNavigationDone = true;

        initMethod = initMethod || false;

        // Change init event state to done
        if (initMethod !== false) {
            initContainer[initMethod] = true;
            initNavigation[initMethod] = true;
        }

        // Iterate init event states
        jQuery.each(initContainer, function(key, value) {
            // All not yet done.
            if (value === false) {
                initContainerDone = false;
            }
        });

        // Iterate init event states
        jQuery.each(initNavigation, function(key, value) {
            // All not yet done.
            if (value === false) {
                initNavigationDone = false;
            }
        });

        if (initContainerDone) {
            jQuery('#boardContent').show();
        } else {
            jQuery('#boardContent').hide();
        }

        if (initNavigationDone) {
            jQuery('#navigation').show();
        } else {
            jQuery('#navigation').hide();
        }
    });

    // Task open event
    body.on('dblclick', '.task', function() {
        var data = ko.dataFor(this);

        body.trigger('taskEdit', [data]);
    });

    // Story open event
    body.on('dblclick', '.story', function() {
        var data = ko.dataFor(this);

        body.trigger('storyEdit', [data.id()]);
    });

    // Help click event
    jQuery('#functionHelp').on('click', 'a', function() {
        var title = "Generic help";

        // create bootbox modal
        var modal = createBootboxDialog(title, JST["assets/linker/templates/help_generic.html"](), null, false);

        // Add help class and show help modal
        modal.addClass('modalHelp');
        modal.modal('show');
    });

    /**
     * Milestone add event. This opens a modal dialog with milestone add form.
     */
    body.on('milestoneAdd', function(event, projectId, trigger) {
        trigger = trigger || {};

        jQuery.get('/Milestone/add', {projectId: projectId}, function(content) {
            var title = "Add new milestone";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formMilestoneNew', modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to create new task
                        if (validateForm(formItems, modal)) {
                            jQuery.ajax({
                                type: 'POST',
                                url: "/Milestone/",
                                data: formItems,
                                dataType: 'json'
                            })
                            .done(function(/** models.rest.milestone */milestone) {
                                makeMessage("Milestone created successfully.", "success", {});

                                modal.modal('hide');

                                handleEventTrigger(trigger);
                            })
                            .fail(function(jqXhr, textStatus, error) {
                                handleAjaxError(jqXhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initMilestoneForm(modal, false);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    body.on('milestoneEdit', function(event, milestoneId, trigger) {
        if (typeof trigger === 'undefined') {
            trigger = {
                trigger: 'projectMilestones',
                parameters: [myViewModel.project().id()]
            };
        }

        jQuery.get('/Milestone/edit', {id: milestoneId}, function(content) {
            var title = "Edit milestone";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formMilestoneEdit', modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to update milestone data
                        if (validateForm(formItems, modal)) {
                            jQuery.ajax({
                                type: "PUT",
                                url: "/Milestone/" + milestoneId,
                                data: formItems,
                                dataType: 'json'
                            })
                            .done(function(/** models.rest.milestone */milestone) {
                                makeMessage("Milestone updated successfully.", "success", {});

                                modal.modal('hide');

                                handleEventTrigger(trigger);
                            })
                            .fail(function(jqXhr, textStatus, error) {
                                handleAjaxError(jqXhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    className: "btn-danger pull-right",
                    callback: function() {
                        modal.modal('hide');

                        bootbox.confirm({
                            title: 'danger - danger - danger',
                            message: 'Are you sure of milesone delete?',
                            buttons: {
                                'cancel': {
                                    className: 'btn-default pull-left'
                                },
                                'confirm': {
                                    label: 'Delete',
                                    className: 'btn-danger pull-right'
                                }
                            },
                            callback: function(result) {
                                if (result) {
                                    jQuery.ajax({
                                        type: "DELETE",
                                        url: "/milestone/" + milestoneId,
                                        dataType: 'json'
                                    })
                                    .done(function() {
                                        makeMessage("Milestone deleted successfully.", "success", {});

                                        handleEventTrigger(trigger);
                                    })
                                    .fail(function(jqXhr, textStatus, error) {
                                        handleAjaxError(jqXhr, textStatus, error);
                                    });
                                } else {
                                    jQuery('body').trigger('milestoneEdit', [milestoneId, trigger]);
                                }
                            }
                        });
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initMilestoneForm(modal, true);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    body.on('milestoneDelete', function(event, milestoneId, trigger) {
        bootbox.confirm({
            title: 'danger - danger - danger',
            message: 'Are you sure of milesone delete?',
            buttons: {
                'cancel': {
                    className: 'btn-default pull-left'
                },
                'confirm': {
                    label: 'Delete',
                    className: 'btn-danger pull-right'
                }
            },
            callback: function(result) {
                if (result) {
                    jQuery.ajax({
                        type: "DELETE",
                        url: "/milestone/" + milestoneId,
                        dataType: 'json'
                    })
                    .done(function() {
                        makeMessage("Milestone deleted successfully.", "success", {});

                        handleEventTrigger(trigger);
                    })
                    .fail(function(jqXhr, textStatus, error) {
                        handleAjaxError(jqXhr, textStatus, error);
                    });
                } else {
                    handleEventTrigger(trigger);
                }
            }
        });
    });
});
