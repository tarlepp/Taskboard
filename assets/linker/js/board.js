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
    // Global AJAX setup
    jQuery.ajaxSetup({
        error: function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        },
        type: "post"
    });

    // Global bootbox settings
    bootbox.setDefaults({
        animate: false
    });

    // Global tooltip event
    initTooltips(jQuery(document));
});
