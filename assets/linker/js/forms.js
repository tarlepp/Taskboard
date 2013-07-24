/**
 * Generic form validation function. Usage as below:
 *
 * if (validateForm(jQuery('#yourForm').serializeJSON())) {
 *     // Form is valid
 * } else {
 *     // Form is not valid
 * }
 *
 * @param   {{}}  items
 *
 * @returns {boolean}
 */
function validateForm(items) {
    var valid = true;
    var errors = [];
    var required = [];

    if (jQuery.isEmptyObject(items)) {
        valid = false;

        errors.push("No form items to validate.");
    }

    // Iterate each form item
    jQuery.each(items, function(key, item) {
        var input = jQuery('#' + key);

        if (input.length === 0) {
            input = jQuery("[name='"+ key +"']");
        }

        if (input.getType() == 'div') {
            input = input.find('input');
        }

        var group = input.closest('.control-group');
        var label = group.find('label').html();
        var value = jQuery.trim(input.val());
        var type = input.data('validateType');
        var method = null;

        switch (type) {
            case 'date':
                method = 'validateDate';
                break;
            case 'daterange':
                method = 'validateDateRange';
                break;
        }

        if ((input.prop('required') && value == '')
            || (input.getType() == 'select' && value == '#')
        ) {
            required.push(label);

            group.addClass('error');

            if (input.data('focus') !== false) {
                input.focus();
            }

            valid = false;
        } else if (method && dispatch(method, [input, group, label, value, errors]) !== true) {
            group.addClass('error');

            if (input.data('focus') !== false) {
                input.focus();
            }

            valid = false;
        } else {
            group.removeClass('error')
        }
    });

    if (!valid) {
        var message = "Errors in form.<br />";

        if (required.length > 0) {
            message += "Following fields are required: '" + required.unique().join("', '") + "'<br />";
        }

        if (errors.length > 0) {
            message += errors.unique().join("<br />");
        }

        makeMessage(message, 'error');
    }

    return valid;
}

/**
 * Generic function to check date input field on form.
 *
 * @todo    this function needs lots of work...
 *
 * @param   {jQuery}    input   Current input field
 * @param   {jQuery}    group   Input control group
 * @param   {String}    label   Input label as a text
 * @param   {String}    date    Actual text (date) from input (yyyy-mm-dd)
 * @param   {Array}     errors  Array of current errors
 *
 * @returns {boolean}
 */
function validateDate(input, group, label, date, errors) {

    return checkDate(date);
}

/**
 * Method validates date range inputs.
 *
 * @todo    How to avoid double check?
 *
 * @param   {jQuery}    input   Current input field
 * @param   {jQuery}    group   Input control group
 * @param   {String}    label   Input label as a text
 * @param   {String}    date    Actual text (date) from input (yyyy-mm-dd)
 * @param   {Array}     errors  Array of current errors
 *
 * @returns {boolean}
 */
function validateDateRange(input, group, label, date, errors) {
    var role = input.data('role');
    var edit = input.data('edit');
    var type = input.data('type');
    var pair = jQuery('#' + input.data('pair')).val();
    var message = "";

    /**
     * Make basic check for given date. Note that else block does not
     * need error message pushing because this function is always called
     * for both of the date range fields.
     *
     * @todo refactor this later...
     */
    if (checkDate(date) !== true) {
        switch (role) {
            case 'start':
                message = "Given start date is invalid.";
                break;
            default:
                message = "Given end date is invalid.";
                break;
        }

        errors.push(message);

        return false;
    } else if (checkDate(pair) !== true) {
        return false;
    }

    var dateBitsSelf = date.split('-');
    var dateBitsPair = pair.split('-');
    var dateSelf = new Date(+dateBitsSelf[0], +dateBitsSelf[1] - 1, +dateBitsSelf[2]);
    var datePair = new Date(+dateBitsPair[0], +dateBitsPair[1] - 1, +dateBitsPair[2]);

    if ((role == 'start' && dateSelf.format('yyyy-mm-dd') > datePair.format('yyyy-mm-dd'))
        || (role == 'end' && dateSelf.format('yyyy-mm-dd') < datePair.format('yyyy-mm-dd'))
    ) {
        errors.push("Invalid date range.");

        return false;
    }

    if (type == 'project' && edit) {
        var dateMin = new Date(myViewModel.project().sprintDateMin());
        var dateMax = new Date(myViewModel.project().sprintDateMax());

        if (role == 'start' && dateSelf.format('yyyy-mm-dd') > dateMin.format('yyyy-mm-dd')) {
            errors.push('Start date overlaps with project sprints. Start date cannot be before ' + dateMin.format('yyyy-mm-dd') + '.');

            return false;
        } else if (role == 'end' && dateSelf.format('yyyy-mm-dd') < dateMax.format('yyyy-mm-dd')) {
            errors.push('End date overlaps with project sprints. End date must be at least ' + dateMax.format('yyyy-mm-dd') + '.');

            return false;
        }
    } else if (type == 'sprint') {
        var sprintId = edit ? ko.toJS(myViewModel.sprint().id()) : 0;
        var dateType = role == 'start' ? 0 : 1;
        var isValid = checkSprintDates(dateSelf, dateType, sprintId, false);

        if (isValid !== true) {
            errors.push(isValid);

            return false;
        }
    }

    return true;
}

