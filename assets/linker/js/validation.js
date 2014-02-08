/**
 * Generic form validation function. Usage as below:
 *
 * if (validateForm(jQuery('#yourForm').serializeJSON())) {
 *     // Form is valid
 * } else {
 *     // Form is not valid
 * }
 *
 * @param   {{}}        items
 * @param   {jQuery}    context
 *
 * @returns {boolean}
 */
function validateForm(items, context) {
    var valid = true;
    var errors = [];
    var required = [];
    var focusSet = false;

    if (jQuery.isEmptyObject(items)) {
        valid = false;

        errors.push("No form items to validate.");
    }

    // Iterate each form item
    jQuery.each(items, function(key, item) {
        checkItems(key, item);
    });

    /**
     * Private function to check form items, this is called recursive if input items
     * has objects in it values.
     *
     * @param   {String}                key
     * @param   {Object|String|Number}  item
     */
    function checkItems(key, item) {
        // We have multiple parameters
        if (item != null && typeof item === "object") {
            // Iterate each items and make necessary checks
            _.each(item, function(_item, _key) {
                checkItems(key +"[" + _key + "]", _item);
            });
        } else {
            var input = jQuery('#' + key.replace(":", ""), context);

            if (input.length === 0) {
                input = jQuery("[name='"+ key +"']", context);
            }

            if (input.getType() == 'div') {
                input = input.find('input');
            }

            var group = input.closest('.form-group');
            var label = group.find('label').html();
            var value = jQuery.trim(input.val());
            var type = input.data('validateType');
            var method = null;
            var types = [];
            var inputHasError = false;

            if (type) {
                types = type.split(",");
            }

            if ((input.prop('required') && value == '')
                || (input.getType() == 'select' && value == '#')
                ) {
                if (label.length > 0) {
                    required.push(label);
                }

                group.addClass('has-error');

                if (focusSet === false && input.data('focus') !== false) {
                    focusSet = true;
                    input.focus();
                }

                inputHasError = true;
                valid = false;
            } else {
                group.removeClass('has-error')
            }

            _.each(types, function(type) {
                switch (type) {
                    case 'date':
                        method = 'validateDate';
                        break;
                    case 'daterange':
                        method = 'validateDateRange';
                        break;
                    case 'password':
                        method = "validatePassword";
                        break;
                    case 'unique':
                        method = "validateUnique";
                        break;
                    case 'email':
                        method = "validateEmail";
                        break;
                    case 'url':
                        method = "validateUrl";
                        break;
                    case "length":
                        method = "validateLength";
                        break;
                    case "passwordCurrent":
                        method = "validateCurrentPassword";
                        break;
                    default:
                        throw new Error("Implement '" + type + "' validation!");
                        break;
                }

                if (!inputHasError && method && dispatch(method, [context, input, group, label, value, errors]) !== true) {
                    group.addClass('has-error');

                    if (focusSet === false && input.data('focus') !== false) {
                        focusSet = true;
                        input.focus();
                    }

                    inputHasError = true;
                    valid = false;
                }
            });
        }
    }

    // Form is not valid
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
 * @param   {jQuery}    context Current context
 * @param   {jQuery}    input   Current input field
 * @param   {jQuery}    group   Input control group
 * @param   {String}    label   Input label as a text
 * @param   {String}    date    Actual text (date) from input (yyyy-mm-dd)
 * @param   {Array}     errors  Array of current errors
 *
 * @returns {boolean}
 */
function validateDate(context, input, group, label, date, errors) {
    if (date.length === 0) {
        return true;
    } else if (!checkDate(date)) {
        return false;
    }

    // Date type is project, so make sure that date is between project start and end date.
    if (input.data('type') === 'project') {
        var dateBits = date.split('-');
        var dateObject = new Date(+dateBits[0], +dateBits[1] - 1, +dateBits[2]);
        var message = checkProjectDates(dateObject, false);

        // Oh, date conflicts with project start and end dates
        if (message !== true) {
            errors.push(message);

            return false;
        }
    }

    return true;
}

/**
 * Method validates date range inputs.
 *
 * @todo    How to avoid double check?
 *
 * @param   {jQuery}    context Current context
 * @param   {jQuery}    input   Current input field
 * @param   {jQuery}    group   Input control group
 * @param   {String}    label   Input label as a text
 * @param   {String}    date    Actual text (date) from input (yyyy-mm-dd)
 * @param   {Array}     errors  Array of current errors
 *
 * @returns {boolean}
 */
function validateDateRange(context, input, group, label, date, errors) {
    var role = input.data('role');
    var edit = input.data('edit');
    var type = input.data('type');
    var pair = jQuery('#' + input.data('pair'), context).val();
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

    var dateSelf = moment(
        new Date(
            Date.UTC(
                dateBitsSelf[0],
                dateBitsSelf[1] - 1,
                dateBitsSelf[2],
                0,
                0,
                0
            )
        )
    ).tz("Etc/Universal");

    var datePair = moment(
        new Date(
            Date.UTC(
                dateBitsPair[0],
                dateBitsPair[1] - 1,
                dateBitsPair[2],
                0,
                0,
                0
            )
        )
    ).tz("Etc/Universal");

    if ((role == 'start' && dateSelf > datePair) || (role == 'end' && dateSelf < datePair)) {
        errors.push("Invalid date range.");

        return false;
    }

    if (type == 'project' && edit) {
        var dateMin = null;
        var dateMax = null;

        if (myViewModel.sprints().length > 0) {
            var sprintFirst = _.min(myViewModel.sprints(), function(sprint) { return sprint.dateStartObject(); } );
            var sprintLast = _.max(myViewModel.sprints(), function(sprint) { return sprint.dateEndObject(); } );

            dateMin = sprintFirst.dateStartObject();
            dateMax = sprintLast.dateEndObject();
        }

        if (role == 'start' && dateMin && dateSelf > dateMin) {
            errors.push('Start date overlaps with project sprints. Start date cannot be before ' + dateMin.format(myViewModel.user().momentFormatDate()) + '.');

            return false;
        } else if (role == 'end' && dateMax && dateSelf < dateMax) {
            errors.push('End date overlaps with project sprints. End date must be at least ' + dateMax.format(myViewModel.user().momentFormatDate()) + '.');

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
 * Method validates that given passwords are same
 *
 * @todo    How to avoid double check?
 *
 * @param   {jQuery}    context     Current context
 * @param   {jQuery}    input       Current input field
 * @param   {jQuery}    group       Input control group
 * @param   {String}    label       Input label as a text
 * @param   {String}    password    Password value
 * @param   {Array}     errors      Array of current errors
 *
 * @returns {boolean}
 */
function validatePassword(context, input, group, label, password, errors) {
    var pairValue = jQuery('#' + input.data("pair"), context).val();

    if (password !== pairValue) {
        errors.push("Given passwords don't match.");

        return false;
    }

    return true;
}

/**
 * Method validates that given value is unique for specified model
 *
 * @todo    How to avoid double check?
 *
 * @param   {jQuery}    context     Current context
 * @param   {jQuery}    input       Current input field
 * @param   {jQuery}    group       Input control group
 * @param   {String}    label       Input label as a text
 * @param   {String}    value       Value to be checked
 * @param   {Array}     errors      Array of current errors
 *
 * @returns {boolean}
 */
function validateUnique(context, input, group, label, value, errors) {
    var model = input.data("model");
    var search = {};

    search[input.attr("name")] = value;

    var id = input.data("id");

    // Make AJAX call to
    var response = jQuery.ajax({
        async: false,
        type: "GET",
        dataType: "json",
        url: "/Validator/isUnique",
        data: {
            model: model,
            search: search,
            id: id
        }
    }).responseText;

    if (response !== "true") {
        errors.push("Given '" + label + "' value is not unique.");
    }

    return (response === "true");
}

/**
 * Method validates email input.
 *
 * @param   {jQuery}    context Current context
 * @param   {jQuery}    input   Current input field
 * @param   {jQuery}    group   Input control group
 * @param   {String}    label   Input label as a text
 * @param   {String}    email   Actual email address value from input
 * @param   {Array}     errors  Array of current errors
 *
 * @returns {boolean}
 */
function validateEmail(context, input, group, label, email, errors) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Oh nou, not valid email address
    if (!re.test(email)) {
        errors.push("Invalid email address.");

        return false;
    }

    return true;
}

/**
 * Method validates url input.
 *
 * @param   {jQuery}    context Current context
 * @param   {jQuery}    input   Current input field
 * @param   {jQuery}    group   Input control group
 * @param   {String}    label   Input label as a text
 * @param   {String}    url     Actual url address value from input
 * @param   {Array}     errors  Array of current errors
 *
 * @returns {boolean}
 */
function validateUrl(context, input, group, label, url, errors) {
    var re = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    // Oh nou, not valid URL address
    if (!re.test(url)) {
        errors.push("Invalid URL address.");

        return false;
    }

    return true;
}

/**
 * Method validates input min / max length.
 *
 * @param   {jQuery}    context Current context
 * @param   {jQuery}    input   Current input field
 * @param   {jQuery}    group   Input control group
 * @param   {String}    label   Input label as a text
 * @param   {String}    value   Actual email address value from input
 * @param   {Array}     errors  Array of current errors
 *
 * @returns {boolean}
 */
function validateLength(context, input, group, label, value, errors) {
    var minLength = input.data("lengthMin");
    var maxLength = input.data("lengthMax");

    if (minLength && maxLength) {
        if (!(value.length >= minLength && value.length <= maxLength)) {
            errors.push(label + " must be at least " + minLength + " and at most " + maxLength + " chars long.");

            return false;
        }
    } else if (minLength) {
        if (!(value.length >= minLength)) {
            errors.push(label + " must be at least " + minLength + " chars long.");

            return false;
        }
    } else if (maxLength) {
        if (!(value.length <= maxLength)) {
            errors.push(label + " must be at most " + maxLength + " chars long.");

            return false;
        }
    } else {
        throw new Error("No required length(s) defined.");
    }

    return true;
}

/**
 * Method validates current user password.
 *
 * @param   {jQuery}    context Current context
 * @param   {jQuery}    input   Current input field
 * @param   {jQuery}    group   Input control group
 * @param   {String}    label   Input label as a text
 * @param   {String}    value   Actual email address value from input
 * @param   {Array}     errors  Array of current errors
 *
 * @returns {boolean}
 */
function validateCurrentPassword(context, input, group, label, value, errors) {
    var userId = parseInt(input.data("userId"), 10);

    // Make AJAX call to validate given password with specified user
    var response = jQuery.ajax({
        async: false,
        type: "GET",
        dataType: "json",
        url: "/Validator/passwordCheck",
        data: {
            password: value,
            userId: userId
        }
    }).responseText;

    if (response !== "true") {
        errors.push("Given current password value doesn't match.");
    }

    return (response === "true");
}

/**
 * Generic date string checker function.
 *
 * @param   {String}    dateText    Date must be in yyyy-mm-dd or yyyy.mm.dd format
 *
 * @returns {Boolean}
 */
function checkDate(dateText) {
    if (typeof(dateText) == 'undefined') {
        return false;
    } else if (dateText.length === 0) {
        return true;
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
 * @param   {moment}    date        Moment.js date object to check
 * @param   {Number}    type        Date type, 0 = start, 1 = end
 * @param   {Number}    sprintId    Current sprint ID, this is skipped in test if give ( > 0 )
 * @param   {Boolean}   showMessage Return possible error message
 *
 * @returns {Boolean|String}        Boolean true if ok, otherwise error message
 */
function checkSprintDates(date, type, sprintId, showMessage) {
    var errors = [];
    var output = true;

    // Iterate current sprints
    jQuery.each(myViewModel.sprints(), function(key, sprint) {
        var start = sprint.dateStartObject();
        var end = sprint.dateEndObject();

        if (sprintId !== sprint.id() && start <= date && end >= date) {
            errors.push(ko.toJS(sprint.formattedTitle()));
        }
    });

    // Errors found...
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

/**
 * Function checks that given date is valid for current project.
 *
 * @param   {moment}    date        Date as in moment is object to check
 * @param   {Boolean}   showMessage Make possible error message
 *
 * @returns {Boolean|String}        Boolean true if ok, otherwise error message.
 */
function checkProjectDates(date, showMessage) {
    var dateMin = myViewModel.project().dateStartObject();
    var dateMax = myViewModel.project().dateEndObject();

    // Date conflicts with project duration
    if (date < dateMin || date > dateMax) {
        var message = 'Given date conflicts with project duration. Date must be between ' + dateMin.format(myViewModel.user().momentFormatDate()) + ' and ' + dateMax.format(myViewModel.user().momentFormatDate())  + '.';

        if (showMessage) {
            makeMessage(message, 'error', {});
        }

        return message;
    }

    return true;
}