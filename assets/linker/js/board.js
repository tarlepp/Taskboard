/**
 * /assets/linker/js/board.js
 *
 * @file Basic global functions which are attached to document ready event.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */

/**
 * Initialize all necessary javascript on document ready event.
 */
jQuery(document).ready(function() {
    // Global bootbox settings
    bootbox.setDefaults({
        animate: false
    });

    // Global tooltip event
    initTooltips(jQuery(document));

    // We only accept chrome, I know this will be a problem...
    if (typeof window.chrome === "undefined") {
        makeBrowserError();
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
            template: "<div class='noty_message'><span class='noty_text'></span></div>",
            callback: {
                onClose: function() {
                    makeBrowserError();
                }
            }
        });
    }
});
