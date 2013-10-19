/**
 * /assets/linker/js/events.js
 *
 * @file Common event listeners and handlers.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */

// Init events for container
var initContainer = {
    users: false,
    projects: false,
    types: false,
    phases: false
};

// Init events for container
var initNavigation = {
    users: false,
    projects: false
};

jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * Event to check if all initialize methods are done. If all necessary init methods
     * are executed event trigger will un-hide specified dom elements.
     *
     * @param   {jQuery.Event}  event       Current event object
     * @param   {String}        initMethod  Initialize event name
     */
    body.on("initializeCheck", function(event, initMethod) {
        var initContainerDone = true;
        var initNavigationDone = true;

        initMethod = initMethod || false;

        // Change init event state to done
        if (initMethod !== false) {
            initContainer[initMethod] = true;
            initNavigation[initMethod] = true;
        }

        // Iterate init event states
        jQuery.each(initContainer, function(key, value) {
            // All not yet done.
            if (value === false) {
                initContainerDone = false;
            }
        });

        // Iterate init event states
        jQuery.each(initNavigation, function(key, value) {
            // All not yet done.
            if (value === false) {
                initNavigationDone = false;
            }
        });

        if (initContainerDone) {
            jQuery("#boardContent").show();
        } else {
            jQuery("#boardContent").hide();
        }

        if (initNavigationDone) {
            jQuery("#navigation").show();
        } else {
            jQuery("#navigation").hide();
        }
    });

    // Task open event
    body.on("dblclick", ".task", function() {
        var data = ko.dataFor(this);

        body.trigger('taskEdit', [data.id()]);
    });

    // Story open event
    body.on("dblclick", ".story", function() {
        var data = ko.dataFor(this);

        body.trigger('storyEdit', [data.id()]);
    });

    // Help click event
    jQuery("#functionHelp").on("click", "a", function() {
        var title = "Generic help";

        // create bootbox modal
        var modal = createBootboxDialog(title, JST["assets/linker/templates/help_generic.html"](), null, false);

        // Add help class and show help modal
        modal.addClass("modalHelp");
        modal.modal("show");
    });
});

/**
 * Function to handle event trigger. Note that this will need some work later on
 * with more complicated cases of real usage.
 *
 * @todo    How to handle delete events? Basically these triggers are not working
 *          now because after delete user is triggered to go to model edit view.
 *          And that model does not exists anymore... Fix this somehow.
 *
 * @param   {
 *          String|
 *          Boolean|
 *          sails.helper.trigger
 *          }                       trigger
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