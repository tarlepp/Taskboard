/**
 * Function to initialize project form.
 *
 * @param   {jQuery}    modal       Current modal content
 * @param   {bool}      edit        Are we editing or not
 * @param   {{}}        parameters  Parameters
 */
function initProjectForm(modal, edit, parameters) {
    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery('#' + parameters.activeTab + 'Tab').click();
    }

    var inputTitle = jQuery('input[name="title"]', modal);

    inputTitle.focus().val(inputTitle.val());

    var containerStart = jQuery('.dateStart', modal);
    var containerEnd = jQuery('.dateEnd', modal);
    var inputStart = containerStart.find('input');
    var inputEnd = containerEnd.find('input');
    var bitsStart = inputStart.val().split('-');
    var bitsEnd = inputEnd.val().split('-');
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

    if (edit) {
      //  dateMin = new Date(myViewModel.project().sprintDateMin());
      //  dateMax = new Date(myViewModel.project().sprintDateMax());
    }

    containerStart.bootstrapDP({
        format: 'yyyy-mm-dd',
        weekStart: 1,
        calendarWeeks: true
    }).on('changeDate', function(event) {
        if (valueEnd && event.date.format('yyyy-mm-dd') > valueEnd.format('yyyy-mm-dd')) {
            if (valueStart) {
                containerStart.val(valueStart.format('yyyy-mm-dd'));
            } else {
                containerStart.val('');
            }

            makeMessage('Start date cannot be later than end date.', 'error', {});

            containerStart.closest('.control-group').addClass('error');
        } else if (edit && event.date.format('yyyy-mm-dd') > dateMin.format('yyyy-mm-dd')) {
            makeMessage('Start date overlaps with project sprints. Start date cannot be before ' + dateMin.format('yyyy-mm-dd') + '.', 'error', {});

            containerStart.closest('.control-group').addClass('error');
        } else {
            valueStart = new Date(event.date);

            containerStart.bootstrapDP('hide');
            containerStart.closest('.control-group').removeClass('error');
        }
    });

    containerEnd.bootstrapDP({
        format: 'yyyy-mm-dd',
        weekStart: 1,
        calendarWeeks: true
    }).on('changeDate', function(event) {
        if (valueStart && event.date.format('yyyy-mm-dd') < valueStart.format('yyyy-mm-dd')) {
            if (valueEnd) {
                containerEnd.val(valueEnd.format('yyyy-mm-dd'));
            } else {
                containerEnd.val('');
            }

            makeMessage('End date cannot be before than start date.', 'error', {});

            containerEnd.closest('.control-group').addClass('error');
        } else if (edit && event.date.format('yyyy-mm-dd') < dateMax.format('yyyy-mm-dd')) {
            makeMessage('End date overlaps with project sprints. End date must be at least ' + dateMax.format('yyyy-mm-dd') + '.', 'error', {});

            containerStart.closest('.control-group').addClass('error');
        } else {
            valueEnd = new Date(event.date);

            containerEnd.bootstrapDP('hide');
            containerEnd.closest('.control-group').removeClass('error');
        }
    });
}

/**
 * Function initializes project milestones view to use.
 *
 * @param   {jQuery}    modal       Current modal content
 * @param   {string}    contentId   Milestone div id
 */
