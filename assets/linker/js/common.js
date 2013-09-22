jQuery(document).ready(function() {
    // Bootstrap date picker fix with jQuery UI component
    jQuery.fn.bootstrapDP = jQuery.fn.datepicker.noConflict();

    /**
     * jQuery function to serialize forms to JSON objects. Usage example:
     *
     * console.log(jQuery('#yourForm').serializeJSON());
     *
     * @returns {{}}
     */
    jQuery.fn.serializeJSON = function() {
        var json = {};

        jQuery.map(jQuery(this).serializeArray(), function(n) {
            var _ = n.name.indexOf('[');

            if (_ > -1) {
                var o = json, _name;

                _name = n.name.replace(/\]/gi, '').split('[');
                for (var i = 0, len = _name.length; i < len; i++) {
                    if (i == len - 1) {
                        if (o[_name[i]]) {
                            if (typeof o[_name[i]] == 'string') {
                                o[_name[i]] = [o[_name[i]]];
                            }
                            o[_name[i]].push(n.value);
                        } else {
                            o[_name[i]] = n.value || '';
                        }
                    } else {
                        o = o[_name[i]] = o[_name[i]] || {};
                    }
                }
            } else {
                if (json[n.name] !== undefined) {
                    if (!json[n.name].push) {
                        json[n.name] = [json[n.name]];
                    }

                    json[n.name].push(n.value || '');
                } else {
                    json[n.name] = n.value || '';
                }
            }
        });

        return json;
    };

    /**
     * Generic html element type getter.
     *
     * @returns {string}
     */
    jQuery.fn.getType = function() {
        return this[0].tagName == "INPUT" ? jQuery(this[0]).attr("type").toLowerCase() : this[0].tagName.toLowerCase();
    };

    // Global tooltip event
    initTooltips(jQuery(document));
});

/**
 * Function initializes default "static" tooltips for specified context.
 *
 * @param   {jQuery}    context
 */
function initTooltips(context) {
    // Hide all existing tooltips
    jQuery(".qtip.qtip-bootstrap").qtip("hide");

    context.on('mouseover', '.tooltipDiv', function() {
        createQtipDiv(jQuery(this));
    });

    context.on('mouseover', '.tooltipTitle', function() {
        createQtipTitle(jQuery(this));
    });
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
        /**
         * Parse sails error message to real JSON object.
         *
         * todo: remove replace when sails.js is fixed https://github.com/balderdashy/sails/issues/826
         *
         * @type {sails.error.validation}
         */
        var object = JSON5.parse(errorObject.message.replace("[ [Object] ]", "[]"));

        if (object.ValidationError) {
            var columns = [];

            jQuery.each(object.ValidationError, function(column, errors) {
                if (_.size(errors) > 0) {
                    var rules = [];

                    jQuery.each(errors, function(i, error) {
                        rules.push(error.rule);
                    });

                    columns.push("\n" + column + ": " + rules.join(", "));
                } else {
                    columns.push(column);
                }

                message += "Validation errors with column: " + columns.join(", ");
            });
        }
    } catch (exception) {
        message = errorObject;
    }

    return message;
}

/**
 * Generic AJAX error handler.
 *
 * @param   {XMLHttpRequest}    jqXhr
 * @param   {String}            textStatus
 * @param   {String}            error
 */
function handleAjaxError(jqXhr, textStatus, error) {
    var message = '';
    var errorMessage = '';

    try {
        var errorInfo = jQuery.parseJSON(jqXhr.responseText);

        if (errorInfo.errors[0].message) {
            errorMessage = parseSailsError(errorInfo.errors[0]);
        }
    } catch (exception) {
        errorMessage = jqXhr.responseText;
    }

    if (jqXhr.status === 0) {
        message = 'Not connect. Verify Network.' + errorMessage;
    } else if (jqXhr.status == 403) {
        message = 'Forbidden [403]. ' + errorMessage;
    } else if (jqXhr.status == 404) {
        message = 'Requested page not found [404].' + errorMessage;
    } else if (jqXhr.status == 500) {
        message = 'Internal Server Error [500].' + errorMessage;
    } else if (textStatus === 'parsererror') {
        message = 'Requested JSON parse failed.';
    } else if (textStatus === 'timeout') {
        message = 'Time out error.';
    } else if (textStatus === 'abort') {
        message = 'Ajax request aborted.';
    } else {
        message = 'Uncaught Error.\n' + jqXhr.responseText + textStatus + ', ' + error;
    }

    makeMessage(message, 'error', {});
}

/**
 * Function to trigger noty message.
 *
 * @param   {string}    text    Message to show
 * @param   {string}    type    Type of message
 * @param   {object}    options Custom options for noty
 */
