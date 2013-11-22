/**
 * /assets/linker/js/inits.js
 *
 * @file Global and bootstrap modal init functions.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */

/**
 * Function initializes wysiwyg editor for text areas in specified content.
 * Note that function just hides real input and replaces it with wysiwyg
 * component.
 *
 * @param   {jQuery|$}  context
 */
function initWysiwyg(context) {
    var textarea = jQuery("[data-wysiwyg]", context);

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
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="bold" title="Bold (Ctrl/Cmd+B)"><i class="fa fa-bold"></i></button>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="italic" title="Italic (Ctrl/Cmd+I)"><i class="fa fa-italic"></i></button>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="strikethrough" title="Strikethrough"><i class="fa fa-strikethrough"></i></button>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="underline" title="Underline (Ctrl/Cmd+U)"><i class="fa fa-underline"></i></button>'
            + '</div>'
            + '<div class="btn-group">'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="insertunorderedlist" title="Bullet list"><i class="fa fa-list-ul"></i></button>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="insertorderedlist" title="Number list"><i class="fa fa-list-ol"></i></button>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="outdent" title="Reduce indent (Shift+Tab)"><i class="fa fa-indent fa-flip-horizontal"></i></button>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="indent" title="Indent (Tab)"><i class="fa fa-indent"></i></button>'
            + '</div>'
            + '<div class="btn-group">'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="justifyleft" title="Align Left (Ctrl/Cmd+L)"><i class="fa fa-align-left"></i></button>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="justifycenter" title="Center (Ctrl/Cmd+E)"><i class="fa fa-align-center"></i></button>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="justifyright" title="Align Right (Ctrl/Cmd+R)"><i class="fa fa-align-right"></i></button>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-qtip-options=\'' + qtipopts + '\' data-edit="justifyfull" title="Justify (Ctrl/Cmd+J)"><i class="fa fa-align-justify"></i></button>'
            + '</div>'
            + '<div class="btn-group">'
            + '<div class="btn-group">'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle dropdown-toggle" data-toggle="dropdown" data-qtip-options=\'' + qtipopts + '\' title="Hyperlink"><i class="fa fa-link"></i></button>'
            + '<div class="dropdown-menu col-md-6">'
            + '<div class="input-group">'
            + '<input class="form-control" placeholder="URL" type="text" data-edit="createLink"/>'
            + '<span class="input-group-btn">'
            + '<button class="btn btn-default" type="button">Add</button>'
            + '</span>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<button type="button" class="btn btn-default btn-editor tooltipTitle" data-edit="unlink" data-qtip-options=\'' + qtipopts + '\' title="Remove Hyperlink"><i class="fa fa-cut"></i></button>'
            + '</div>'
            + '</div>'
            + '<div id="' + textareaId + '" class="editor"></div>'
            + '</div>'
        );

        // Set content
        editor.find("#" + textareaId).html(textarea.val());

        // Append editor to gui
        jQuery(editor).appendTo(textarea.parent());

        // Trigger wysiwyg
        editor.find("#" + textareaId).wysiwyg();

        // Update actual textarea value on focus out event
        editor.on("focusout", function() {
            textarea.val(editor.find("#" + textareaId).cleanHtml());
        });
    }
}

/**
 * Function initializes bootstrap look-a-like select list in specified content.
 * Basically this just changes basic <select> to <div>.
 *
 * @param   {jQuery|$}  context
 * @param   {Boolean}   [forceAll]  Force select conversion for all selects
 */
function initSelect(context, forceAll) {
    forceAll = forceAll || false;

    var selector = "select[data-select]";

    if (forceAll) {
        selector = "select";
    }

    jQuery(selector, context).each(function() {
        jQuery(this).selectpicker({
            container: "body"
        });
    });
}

/**
 * Function initializes bootstrap look-a-like select list for bootbox select prompt.
 * Basically just add some data attributes and CSS classes.
 *
 * @param   {jQuery|$}  context
 */
