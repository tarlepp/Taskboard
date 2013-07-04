/**
 * Generic form validation function. Usage as below:
 *
 * if (validateForm(jQuery('#yourForm').serializeJSON())) {
 *     // Form is valid
 * } else {
 *     // Form is not valid
 * }
 *
 * @param   {jQuery[]}  items
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
            group.addClass('error');
            input.focus();

            required.push(label);

            valid = false;
        } else if (method && dispatch(method, [input, group, label, value, errors]) !== true) {
            group.addClass('error');
            input.focus();

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

    if ((role == 'start' && dateSelf.valueOf() > datePair.valueOf())
        || (role == 'end' && dateSelf.valueOf() < datePair.valueOf())
    ) {
        errors.push("Invalid date range.");

        return false;
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
    var match = dateText.toString().match(/^(\d{4})([-\.\/])(\d{2})\2(\d{2})$/);

    if (match === null) {
        return false;
    }

    var date = new Date(+match[1], +match[3] - 1, +match[4]);

    return date.getFullYear() == +match[1] && date.getMonth() == +match[3] - 1 && date.getDate() == +match[4];
}