/**
 * /assets/linker/js/errors.js
 *
 * @file Error handling javascript functions that Taskboard application uses.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */

/**
 * Function handles possible socket error. This function is called after
 * any socket calls in application to make sure that all is ok.
 *
 * @param   {
 *          sails.error.socket|
 *          sails.json.type|
 *          sails.json.user|
 *          sails.json.phase|
 *          sails.json.milestone|
 *          sails.json.project|
 *          sails.json.sprint|
 *          sails.json.story|
 *          sails.json.task|
 *          sails.json.projectUser|
 *          sails.json.comment|
 *          sails.json.externalLink|
 *          sails.json.link
 *          }                       error
 * @param   {Boolean}               [showMessage]
 */
function handleSocketError(error, showMessage) {
    showMessage = showMessage || true;

    // We have an error!
    if (error && ((error.status && error.status !== 200) || (error.errors && error.status))) {
        if (showMessage) {
            var message = "";

            _.each(error.errors, function(error) {
                message += parseSailsError(error);
            });

            if (message.length === 0) {
                if (error.message) {
                    message = (error.message.message) ? error.message.message : error.message;
                    message += " [" + error.status + "]";
                } else if (error.status == 404) {
                    message = "Requested page not found [404].";
                } else if (error.status == 500) {
                    message = "Internal Server Error [500].";
                } else {
                    message = "Unknown error occured."
                }
            }

            makeMessage(message, 'error', {});
        }

        return false;
    } else {
        return true;
    }
}

/**
 * Generic AJAX error handler. This is used to handle every AJAX error in Taskboard application.
 *
 * @param   {XMLHttpRequest}    jqXhr
 * @param   {String}            textStatus
 * @param   {String}            error
 * @param   {Boolean}           [returnMessage]
 */
function handleAjaxError(jqXhr, textStatus, error, returnMessage) {
    returnMessage = returnMessage || false;

    var message = "";
    var errorMessage = "";

    try {
        var errorInfo = jQuery.parseJSON(jqXhr.responseText);

        if (errorInfo.errors[0].message) {
            errorMessage = parseSailsError(errorInfo.errors[0]);
        }
    } catch (exception) {
        errorMessage = jqXhr.responseText;
    }

    if (jqXhr.responseJSON && jqXhr.responseJSON.status && jqXhr.responseJSON.message) {
        message = jqXhr.responseJSON.message;
    } else if (jqXhr.status === 0) {
        message = "Not connect. Verify Network. " + errorMessage;
    } else if (jqXhr.status == 403) {
        message = "Forbidden [403]. " + errorMessage;
    } else if (jqXhr.status == 404) {
        message = "Requested page not found [404]. " + errorMessage;
    } else if (jqXhr.status == 500) {
        message = "Internal Server Error [500]. " + errorMessage;
    } else if (textStatus === "parsererror") {
        message = "Requested JSON parse failed.";
    } else if (textStatus === "timeout") {
        message = "Time out error.";
    } else if (textStatus === "abort") {
        message = "Ajax request aborted.";
    } else {
        message = "Uncaught Error.\n" + jqXhr.responseText + textStatus + ", " + error;
    }

    makeMessage(message, "error");

    return returnMessage ? message : "";
}

/**
 * Method parses sails.js error object to human readable format.
 *
 * @param   {sails.error.generic}   errorObject
 *
 * @returns {string}
 */
function parseSailsError(errorObject) {
    var message = "";

    try {
        if (errorObject.ValidationError) {
            var columns = [];

            _.each(errorObject.ValidationError, function(errors, column) {
                if (_.size(errors) > 0) {
                    var rules = [];

                    _.each(errors, function(error) {
                        rules.push(error.message);
                    });

                    columns.push("\n" + column + ": " + rules.join(", "));
                } else {
                    columns.push(column);
                }
            });

            message += "Following validation errors occurred: " + columns.join("");
        }
    } catch (exception) {
        message = errorObject;
    }

    return message;
}