function initProjectMilestones(modal, contentId) {
    var body = jQuery('body');
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});

    // User clicks action menu link
    body.on('click', 'ul.actionMenu-actions a', function() {
        var element = jQuery(this);
        var projectId = element.data('projectId');
        var milestoneId = element.data('milestoneId');
        var storyId = element.data('storyId');
        var action = element.data('action');
        var selector = element.data('selector');

        // We have popover selector, so hide it
        if (selector) {
            jQuery(selector).popover('hide');
        }

        // Hide current modal
        modal.modal('hide');

        // Specify used trigger to come back to this view
        var trigger = {
            trigger: 'projectMilestones',
            parameters: [projectId]
        };

        // Determine used main action id
        var actionId = storyId || milestoneId;

        // Trigger milestone action event
        body.trigger(action, [actionId, trigger]);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off('click', '[data-add-new-milestone="true"]');

    // User wants to add new milestone to current sprint
    body.on('click', '[data-add-new-milestone="true"]', function() {
        var element = jQuery(this);
        var projectId = element.data('projectId');

        // Hide current modal
        modal.modal('hide');

        // Specify used trigger to come back to this view
        var trigger = {
            trigger: 'projectMilestones',
            parameters: [projectId]
        };

        // Trigger milestone add
        body.trigger('milestoneAdd', [projectId, trigger]);
    });
}

/**
 * Function initializes project backlog view to use.
 *
 * @param   {jQuery}    modal       Current modal content
 * @param   {string}    contentId   Backlog div id
 */
function initProjectBacklog(modal, contentId) {
    var body = jQuery('body');
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});

    // User clicks action menu link
    body.on('click', 'ul.actionMenu-actions a', function() {
        var element = jQuery(this);
        var projectId = element.data('projectId');
        var storyId = element.data('storyId');
        var action = element.data('action');
        var selector = element.data('selector');

        // We have popover selector, so hide it
        if (selector) {
            jQuery(selector).popover('hide');
        }

        // Hide current modal
        modal.modal('hide');

        // Specify used trigger to come back to this view
        var trigger = {
            trigger: 'projectBacklog',
            parameters: [projectId]
        };

        // Trigger milestone action event
        body.trigger(action, [storyId, trigger]);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off('click', '[data-add-new-story="true"]');

    // User wants to add new milestone to current sprint
    body.on('click', '[data-add-new-story="true"]', function() {
        var element = jQuery(this);
        var projectId = element.data('projectId');

        // Hide current modal
        modal.modal('hide');

        // Specify used trigger to come back to this view
        var trigger = {
            trigger: 'projectBacklog',
            parameters: [projectId]
        };

        // Trigger milestone add
        body.trigger('storyAdd', [projectId, 0, trigger]);
    });

    // User changes story priority order
    jQuery("#projectBacklog tbody", container).sortable({
        axis: 'y',
        helper: function(e, tr) {
            var helper = tr.clone();

            return helper.addClass('sortable');
        },
        stop: function(event, ui) {
            var table = jQuery("#projectBacklog", container);
            var rows = table.find('tbody tr');
            var errors = false;
            var update = [];

            rows.fadeTo(0, 0.5);

            // Iterate each row
            rows.each(function(index) {
                var storyId = jQuery(this).data('storyId');

                // Hmm. this is weird, how cat it be that this is faster than sockets?
                jQuery.ajax({
                    url: '/Story/' + storyId,
                    data: {
                        priority: index + 1
                    },
                    dataType: 'json'
                })
                .done(function(/** models.rest.story */story) {
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

/**
 * Function to initialize story form.
 *
 * @param   {jQuery}    modal   Current modal content
 * @param   {bool}      edit    Are we editing or not
 */
function initStoryForm(modal, edit) {
    var inputTitle = jQuery('input[name="title"]', modal);

    inputTitle.focus().val(inputTitle.val());

    var slider = jQuery('.estimateSlider', modal);
    var input = slider.next('input');
    var show = jQuery('.sliderValue', modal);
    var currentValue = 0;

    // Specify fibonacci values for story sizes
    var values = [ -1, 0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100 ];

    jQuery.each(values, function(key, value) {
        if (value == input.val()) {
            currentValue = key;
        }
    });

    show.val(currentValue == 0 ? '???' : values[currentValue]);

    // Note that this slider only accepts fibonacci values
    slider.slider({
        min: 0,
        max: values.length - 1,
        value: currentValue,
        step: 1,
        slide: function(event, ui) {
            input.val(values[ui.value]);

            if (ui.value === 0) {
                show.val('???');
            } else {
                show.val(values[ui.value]);
            }
        }
    });
}

/**
 * Function initializes project backlog modal content.
 *
 * @param   {jQuery}    modal   Current modal content
 */
function initProjectPlanning(modal) {
    var c = document.cookie;

    jQuery('#backlogAccordion', modal).find('.collapse').each(function () {
        if (this.id) {
            var pos = c.indexOf(this.id + "_collapse_in=");

            if (pos > -1) {
                if (c.substr(pos).split('=')[1].indexOf('false')) {
                    jQuery(this).addClass('in');
                    jQuery(this).parent().find(".icon-chevron-right").removeClass("icon-chevron-right").addClass("icon-chevron-down");
                } else {
                    jQuery(this).removeClass('in');
                    jQuery(this).parent().find(".icon-chevron-down").removeClass("icon-chevron-down").addClass("icon-chevron-right");
                }
            }
        }
    });

    jQuery('#backlogAccordion', modal)
        .collapse()
        .on('hidden.bs.collapse', function(event) {
            event.stopPropagation();
        })
        .on('show.bs.collapse', function(e) {
            jQuery(this).css('overflow', 'visible');

            jQuery(e.target).parent().find(".icon-chevron-right").removeClass("icon-chevron-right").addClass("icon-chevron-down");
        })
        .on('hide.bs.collapse', function(e) {
            jQuery(e.target).parent().find(".icon-chevron-down").removeClass("icon-chevron-down").addClass("icon-chevron-right");
        })
        .on('hidden.bs.collapse shown.bs.collapse', function() {
            jQuery(this).find('.collapse').each(function() {
                if (this.id) {
                    document.cookie = this.id + "_collapse_in=" + jQuery(this).hasClass('in');
                }
            });
        });

    jQuery('.sortable', modal).sortable({
        connectWith: '.sortable',
        zIndex:'5000',
        helper: 'clone',
        cursor: 'move',
        stop: function(event, ui) {
            var list = ui.item.closest('ul');
            var sprintId = parseInt(list.data('sprintId'));
            var items = list.find('li');
            var models = [];

            // Iterate current list data
            jQuery.each(items, function(key, item) {
                var storyId = jQuery(item).data('storyId');

                // Update user story priority and sprint id data
                jQuery.ajax({
                    type: 'PUT',
                    url: "/Story/" + storyId,
                    data: {
                        priority: key,
                        sprintId: sprintId
                    },
                    dataType: 'json'
                })
                .done(function(/** models.rest.story */story) {
                    models.push(new Story(story));

                    checkData();
                })
                .fail(function(jqXhr, textStatus, error) {
                    handleAjaxError(jqXhr, textStatus, error);
                });
            });

            /**
             * This function updates actual knockout data models after all
             * story updates are done to the server successfully.
             *
             * Note that sprint must be selected otherwise there is no need
             * to update knockout model data.
             */
            function checkData() {
                // Check that all is fine
                if (models.length === items.length && myViewModel.sprint()) {
                    var currentSprintId = ko.toJS(ko.toJS(myViewModel.sprint().id()));

                    // Iterate updated models
                    jQuery.each(models, function(keyData, storyData) {
                        var dataId = ko.toJS(storyData.id());
                        var dataSprintId = ko.toJS(storyData.sprintId());
                        var founded = false;

                        // Iterate current stories
                        jQuery.each(myViewModel.stories(), function(keyModel, storyModel) {
                            if (storyModel) {
                                var modelId = ko.toJS(storyModel.id());
                                var modelSprintId = ko.toJS(storyModel.sprintId());

                                // We founded story in current sprint stories
                                if (dataId === modelId) {
                                    founded = true;

                                    // User has only change story priorities, update current story model
                                    if (dataSprintId === modelSprintId) {
                                        myViewModel.stories.replace(storyModel, storyData);
                                    } else { // Otherwise remove current story model
                                        myViewModel.stories.remove(storyModel);
                                    }
                                }
                            }
                        });

                        // We haven't founded story and it's belongs to current sprint
                        if (founded === false && dataSprintId === currentSprintId) {
                            myViewModel.stories.push(storyData);
                        }
                    });

                    makeMessage("User stories priorities changed successfully.", "success", {});
                } else if (models.length === items.length) {
                    makeMessage("User stories priorities changed successfully.", "success", {});
                }
            }
        }
    });
}

/**
 * Function initializes project phases admin modal content.
 *
 * @param   {jQuery}    modal   Current modal content
 */
function initProjectPhases(modal) {
    // Initialize jQuery UI sliders for phase task count
    jQuery.each(jQuery('#projectPhases', modal).find('.slider'), function() {
        var slider = jQuery(this);
        var input = slider.next('input');
        var currentValue = parseInt(input.val(), 10);
        var cellValue = slider.parent().next('td');

        if (isNaN(currentValue) || currentValue === 0) {
            cellValue.html('unlimited');
        } else {
            cellValue.html(currentValue);
        }

        slider.slider({
            min: 0,
            max: 10,
            value: currentValue,
            slide: function(event, ui) {
                if (isNaN(ui.value) || ui.value === 0) {
                    cellValue.html('unlimited');
                } else {
                    cellValue.html(ui.value);
                }

                input.val(ui.value);
            }
        });
    });

    // Fix for jQuery UI sortable helper
    var fixHelper = function(e, ui) {
        ui.children().each(function() {
            jQuery(this).width(jQuery(this).width());
        });

        return ui;
    };

    var sortable = jQuery("#projectPhases").find("tbody");

    sortable.sortable({
        helper: fixHelper,
        axis: 'y',
        cursor: 'move',
        stop: function(event, ui) {
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
    modal.on('click', '.phaseDelete', function() {
        var row = jQuery(this).closest('tr');
        var phaseId = parseInt(row.data('phaseId'), 10);

        // Not a "real" phase (row is not yet saved), so just remove whole row
        if (isNaN(phaseId)) {
            row.remove();
        } else { // Otherwise we have a real phase
            // Fetch tasks that are attached to this phase
            socket.get('/Task', {phaseId: phaseId}, function(tasks) {
                if (_.size(tasks) === 0) {
                    modal.modal('hide');

                    var body = jQuery('body');

                    // Show confirm modal to user
                    bootbox.confirm({
                        title: "danger - danger - danger",
                        message: "Are you sure of phase delete?",
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
                                socket.delete('/Phase/' + phaseId, function(data) {
                                    if (handleSocketError(data)) {
                                        makeMessage("Phase deleted successfully.", "success", {});

                                        var phase = _.find(myViewModel.phases(), function(phase) {
                                            return phase.id() === data.id;
                                        });

                                        if (typeof phase !== 'undefined') {
                                            myViewModel.phases.remove(phase);
                                        }

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
            });
        }
    });
}

/**
 * Function initializes sprint add/edit form to use. Note that form is
 * located in modal content.
 *
 * @param   {jQuery}    modal   Current modal content
 * @param   {Boolean}   edit    Are we editing existing sprint or not
 */
function initSprintForm(modal, edit, parameters) {
    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery('#' + parameters.activeTab + 'Tab').click();
    }

    var inputTitle = jQuery('input[name="title"]', modal);

    inputTitle.focus().val(inputTitle.val());

    var containerStart = jQuery('.dateStart', modal);
    var containerEnd = jQuery('.dateEnd', modal);
    var inputStart = containerStart.find('input');
    var inputEnd = containerEnd.find('input');
    var bitsStart = inputStart.val().split('-');
    var bitsEnd = inputEnd.val().split('-');
    var valueStart = null;
    var valueEnd = null;
    var dateMin = myViewModel.project().dateStartObject();
    var dateMax = myViewModel.project().dateEndObject();

    var sprintId = edit ? ko.toJS(myViewModel.sprint().id()) : 0;

    if (bitsStart.length === 3) {
        valueStart = new Date(bitsStart[0], bitsStart[1] - 1, bitsStart[2], 3, 0, 0);
    }

    if (bitsEnd.length === 3) {
        valueEnd = new Date(bitsEnd[0], bitsEnd[1] - 1, bitsEnd[2], 3, 0, 0);
    }

    containerStart.bootstrapDP({
        format: 'yyyy-mm-dd',
        weekStart: 1,
        calendarWeeks: true
    })
    .on('changeDate', function(event) {
        if (valueEnd && event.date.format('yyyy-mm-dd') > valueEnd.format('yyyy-mm-dd')) {
            if (valueStart) {
                containerStart.val(valueStart.format('yyyy-mm-dd'));
            } else {
                containerStart.val('');
            }

            makeMessage('Start date cannot be later than end date.', 'error', {});

            containerStart.closest('.input-group').addClass('has-error');
        } else if (
            (event.date.format('yyyy-mm-dd') < dateMin.format('yyyy-mm-dd'))
            || (event.date.format('yyyy-mm-dd') > dateMax.format('yyyy-mm-dd'))
        ) {
            makeMessage('Start date conflicts with project duration. Start date must be between ' + dateMin.format('yyyy-mm-dd') + ' and ' + dateMax.format('yyyy-mm-dd')  + '.', 'error', {});

            containerStart.closest('.input-group').addClass('has-error');
        } else if (checkSprintDates(event.date, 1, sprintId, true) !== true) {
            containerStart.closest('.input-group').addClass('has-error');
        } else {
            valueStart = new Date(event.date);

            containerStart.bootstrapDP('hide');
            containerStart.closest('.input-group').removeClass('has-error');
        }
    });

    containerEnd.bootstrapDP({
        format: 'yyyy-mm-dd',
        weekStart: 1,
        calendarWeeks: true
    })
    .on('changeDate', function(event) {
        if (valueStart && event.date.format('yyyy-mm-dd') < valueStart.format('yyyy-mm-dd')) {
            if (valueEnd) {
                containerEnd.val(valueEnd.format('yyyy-mm-dd'));
            } else {
                containerEnd.val('');
            }

            makeMessage('End date cannot be before than start date.', 'error', {});

            containerEnd.closest('.input-group').addClass('has-error');
        } else if (
            (event.date.format('yyyy-mm-dd') < dateMin.format('yyyy-mm-dd'))
            || (event.date.format('yyyy-mm-dd') > dateMax.format('yyyy-mm-dd'))
            ) {
            makeMessage('End date conflicts with project duration. End date must be between ' + dateMin.format('yyyy-mm-dd') + ' and ' + dateMax.format('yyyy-mm-dd')  + '.', 'error', {});

            containerStart.closest('.input-group').addClass('has-error');
        } else if (checkSprintDates(event.date, 1, sprintId, true) !== true) {
            containerStart.closest('.input-group').addClass('has-error');
        } else {
            valueEnd = new Date(event.date);

            containerEnd.bootstrapDP('hide');
            containerEnd.closest('.input-group').removeClass('has-error');
        }
    });
}

/**
 * Function initializes sprint backlog view to use.
 *
 * @param   {jQuery}    modal       Current modal content
 * @param   {string}    contentId   Backlog div id
 */
function initSprintBacklog(modal, contentId) {
    var body = jQuery('body');
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});

    // User clicks action menu link
    body.on('click', 'ul.actionMenu-actions a', function() {
        var element = jQuery(this);
        var storyId = element.data('storyId');
        var action = element.data('action');
        var selector = element.data('selector');

        // We have popover selector, so hide it
        if (selector) {
            jQuery(selector).popover('hide');
        }

        // Hide current modal
        modal.modal('hide');

        // Trigger milestone action event
        body.trigger(action, [storyId, 'sprintBacklog']);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off('click', '[data-add-new-story="true"]');

    // User wants to add new story to current sprint
    body.on('click', '[data-add-new-story="true"]', function() {
        var element = jQuery(this);
        var sprintId = element.data('sprintId');
        var projectId = element.data('projectId');

        // Hide current modal
        modal.modal('hide');

        // Trigger story add
        body.trigger('storyAdd', [projectId, sprintId, 'sprintBacklog']);
    });


    jQuery("#sprintBacklog tbody", container).sortable({
        axis: 'y',
        helper: function(e, tr) {
            var helper = tr.clone();

            return helper.addClass('sortable');
        },
        start: function(event, ui) {
        },
        stop: function(event, ui) {
            var table = jQuery("#sprintBacklog", container);
            var rows = table.find('tbody tr');
            var errors = false;
            var update = [];

            rows.fadeTo(0, 0.5);

            // Iterate each row
            rows.each(function(index) {
                var storyId = jQuery(this).data('storyId');

                // Update story data via socket
                socket.put('/Story/' + storyId, {priority: index + 1}, function(story) {
                    if (handleSocketError(story)) {
                        update.push(true);

                        myViewModel.processSocketMessage('story', 'update', story.id, story);
                    } else {
                        update.push(false);

                        errors = true;
                    }

                    // Check if all is done
                    checkUpdate();
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

/**
 * Function initializes task add/edit form to use. Note that form is
 * located in modal content.
 *
 * @param   {jQuery}    modal   Current modal content
 * @param   {Boolean}   edit    Are we editing existing task or not
 */
function initTaskForm(modal, edit) {
    var inputTitle = jQuery('input[name="title"]', modal);

    inputTitle.focus().val(inputTitle.val());
}

/**
 * Function initializes milestone list to use. Note that milestone list
 * content is in modal parameter.
 *
 * @param   {jQuery}    modal   Current modal content
 */
function initMilestoneStories(modal, contentId) {
    var body = jQuery('body');
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});

    // User clicks action menu link
    body.on('click', 'ul.actionMenu-actions a', function() {
        var element = jQuery(this);
        var storyId = element.data('storyId');
        var milestoneId = element.data('milestoneId');
        var action = element.data('action');
        var selector = element.data('selector');

        // We have popover selector, so hide it
        if (selector) {
            jQuery(selector).popover('hide');
        }

        // Hide current modal
        modal.modal('hide');

        var trigger = {
            trigger: 'milestoneEdit',
            parameters: [milestoneId]
        };

        // Trigger milestone action event
        body.trigger(action, [storyId, trigger]);
    });
}

/**
 * Function initializes milestone form.
 *
 * @param   {jQuery}    context Current modal content
 * @param   {Boolean}   edit    Are we editing existing milestone or not
 */
function initMilestoneForm(context, edit) {
    var body = jQuery('body');
    var inputTitle = jQuery('input[name="title"]', context);
    var containerDeadline = jQuery('.deadline', context);

    inputTitle.focus().val(inputTitle.val());

    containerDeadline.bootstrapDP({
        format: 'yyyy-mm-dd',
        weekStart: 1,
        calendarWeeks: true
    })
    .on('changeDate', function(event) {
        var isValid = checkProjectDates(event.date, false);

        if (isValid !== true) {
            makeMessage(isValid, 'error', {});

            containerDeadline.closest('.input-group').addClass('has-error');
        } else {
            containerDeadline.bootstrapDP('hide');
        }
    });

    // User clicks milestone action menu link
    jQuery('ul.milestone-actions', context).on('click', 'a', function() {
        // Hide current modal
        context.modal('hide');

        var element = jQuery(this);
        var storyId = element.data('storyId');
        var milestoneId = element.data('milestoneId');
        var action = element.data('action');

        // Trigger milestone action event
        body.trigger(action, [storyId, {trigger: 'milestoneEdit', parameters: [milestoneId]}]);
    });
}
