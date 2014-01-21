/**
 * /assets/linker/js/board.js
 *
 * @file Basic global functions which are attached to document ready event.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */
"use strict";

/**
 * Initialize all necessary javascript on document ready event.
 */
jQuery(document).ready(function() {
    // Global bootbox settings
    bootbox.setDefaults({
        animate: false
    });

    if (typeof userObject !== 'undefined') {
        // Set language for moment.js and numeral.js
        moment.lang(userObject.language);
        numeral.language(userObject.language);
    }

    // Global tooltip event
    initTooltips(jQuery(document));

    // We only accept chrome, I know this will be a problem...
    if (typeof window.chrome === "undefined") {
        makeBrowserError();
    }

    // We have some flash messages so show those to user
    if (messages && typeof messages == "object") {
        // Iterate messages and make messages
        _.each(messages, function(message) {
            makeMessage(message.message, message.type, message.options);
        });
    }

    /**
     * Function to show browser error. This is used if user don't use
     * Google Chrome browser. Note that if user dismiss the noty dialog
     * it is just triggered again and again and again...
     */
    function makeBrowserError() {
        var message = "Please use <a href='https://www.google.com/chrome/' target='_blank'>Google Chrome</a> as browser, otherwise we can not guarantee proper user experience...";

        makeMessage(message, "error", {
            timeout: 0,
            force: true,
            template: "<div class='noty_message'><span class='noty_text'></span></div>"
        });
    }

    /**
     * Set some defaults for HighCharts component.
     */
    Highcharts.setOptions({
        chart: {
            style: {
                fontFamily: "Yanone Kaffeesatz, Helvetica Neue, Helvetica, Arial, sans-serif",
                fontSize: "16px"
            }
        },
        legend: {
            itemStyle: {
                fontSize: "14px"
            }
        },
        title: {
            style: {
                fontSize: "20px"
            }
        }
    });

    jQuery(window).resize(function() {
        fixBoardWidth();
    });
});

/**
 * Helper function to calculate board thead row cell widths according to
 * current board and size of current browser window.
 *
 * Also note that this function is called every time when user resizes
 * browser window.
 */
function fixBoardWidth() {
    // Make board header fixed, this is not yet "good" enough...
    var table = jQuery("#boardTable");
    var widths = [];

    table.find("tbody tr:first th, tbody tr:first td").each(function(index) {
        var width = jQuery(this).outerWidth() - 2;

        widths.push(width);
    });

    table.find("thead tr th").each(function(index) {
        var width = widths[index];

        if (index == 0) {
            width = width + 10;
        } else if (index == (widths.length - 1)) {
            width = width + 20;
        }

        jQuery(this).width(width);
    });

    table.find("thead").css({
        position: "fixed",
        "z-index": 200,
        "margin-top": "-39px",
        left: "0px",
        width: "100%"
    });

    table.css({
        "margin-top": "39px"
    });
}
