
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