function initSelectPrompt(context) {
    context.find("select").each(function() {
        var select = jQuery(this);

        select.attr("data-select", "true");
        select.attr("data-container", "body");
        select.attr("data-live-search", "true");

        select.addClass("in-modal show-tick show-menu-arrow");
    });

    initSelect(context);
}

/**
 * Function initializes default "static" tooltips for specified context.
 *
 * @param   {jQuery|$}  context
 */
function initTooltips(context) {
    // Hide all existing tooltips
    jQuery(".qtip.qtip-bootstrap").qtip("hide");

    context.on("mouseover", ".tooltipDiv", function() {
        createQtipDiv(jQuery(this));
    });

    context.on("mouseover", ".tooltipTitle", function() {
        createQtipTitle(jQuery(this));
    });
}

/**
 * Function initializes drop down menu hover actions in specified content.
 *
 * @param   {jQuery|$}  context
 */
function initDropDown(context) {
    jQuery("[data-hover='dropdown']", context).dropdownHover();
}

/**
 * Function initializes dynamic data load for bootstrap tabs in specified content.
 *
 * @param   {jQuery|$}  context
 */
function initTabs(context) {
    // Dynamic data loading for tab content
    jQuery("a[data-toggle='tab']", context).on("show.bs.tab", function(event) {
        var element = jQuery(event.target);

        // Specify used content id, url and possible callback function
        var contentId = element.attr("href");
        var contentUrl = element.data("href");
        var callback = element.data("callback");

        // We have url defined, so fetch tab content via AJAX call.
        if (contentUrl) {
            var content = jQuery(contentId);

            content.html(jQuery("#placeholderLoading").clone().html());

            jQuery.ajax({
                url: contentUrl,
                context: document.body
            }).done(function(result) {
                content.html(result);

                if (typeof callback !== "undefined") {
                    dispatch(callback, [context, contentId]);
                }
            }).fail(function(jqXhr, textStatus, error) {
                content.html(handleAjaxError(jqXhr, textStatus, error, true));
            });
        } else if (typeof callback !== "undefined") { // Dispatch callback function with default parameters
            dispatch(callback, [context, contentId]);
        }
    });
}

/**
 * Function initialize action menus for specified context.
 *
 * @todo    explain this better, this is like magic :D
 *
 * @param   {jQuery|$}  context
 * @param   {{}}        [parameters]
 */
function initActionMenu(context, parameters) {
    parameters = parameters || {};

    var body = jQuery("body");

    // Remove all action menu listeners, this prevents firing events to multiple listeners
    body.off("click", "ul.actionMenu-actions a");

    // Specify popover content mouse over JavaScript functions, this is like magic :D
    var mouseOver = "clearTimeout(timeoutObj); " +
        " jQuery(this).on('mouseleave', function() { jQuery(selector).popover('hide'); });" +
        " jQuery(this).on('click', 'a', function() { jQuery(this).data('selector', selector); }); ";

    // Used default parameters for popover
    var defaultParameters = {
        container: "body",
        trigger: "manual",
        placement: "bottomLeft",
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
    context.find(".actionMenu-toggle").each(function(event) {
        var element = jQuery(this);
        var options = jQuery.extend(
            {},
            defaultParameters,
            {
                content: function() {
                    return element.next("div").html();
                }
            },
            parameters
        );

        // Create popover
        element.popover(options)
        .on("mouseenter", function(event) {
            // Create global selector string, which is used in actual popover content
            selector = element.getSelector().join(" ");

            element.popover("show");
        })
        .on("mouseleave", function(event) {
            // Create global timeout for popover hide, note that this is used in actual popover content
            timeoutObj = setTimeout(function(){
                element.popover('hide');
            }, 100);
        })
        .on("click", function(event) {
            if (body.find(".popover.actionMenu").length === 0) {
                element.popover("show");
            } else {
                element.popover("hide");
            }
        });
    });
}