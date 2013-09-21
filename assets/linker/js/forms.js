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

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off('click', '[data-add-new-story="true"]');

    // User wants to add new story to current sprint
    body.on('click', '[data-add-new-story="true"]', function() {
        var element = jQuery(this);
        var milestoneId = element.data('milestoneId');
        var projectId = element.data('projectId');

        // Hide current modal
        modal.modal('hide');

        var trigger = {
            trigger: 'milestoneEdit',
            parameters: [milestoneId]
        };

        // Specify form data
        var formData = {
            milestoneId: milestoneId
        };

        // Trigger story add
        body.trigger('storyAdd', [projectId, 0, trigger, formData]);
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