/**
 * Generic date string checker function.
 *
 * @param   {String}    dateText    Date must be in yyyy-mm-dd or yyyy.mm.dd format
 *
 * @returns {boolean}
 */
function checkDate(dateText) {
    if (typeof(dateText) == 'undefined') {
        return false;
    }

    var match = dateText.match(/^(\d{4})([-\.\/])(\d{2})\2(\d{2})$/);

    if (match === null) {
        return false;
    }

    var date = new Date(+match[1], +match[3] - 1, +match[4]);

    return date.getFullYear() == +match[1] && date.getMonth() == +match[3] - 1 && date.getDate() == +match[4];
}

/**
 * Function to initialize project form.
 *
 * @param   {jQuery}    modal   Current modal content
 * @param   {bool}      edit    Are we editing or not
 */
function initProjectForm(modal, edit) {
    var inputTitle = jQuery('input[name="title"]', modal);

    inputTitle.focus().val(inputTitle.val());

    jQuery('textarea', modal).autosize();

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

    jQuery('textarea', modal).autosize();

    var slider = jQuery('.estimateSlider', modal);
    var input = slider.next('input');
    var show = jQuery('.sliderValue', modal);
    var currentValue = 0;

    // Specify fibonacci values for story sizes
    var values = [ 0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100 ];

    jQuery.each(values, function(key, value) {
        if (value == input.val()) {
            currentValue = key;
        }
    });

    // Note that this slider only accepts fibonacci values
    slider.slider({
        min: 0,
        max: values.length - 1,
        value: currentValue,
        step: 1,
        slide: function(event, ui) {
            input.val(values[ui.value]);
            show.val(values[ui.value]);
        }
    });
}

/**
 * Function initializes project backlog modal content.
 *
 * @param   {jQuery}    modal   Current modal content
 */
