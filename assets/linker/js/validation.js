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

        var group = input.closest('.form-group');
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

            group.addClass('has-error');

            if (input.data('focus') !== false) {
                input.focus();
            }

            valid = false;
        } else if (method && dispatch(method, [input, group, label, value, errors]) !== true) {
            group.addClass('has-error');

            if (input.data('focus') !== false) {
                input.focus();
            }

            valid = false;
        } else {
            group.removeClass('has-error')
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

        makeMessage(message, 'error', {});
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

        message += "date overlaps with following existing project sprint:\n" + errors.join("\n");

        if (showMessage) {
            makeMessage(message, 'error', {});
        }

        output = message;
    }

    return output;
}