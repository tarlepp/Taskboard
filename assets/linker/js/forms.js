/**
 * Function to initialize project form.
 *
 * @param   {jQuery}    modal   Current modal content
 * @param   {bool}      edit    Are we editing or not
 */
function initProjectForm(modal, edit) {
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
        dateMin = new Date(myViewModel.project().sprintDateMin());
        dateMax = new Date(myViewModel.project().sprintDateMax());
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
            // Specify parameters to fetch phase task data
            var parameters = {
                phaseId: phaseId
            };

            // Fetch tasks for current phase
            jQuery.getJSON("/task/", parameters)
            .done(function(/** models.task[] */tasks) {
                var body = jQuery('body');

                // Phase doesn't contain any tasks so delete is possible
                if (tasks.length === 0) {
                    modal.modal('hide');

                    // Show confirm modal to user
                    bootbox.confirm(
                        "Are you sure of phase delete?",
                        function(result) {
                            if (result) {
                                jQuery.ajax({
                                    type: "DELETE",
                                    url: "/phase/" + phaseId,
                                    dataType: 'json'
                                })
                                .done(function() {
                                    makeMessage("Phase deleted successfully.", "success", {});

                                    myViewModel.deletePhase(phaseId);

                                    body.trigger('phasesEdit');
                                })
                                .fail(function(jqXhr, textStatus, error) {
                                    handleAjaxError(jqXhr, textStatus, error);
                                });
                            } else {
                                body.trigger('phasesEdit');
                            }
                        }
                    );
                } else {
                    makeMessage("Cannot delete phase, because it contains tasks.", "error", {});
                }
            })
            .fail(function(jqXhr, textStatus, error) {
                handleAjaxError(jqXhr, textStatus, error);
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
function initSprintForm(modal, edit) {
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
function initMilestoneList(modal) {
    var body = jQuery('body');
    var trigger = 'milestoneList';

    // User clicks story
    jQuery('ul.story-list', modal).on('click', 'a', function() {
        // Hide current modal
        modal.modal('hide');

        // Trigger story edit
        body.trigger('storyEdit', [jQuery(this).data('storyId'), trigger]);
    });
}
