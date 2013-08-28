jQuery(document).ready(function() {
    // Global tooltip events
    jQuery(document).on('mouseover', '.tooltipDiv', function() {
        createQtipDiv(jQuery(this));
    });

    jQuery(document).on('mouseover', '.tooltipTitle', function() {
        createQtipTitle(jQuery(this));
    });

    // Global bootbox settings
    bootbox.setDefaults({
        animate: false
    });

    // Global task / story mouseover/out events for trunk8 functionality
    jQuery(document).on('mouseover', '.task, .story', function(event) {
        jQuery(this).find('.trunk8').each(function(a, b) {
            jQuery(this).trunk8('revert');
        });
    });

    jQuery(document).on('mouseout', '.task, .story', function(event) {
        jQuery(this).find('.trunk8').each(function() {
            jQuery(this).trunk8().prop('title', '');
        });
    });
});

function createQtipDiv(el) {
    var title = el.find('.tooltipDivContainer h1').html();
    var text = el.find('.tooltipDivContainer div').html();

    if (title && text || el.data('tooltipShow')) {
        if (!text) {
            text = el.data('tooltipContent');
        }

        createQtip(el, title, text, 'auto', 'top left', 'bottom center', true, 100);
    }
}

function createQtipTitle(el) {
    createQtip(el, '', el.attr('title'), 'auto', 'top left', 'bottom center', false, 50);
}

function createQtip(element, tipTitle, tipText, tipWidth, tipMy, tipAt, tipFixed, tipDelay) {
    element.qtip({
        metadata: {
            type: 'html5',      // Use HTML5 data-* attributes
            name: 'qtipopts'    // Grab the metadata from the data-qtipOpts HTML5 attribute
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
            ready: true
        },
        hide: {
            fixed: tipFixed,
            delay: tipDelay,
            effect: false
        },
        position: {
            my: tipMy,
            at: tipAt
        }
    });
}