function makeMessage(text, type, options) {
    options = options || {};

    var timeout = 3000;

    switch (type) {
        case 'success':
            timeout = 1500;
    }

    noty(jQuery.extend({}, {
        text: text.nl2br(),
        type: type,
        layout: 'top',
        timeout: timeout
    }, options));
}

/**
 * Generic javascript "job" dispatcher.
 *
 * @returns {*}
 */
function dispatch(fn, args) {
    // Allow fn to be a function object or the name of a global function
    fn = (typeof fn == "function") ? fn : window[fn];

    // args is optional, use an empty array by default
    return fn.apply(this, args || []);
}

/**
 * Function creates a Bootbox modal dialog with specified title, content and buttons.
 *
 * @param   {string}                    title   Modal title
 * @param   {string}                    content Modal content as html
 * @param   {object|array|null}         buttons Button(s) to add dialog
 * @param   {undefined|string|boolean}  trigger Possible body trigger event on close
 *
 * @returns {*}
 */
function createBootboxDialog(title, content, buttons, trigger) {
    trigger = trigger || false;

    var buttonsToShow = [];

    // Every dialog has close button.
    buttonsToShow.push({
        label: "Close",
        className: "btn-default pull-left",
        callback: function() {
            handleEventTrigger(trigger);
        }
    });

    // We have multiple buttons
    if (buttons instanceof Array) {
        jQuery.each(buttons, function(index, button) {
            buttonsToShow.push(button);
        });
    } else if (buttons !== null) { // Just one button to add
        buttonsToShow.push(buttons);
    }

    // Create bootbox modal
    var modal = bootbox.dialog({
        message: content,
        title: title,
        buttons: buttonsToShow,
        show: false,
        onEscape: function() {
            modal.modal('hide');
        }
    });

    // Generic modal init
    modal.on('shown.bs.modal', function() {
        initWysiwyg(modal);     // Initialize wysiwyg for textareas
        initSelect(modal);      // Initialize select list
        initTooltips(modal);    // Initialize possible modal context tooltips
        initDropdown(modal);    // Initialize dropdown menus
        initTabs(modal);        // Initialize tabs
        initActionMenu(modal);  // Initialize custom action menus
    });

    // Return bootbox dialog
    return modal;
}

/**
 * Function initializes bootstrap look-a-like select list in specified content.
 * Basically this just changes basic <select> to <div>.
 *
 * @param   {jQuery}    context
 */
function initSelect(context) {
    jQuery('select[data-select]', context).each(function() {
        jQuery(this).selectpicker({
            container: 'body'
        });
    });
}

/**
 * Function initializes dropdown menu hover actions in specified content.
 *
 * @param   {jQuery}    context
 */
function initDropdown(context) {
    jQuery('[data-hover="dropdown"]', context).dropdownHover();
}

/**
 * Function initializes dynamic data load for bootstrap tabs in specified content.
 *
 * @param   {jQuery}    context
 */
function initTabs(context) {
    // Dynamic data loading for tab content
    jQuery('a[data-toggle="tab"]', context).on('show.bs.tab', function(event) {
        var element = jQuery(event.target);

        var contentId = element.attr("href");
        var contentUrl = element.data("href");
        var callback = element.data("callback");

        // We have url defined, so fetch tab content via AJAX call.
        if (contentUrl) {
            // Load data content
            jQuery(contentId).load(contentUrl, function() {
                // Dispatch callback function with default parameters
                if (typeof callback !== 'undefined') {
                    dispatch(callback, [context, contentId]);
                }
            });
        } else if (typeof callback !== 'undefined') { // Dispatch callback function with default parameters
            dispatch(callback, [context, contentId]);
        }
    });
}

/**
 * Function initialize action menus for specified context.
 *
 * @todo    explain this better, this is like magic :D
 *
 * @param   {jQuery}    context
 * @param   {{}}        parameters
 */