function initProjectBacklog(modal) {
    var tooltips = jQuery('[rel=tooltip]', modal);

    if (tooltips.length) {
        tooltips.tooltip()
        .on('show', function(e) {
            e.stopPropagation();
        })
        .on('hidden', function(e) {
            e.stopPropagation();
        });
    }

    var c = document.cookie;

    jQuery('#backlogAccordion', modal).find('.collapse').each(function () {
        if (this.id) {
            var pos = c.indexOf(this.id + "_collapse_in=");

            if (pos > -1) {
                if (c.substr(pos).split('=')[1].indexOf('false')) {
                    jQuery(this).addClass('in');
                    jQuery(this).parent().find('i.chevron').removeClass('icon-chevron-right').addClass('icon-chevron-down');
                } else {
                    jQuery(this).removeClass('in');
                    jQuery(this).parent().find('i.chevron').removeClass('icon-chevron-down').addClass('icon-chevron-right');
                }
            }
        }
    });

    jQuery('#backlogAccordion', modal)
    .collapse()
    .on('hidden', function(event) {
        event.stopPropagation();
    })
    .on('show', function(e) {
        jQuery(this).css('overflow', 'visible');

        jQuery(e.target).parent().find(".icon-chevron-right").removeClass("icon-chevron-right").addClass("icon-chevron-down");
    })
    .on('hide', function(e) {
        jQuery(e.target).parent().find(".icon-chevron-down").removeClass("icon-chevron-down").addClass("icon-chevron-right");
    })
    .on('hidden shown', function() {
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
        appendTo: 'body',
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

    jQuery('textarea', modal).autosize();

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
    .on('onRender', function(event) {
        console.log('wut');
        return 'disabled';
    })
    .on('changeDate', function(event) {
        if (valueEnd && event.date.format('yyyy-mm-dd') > valueEnd.format('yyyy-mm-dd')) {
            if (valueStart) {
                containerStart.val(valueStart.format('yyyy-mm-dd'));
            } else {
                containerStart.val('');
            }

            makeMessage('Start date cannot be later than end date.', 'error', {});

            containerStart.closest('.control-group').addClass('error');
        } else if (
            (event.date.format('yyyy-mm-dd') < dateMin.format('yyyy-mm-dd'))
            || (event.date.format('yyyy-mm-dd') > dateMax.format('yyyy-mm-dd'))
        ) {
            makeMessage('Start date conflicts with project duration. Start date must be between ' + dateMin.format('yyyy-mm-dd') + ' and ' + dateMax.format('yyyy-mm-dd')  + '.', 'error', {});

            containerStart.closest('.control-group').addClass('error');
        } else if (checkSprintDates(event.date, 1, sprintId, true) !== true) {
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
    })
    .on('changeDate', function(event) {
        if (valueStart && event.date.format('yyyy-mm-dd') < valueStart.format('yyyy-mm-dd')) {
            if (valueEnd) {
                containerEnd.val(valueEnd.format('yyyy-mm-dd'));
            } else {
                containerEnd.val('');
            }

            makeMessage('End date cannot be before than start date.', 'error', {});

            containerEnd.closest('.control-group').addClass('error');
        } else if (
            (event.date.format('yyyy-mm-dd') < dateMin.format('yyyy-mm-dd'))
                || (event.date.format('yyyy-mm-dd') > dateMax.format('yyyy-mm-dd'))
            ) {
            makeMessage('End date conflicts with project duration. End date must be between ' + dateMin.format('yyyy-mm-dd') + ' and ' + dateMax.format('yyyy-mm-dd')  + '.', 'error', {});

            containerStart.closest('.control-group').addClass('error');
        } else if (checkSprintDates(event.date, 1, sprintId, true) !== true) {
            containerStart.closest('.control-group').addClass('error');
        } else {
            valueEnd = new Date(event.date);

            containerEnd.bootstrapDP('hide');
            containerEnd.closest('.control-group').removeClass('error');
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

    jQuery('textarea', modal).autosize();
}

/**
 * Method checks if given sprint date conflicts with existing project sprint durations.
 *
 * @param   {Date}      date        Date object to check
 * @param   {Number}    type        Date type, 0 = start, 1 = end
 * @param   {Number}    sprintId    Current sprint ID, this is skipped in test if give ( > 0 )
 * @param   {Boolean}   showMessage Return possible error message
 *
 * @returns {Boolean|String}        Boolean true if ok, otherwise error message
 */
function checkSprintDates(date, type, sprintId, showMessage) {
    var check = date.format('yyyy-mm-dd');
    var errors = [];

    jQuery.each(myViewModel.sprints(), function(key, sprint) {
        var start = ko.toJS(sprint.dateStartObject()).format('yyyy-mm-dd');
        var end = ko.toJS(sprint.dateEndObject()).format('yyyy-mm-dd');

        if (sprintId != ko.toJS(sprint.id()) && start <= check && end >= check) {
            errors.push(ko.toJS(sprint.formattedTitle()));
        }
    });

    var output = true;

    if (errors.length > 0) {
        var message = type === 0 ? "Start " : "End ";

        message += "date overlaps with following existing project sprints:\n" + errors.join("\n");

        if (showMessage) {
            makeMessage(message, 'error', {});
        }

        output = message;
    }

    return output;
}