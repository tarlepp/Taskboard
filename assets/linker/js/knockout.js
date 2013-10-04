/**
 * /assets/linker/js/knockout.js
 *
 * @file Custom knockout binding handlers.
 * @author Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */

/**
 * Basic truncate text for task post-it. This is simply replacement for trunk8
 * library - not so fancy but fast as hell.
 *
 * @type {{update: Function, defaultLength: number}}
 */
ko.bindingHandlers.truncatedText = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var length = ko.utils.unwrapObservable(allBindingsAccessor().length) || ko.bindingHandlers.truncatedText.defaultLength;
        var truncatedValue = value.length > length ? value.substring(0, Math.min(value.length, length)) + "..." : value;

        ko.bindingHandlers.text.update(element, function() {
            return truncatedValue;
        });
    },
    defaultLength: 15
};

/**
 * Project change binding handler, this is activated when
 * user changes project selection.
 *
 * @type {{init: Function, update: Function}}
 */
ko.bindingHandlers.changeProject = {
    /**
     * Init function for project change.
     *
     * @param   {String}    element             Name of the current element
     * @param               valueAccessor
     * @param               allBindingsAccessor
     * @param   {ViewModel} viewModel
     */
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var elementProject = jQuery(element);

        // Actual change event is triggered
        elementProject.change(function() {
            var projectId = parseInt(elementProject.val(), 10);

            // Seems like a real project
            if (!isNaN(projectId)) {
                viewModel.initProject(projectId);
            }
        });
    },

    /**
     * Update function for project change
     *
     * @param   {String}    element Name of the current element
     */
    update:function (element) {
        jQuery(element).find("option").each(function() {
            var option = jQuery(this);

            if (option.text() == "Choose project to show") {
                option.addClass("select-dummy-option text-muted");
            }
        });

        jQuery(element).selectpicker("refresh");
    }
};

/**
 * Sprint change binding handler, this is activated when
 * user changes sprint selection.
 *
 * @type {{init: Function, update: Function}}
 */
ko.bindingHandlers.changeSprint = {
    /**
     * Init function for sprint change.
     *
     * @param   {String}    element             Name of the current element
     * @param               valueAccessor
     * @param               allBindingsAccessor
     * @param   {ViewModel} viewModel
     */
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var elementSprint = jQuery(element);

        elementSprint.change(function() {
            var sprintId = parseInt(elementSprint.val(), 10);

            if (!isNaN(sprintId)) {
                viewModel.initSprint(sprintId);
            }
        });
    },

    /**
     * Update function for sprint change
     *
     * @param   {String}    element Name of the current element
     */
    update: function (element) {
        jQuery(element).find("option").each(function() {
            var option = jQuery(this);

            if (option.text() == "Choose sprint to show") {
                option.addClass("select-dummy-option text-muted");
            }
        });

        jQuery(element).selectpicker("refresh");
    }
};

/**
 * qTip knockout bindings.
 *
 * @type {{init: Function, update: Function}}
 */
ko.bindingHandlers.qtip = {
    init: function (element, valueAccessor) {
        var settings = ko.utils.unwrapObservable(valueAccessor()) || {};

        if (!jQuery.isEmptyObject(settings)) {
            /**
             * Add a class so we can search for all elements that have a Qtip
             * This is used in the jqDialog Binding so we can hide and destroy
             * all Qtips associated with elements in a dialog
             */
            jQuery(element).addClass("generated_qtip");

            // handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                try {
                    jQuery(element).qtip("api").hide();
                    jQuery(element).qtip("api").destroy();
                    jQuery(element).removeClass("generated_qtip");
                } catch (err) {
                    // There was no Qtip defined on the element yet
                }
            });
        }
    },

    update: function(element, valueAccessor) {
        var settings = ko.utils.unwrapObservable(valueAccessor()) || {};

        if (!jQuery.isEmptyObject(settings)) {
            var textValue = ko.utils.unwrapObservable(settings.text);
            var title = ko.utils.unwrapObservable(settings.title);

            if (textValue || title.length > 15) {
                if (!textValue) {
                    textValue = "<em>No description...</em>";
                }

                try {
                    jQuery(element).qtip("api").hide();
                    jQuery(element).qtip("api").destroy();
                    jQuery(element).removeClass("generated_qtip");
                }
                catch (err) {
                    // There was no Qtip defined on the element yet
                }

                var options = settings.options ? settings.options : {};
                var width = settings.width ? settings.width : "auto";

                jQuery(element).qtip(
                    jQuery.extend(
                        {},
                        {
                            content: {
                                title: settings.title,
                                text: textValue
                            },
                            show: {
                                event: "mouseenter",
                                delay: 50,
                                solo: true
                            },
                            hide: {
                                event: "click mouseleave"
                            },
                            style: {
                                classes: "qtip-bootstrap",
                                width: width
                            },
                            position: {
                                my: "left top",
                                at: "center bottom",
                                adjust: {
                                    screen: true
                                },
                                viewport: jQuery(window)
                            },
                            events: {
                                show: function(event, api) {
                                    // Move is in process, we don't want to show tooltip
                                    if (myViewModel.moveInProcess()) {
                                        try {
                                            event.preventDefault();
                                        } catch(error) {
                                        }
                                    }
                                }
                            }
                        },
                        options
                    )
                );
            }
            else {
                try {
                    jQuery(element).qtip("api").hide();
                    jQuery(element).qtip("api").destroy();
                    jQuery(element).removeClass("generated_qtip");
                }
                catch (err) {
                    // There was no Qtip defined on the element yet
                }
            }
        }
    }
};

/**
 * trunk8 bindings for knockout, usage:
 *
 * <h3 data-bind="text: title, trunk8: {lines: 1}"></h3>
 *
 * @type {{init: Function, update: Function}}
 */
ko.bindingHandlers.trunk8 = {
    /**
     * This is disabled for now for performance issues. Try to figure out something
     * that solves this problem or just don't use this.
     */
    init: function(element, valueAccessor) {
        var settings = ko.utils.unwrapObservable(valueAccessor()) || {};
        var defaultSettings = {
            fill: "&hellip;"
        };

        jQuery(element).trunk8(jQuery.extend({}, defaultSettings, settings));
    },

    update: function(element, valueAccessor) {
        console.log('ddd');
        jQuery(element)
            .trunk8("update", jQuery(element).html())   // Update trunk8 data
            .prop("title", "")                          // Remove element title
            .addClass("trunk8")                         // Set helper class
        ;
    }
};