function initActionMenu(context, parameters) {
    parameters = parameters || {};

    var body = jQuery('body');

    // Remove all action menu listeners, this prevents firing events to multiple listeners
    body.off('click', 'ul.actionMenu-actions a');

    // Specify popover content mouse over JavaScript functions, this is like magic :D
    var mouseOver = "clearTimeout(timeoutObj); " +
        " jQuery(this).on('mouseleave', function() { jQuery(selector).popover('hide'); });" +
        " jQuery(this).on('click', 'a', function() { jQuery(this).data('selector', selector); }); ";

    // Used default parameters for popover
    var defaultParameters = {
        container: 'body',
        trigger: 'manual',
        placement: 'bottomLeftFixed',
        animation: false,
        html: true,
        template:
            '<div class="popover actionMenu" onmouseover="' + mouseOver + '">' +
                '<div class="arrow"></div>' +
                '<h3 class="popover-title"></h3>' +
                '<div class="popover-content"></div>' +
            '</div>'
    };

    // Iterate each actionMenu-toggle selectors
    context.find('.actionMenu-toggle').each(function(event) {
        var element = jQuery(this);

        // Create popover
        element.popover(jQuery.extend(
            {},
            defaultParameters,
            {
                content: function() {
                    return element.next('div').html();
                }
            },
            parameters
        )).on('mouseenter', function(event) {
            // Create global selector string, which is used in actual popover content
            selector = element.getSelector().join(" ");

            element.popover('show');
        }).on('mouseleave', function(event) {
            // Create global timeout for popover hide, note that this is used in actual popover content
            timeoutObj = setTimeout(function(){
                element.popover('hide');
            }, 100);
        }).on('click', function(event) {
            if (body.find('.popover.actionMenu').length === 0) {
                element.popover('show');
            } else {
                element.popover('hide');
            }
        });
    });
}

/**
 * Function initializes wysiwyg editor for text areas in specified content.
 * Note that function just hides real input and replaces it with wysiwyg
 * component.
 *
 * @param   {jQuery}    context
 */
function initWysiwyg(context) {
    var textarea = jQuery('[data-wysiwyg]', context);

    // Textarea founded
    if (textarea.length === 1) {
        textarea.hide();

        // Determine textarea id, which we are used in wysiwyg
        var textareaId = textarea.prop("id") + "wysiwyg";

        // Make valid JSON string for qTip options.
        var qtipopts = '{ "position": { "at": "top center", "my": "bottom center" } }';

        // Actual editor HTML content
        var editor = jQuery(''
            + '<div>'
                + '<div class="btn-toolbar" data-role="editor-toolbar" data-target="#' + textareaId + '">'
                    + '<div class="btn-group">'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="bold" title="Bold (Ctrl/Cmd+B)"><i class="icon-bold"></i></button>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="italic" title="Italic (Ctrl/Cmd+I)"><i class="icon-italic"></i></button>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="strikethrough" title="Strikethrough"><i class="icon-strikethrough"></i></button>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="underline" title="Underline (Ctrl/Cmd+U)"><i class="icon-underline"></i></button>'
                    + '</div>'
                    + '<div class="btn-group">'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="insertunorderedlist" title="Bullet list"><i class="icon-list-ul"></i></button>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="insertorderedlist" title="Number list"><i class="icon-list-ol"></i></button>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="outdent" title="Reduce indent (Shift+Tab)"><i class="icon-indent-left"></i></button>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="indent" title="Indent (Tab)"><i class="icon-indent-right"></i></button>'
                    + '</div>'
                    + '<div class="btn-group">'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="justifyleft" title="Align Left (Ctrl/Cmd+L)"><i class="icon-align-left"></i></button>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="justifycenter" title="Center (Ctrl/Cmd+E)"><i class="icon-align-center"></i></button>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="justifyright" title="Align Right (Ctrl/Cmd+R)"><i class="icon-align-right"></i></button>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="justifyfull" title="Justify (Ctrl/Cmd+J)"><i class="icon-align-justify"></i></button>'
                    + '</div>'
                    + '<div class="btn-group">'
                        + '<div class="btn-group">'
                            + '<button type="button" class="btn btn-default btn-editor tooltipTitle dropdown-toggle" data-toggle="dropdown" data-qtip-options=\'' + qtipopts + '\' title="Hyperlink"><i class="icon-link"></i></button>'
                            + '<div class="dropdown-menu col-md-6">'
                                + '<div class="input-group">'
                                    + '<input class="form-control" placeholder="URL" type="text" data-edit="createLink"/>'
                                    + '<span class="input-group-btn">'
                                        + '<button class="btn btn-default" type="button">Add</button>'
                                    + '</span>'
                                + '</div>'
                            + '</div>'
                        + '</div>'
                        + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-edit="unlink" data-qtip-options=\'' + qtipopts + '\' title="Remove Hyperlink"><i class="icon-cut"></i></button>'
                    + '</div>'
                + '</div>'
                + '<div id="' + textareaId + '" class="editor"></div>'
            + '</div>'
        );

        // Set content
        editor.find('#' + textareaId).html(textarea.val());

        // Append editor to gui
        jQuery(editor).appendTo(textarea.parent());

        // Trigger wysiwyg
        editor.find('#' + textareaId).wysiwyg();

        // Update actual textarea value on focus out event
        editor.on('focusout', function() {
            textarea.val(editor.find('#' + textareaId).cleanHtml());
        });
    }
}

