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
    var pair = jQuery('#' + input.data('pair')).val();
    var message = "";

    console.log(edit);

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

    if (edit) {
        var dateMin = new Date(myViewModel.project().sprintDateMin());
        var dateMax = new Date(myViewModel.project().sprintDateMax());

        if (role == 'start' && dateSelf.format('yyyy-mm-dd') > dateMin.format('yyyy-mm-dd')) {
            errors.push('Start date overlaps with project sprints. Start date cannot be before ' + dateMin.format('yyyy-mm-dd') + '.');

            return false;
        } else if (role == 'end' && dateSelf.format('yyyy-mm-dd') < dateMax.format('yyyy-mm-dd')) {
            errors.push('End date overlaps with project sprints. End date must be at least ' + dateMax.format('yyyy-mm-dd') + '.');

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