/**
 * Function to set specified cookie and value for given days.
 *
 * @param   {string}        name    Name of the cookie
 * @param   {string|number} value   Cookie value
 * @param   {number}        days    How many days cookie is valid
 */
function createCookie(name, value, days) {
    var expires = "";

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        expires = "; expires=" + date.toGMTString();
    }

    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

/**
 * Function to read specified cookie.
 *
 * @param   {string}    name     Name of the cookie
 *
 * @returns {*}
 */
function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) == 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }

    return null;
}

/**
 * Function to erase specified cookie.
 *
 * @param   {string}    name     Name of the cookie
 */
function eraseCookie(name) {
    createCookie(name, "", -1);
}

/**
 * Function makes qTip2 tooltip for specified element. Note that this tooltip can contain
 * desired HTML structure which is shown as tooltip.
 *
 * Below is example HTML structure of usage:
 *
 *  <icon class="icon icon-help tooltipDiv">
 *      <div class="tooltipDivContainer">
 *          <h1>Tooltip title</h1>
 *          <div>
 *              Your <em>tooltip</em> content <strong>here</strong>
 *          </div>
 *      </div>
 *  </icon>
 *
 *  And in your CSS definitions add following:
 *
 *  .tooltipDivContainer {
 *      display: none;
 *  }
 *
 * @param   {jQuery}    element
 */
function createQtipDiv(element) {
    var title = element.find('.tooltipDivContainer h1').clone().html();
    var content = element.find('.tooltipDivContainer div').clone();

    createQtip(element, title, content, 'auto', 'top left', 'bottom center', true, 100);
}

/**
 * Function makes simple qTip2 tooltip for specified element.
 *
 * Below is example HTML structure of usage:
 *
 *  <a href="#" class="tooltipTitle" title="Your tooltip here">click me</a>
 *
 * @param   {jQuery}    element
 */
function createQtipTitle(element) {
    var title = '';
    var content = element.attr('title');

    createQtip(element, title, content, 'auto', 'top left', 'bottom center', false, 50);
}

/**
 * Function creates actual qTip2 for specified element.
 *
 * @param   {jQuery}        element
 * @param   {string}        tipTitle
 * @param   {string}        tipText
 * @param   {string|number} tipWidth
 * @param   {string}        tipMy
 * @param   {string}        tipAt
 * @param   {boolean}       tipFixed
 * @param   {number}        tipDelay
 */
function createQtip(element, tipTitle, tipText, tipWidth, tipMy, tipAt, tipFixed, tipDelay) {
    element.qtip({
        metadata: {
            type: 'html5',      // Use HTML5 data-* attributes
            name: 'qtipOptions'    // Grab the metadata from the data-qtip-options HTML5 attribute
        },
        content: {
            title: tipTitle,
            text: tipText
        },
        style: {
            tip: {
                corner: true
            },
            classes: 'qtip-bootstrap',
            width: tipWidth
        },
        show: {
            ready: true,
            solo: true,
            delay: 40
        },
        hide: {
            fixed: tipFixed,
            delay: tipDelay,
            effect: false
        },
        position: {
            my: tipMy,
            at: tipAt,
            viewport: jQuery(window),
            container: jQuery('body')
        }
    });
}

/**
 * Function to handle event trigger. Note that this will need some work later on
 * with more complicated cases of real usage.
 *
 * @param   {String|sails.helper.trigger|void}  trigger
 */
function handleEventTrigger(trigger) {
    if (trigger) {
        if (_.isObject(trigger) && typeof trigger.trigger !== "undefined") {
            var parameters = trigger.parameters || [];

            jQuery("body").trigger(trigger.trigger, parameters);
        } else {
            jQuery("body").trigger(trigger);
        }
    }
}

/**
 * Function handles possible socket error.
 *
 * @param   {
 *          sails.error.socket|
 *          sails.json.phase|
 *          sails.json.project|
 *          sails.json.sprint|
 *          sails.json.task
 *          }                       error
 * @param   {Boolean}               [showMessage]
 */
function handleSocketError(error, showMessage) {
    showMessage = showMessage || true;

    if (error.errors && error.status) {
        if (showMessage) {
            var message = '';

            _.each(error.errors, function(error) {
                message += parseSailsError(error);
            });

            makeMessage(message, 'error', {});
        }

        return false;
    } else {
        return true;
    }
}

/**
 * Method converts UTC date object to local date object
 *
 * @param   {Date}  date
 *
 * @returns {Date}
 */
function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime());
    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
}