/**
 * /assets/linker/js/sprint.js
 *
 * This file contains all sprint specified javascript functions and handlers.
 * Basically file is divided into the following sections:
 *  - Event handlers
 *  - Form handlers
 */

/**
 * Sprint specified global event handlers. These events are following:
 *  - sprintAdd
 *  - sprintEdit
 *  - sprintDelete
 *  - sprintBacklog
 */
jQuery(document).ready(function() {
    var body = jQuery("body");

    /**
     * This event handles sprint add functionality. Basically event triggers
     * modal dialog for adding new sprint, form validation and actual POST query
     * to server after form data is validated.
     *
     * After POST query knockout data is updated.
     *
     * @param   {jQuery.Event}          event       Event object
     * @param   {sails.helper.trigger}  [trigger]   Trigger to process after actions
     * @param   {{}}                    [formData]  Possible form data, simple key/value
     */
    body.on("sprintAdd", function(event, trigger, formData) {
        trigger = trigger || false;
        formData = formData || {};

        var projectId = myViewModel.project().id();

        jQuery.get("/Sprint/add", {projectId: projectId, formData: formData})
        .done(function(content) {
            var title = "Add sprint";
            var buttons = [
                {
                    label: "Save and close",
                    className: "btn-primary pull-right",
                    callback: function() {
                        save(modal, trigger, true);

                        return false;
                    }
                },
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        save(modal, trigger, false);

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initSprintForm(modal, false);
            });

            // Open bootbox modal
            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });

        /**
         * Method makes actual save function for current model and closes dialog + fire specified
         * trigger event OR opens edit modal with specified trigger event.
         *
         * @param   {jQuery|$}                  modal
         * @param   {sails.helper.trigger|bool} trigger
         * @param   {boolean}                   close
         */
        function save(modal, trigger, close) {
            var form = jQuery("#formSprintNew", modal);
            var formItems = form.serializeJSON();

            // Validate form and try to create new sprint
            if (validateForm(formItems, modal)) {
                // Create new sprint
                socket.post("/Sprint", formItems, function(/** sails.json.sprint */data) {
                    if (handleSocketError(data)) {
                        makeMessage("New sprint added to project successfully.", "success", {});

                        modal.modal("hide");

                        // User wants to close modal so pass just trigger
                        if (close) {
                            handleEventTrigger(trigger);
                        } else { // Otherwise trigger edit with same trigger
                            body.trigger("sprintEdit", [data.id, trigger]);
                        }

                        // Update client bindings
                        myViewModel.processSocketMessage("sprint", "create", data.id, data);
                    }
                });
            }
        }
    });

    /**
     * This event handles sprint edit functionality. Basically event triggers
     * modal dialog for editing currently selected sprint, form validation and
     * actual PUT query to server after form data is validated.
     *
     * After PUT query knockout data is updated.
     *
     * @param   {jQuery.Event}          event           Event object
     * @param   {Number}                [sprintId]      Sprint id, if not given fallback to current sprint
     * @param   {sails.helper.trigger}  [trigger]       Trigger to process after actions
     * @param   {{}}                    [parameters]    Init parameters, this is passed to form init function
     */
    body.on("sprintEdit", function(event, sprintId, trigger, parameters) {
        sprintId = sprintId || myViewModel.sprint().id();
        trigger = trigger || false;
        parameters = parameters || {};

        jQuery.get("/Sprint/edit", {id: sprintId})
        .done(function(content) {
            var title = "Edit sprint";
            var buttons = [
                {
                    label: "Save and close",
                    className: "btn-primary pull-right",
                    callback: function() {
                        save(modal, trigger, true);

                        return false;
                    }
                },
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        save(modal, trigger, false);

                        return false;
                    }
                },
                {
                    label: "Delete",
                    className: "btn-danger pull-right",
                    callback: function() {
                        body.trigger("sprintDelete", [sprintId, {trigger: "sprintEdit", parameters: [sprintId, trigger, parameters]}]);
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on("shown.bs.modal", function() {
                initSprintForm(modal, true, parameters);
            });

            // Open bootbox modal
            modal.modal("show");
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });

        /**
         * Method makes actual save function for current model and closes dialog + fire specified
         * trigger event OR opens edit modal with specified trigger event.
         *
         * @param   {jQuery|$}                  modal
         * @param   {sails.helper.trigger|bool} trigger
         * @param   {boolean}                   close
         */
        function save(modal, trigger, close) {
            var form = jQuery("#formSprintEdit", modal);
            var formItems = form.serializeJSON();

            // Validate form and try to create new sprint
            if (validateForm(formItems, modal)) {
                // Update sprint data
                socket.put("/Sprint/" + sprintId, formItems, function(/** sails.json.sprint */data) {
                    if (handleSocketError(data)) {
                        makeMessage("Sprint saved successfully.", "success", {});

                        // User wants to close modal so pass just trigger
                        if (close) {
                            handleEventTrigger(trigger);

                            modal.modal("hide");
                        }
                    }
                });
            }
        }
    });

    /**
     * This event handles sprint delete functionality.
     *
     * @param   {jQuery.Event}          event           Event object
     * @param   {Number}                [sprintId]      Sprint id, if not given fallback to current sprint
     * @param   {sails.helper.trigger}  [trigger]       Trigger to process after actions
     */
    body.on("sprintDelete", function(event, sprintId, trigger) {
        trigger = trigger || false;

        // Open confirm dialog
        bootbox.confirm({
            title: "danger - danger - danger",
            message: "Are you sure of sprint delete? Existing user stories in this sprint are moved to project backlog.",
            buttons: {
                cancel: {
                    className: "btn-default pull-left"
                },
                confirm: {
                    label: "Delete",
                    className: "btn-danger pull-right"
                }
            },
            callback: function(result) {
                if (result) {
                    // Delete sprint data
                    socket.delete("/Sprint/" + sprintId, {_csrf: getCsrfToken()}, function(/** sails.json.sprint */sprint) {
                        if (handleSocketError(sprint)) {
                            makeMessage("Sprint deleted successfully.", "success", {});

                            handleEventTrigger(trigger, "sprintEdit");
                        }
                    });
                } else {
                    handleEventTrigger(trigger);
                }
            }
        });
    });

    /**
     * This event handles sprint backlog functionality. Basically this just triggers
     * sprintEdit event with proper parameters.
     *
     * @param   {jQuery.Event}          event           Event object
     * @param   {Number}                [sprintId]      Sprint id, if not given fallback to current sprint
     * @param   {sails.helper.trigger}  [trigger]       Trigger to process after actions
     */
    body.on("sprintBacklog", function(event, sprintId, trigger) {
        sprintId = sprintId || myViewModel.sprint().id();
        trigger = trigger || false;

        // Used parameters with sprint edit event
        var parameters = {
            activeTab: "backlog"
        };

        // Trigger sprint edit
        body.trigger("sprintEdit", [sprintId, trigger, parameters]);
    });

    /**
     * This event handles sprint charts functionality. Basically this just triggers
     * sprintEdit event with proper parameters.
     *
     * @param   {jQuery.Event}          event           Event object
     * @param   {Number}                [sprintId]      Sprint id, if not given fallback to current sprint
     * @param   {sails.helper.trigger}  [trigger]       Trigger to process after actions
     */
    body.on("sprintCharts", function(event, sprintId, trigger) {
        sprintId = sprintId || myViewModel.sprint().id();
        trigger = trigger || false;

        // Used parameters with sprint edit event
        var parameters = {
            activeTab: "charts"
        };

        // Trigger sprint edit
        body.trigger("sprintEdit", [sprintId, trigger, parameters]);
    });
});

/**
 * Function initializes sprint add/edit form to use. Note that form is
 * located in modal content.
 *
 * @param   {jQuery|$}  modal           Current modal content
 * @param   {Boolean}   edit            Are we editing existing sprint or not
 * @param   {{}}        [parameters]    Custom parameters
 */
function initSprintForm(modal, edit, parameters) {
    parameters = parameters || {};

    if (parameters.activeTab) {
        jQuery("#" + parameters.activeTab + "Tab").click();
    }

    var inputTitle = jQuery("input[name='title']", modal);

    inputTitle.focus().val(inputTitle.val());

    var containerStart = jQuery(".dateStart", modal);
    var containerEnd = jQuery(".dateEnd", modal);
    var inputStart = containerStart.find("input");
    var inputEnd = containerEnd.find("input");
    var valueStart = null;
    var valueEnd = null;
    var dateMin = myViewModel.project().dateStartObject();
    var dateMax = myViewModel.project().dateEndObject();
    var sprintId = edit ? myViewModel.sprint().id() : 0;

    if (edit) {
        valueStart = moment(inputStart.val(), 'YYYY-MM-DD');
        valueEnd = moment(inputEnd.val(), 'YYYY-MM-DD');
    }

    containerStart.bootstrapDP({
        format: "yyyy-mm-dd",
        weekStart: 1,
        calendarWeeks: true
    })
    .on("changeDate", function(event) {
        var eventDate = moment(
            new Date(
                Date.UTC(
                    event.date.getFullYear(),
                    event.date.getMonth(),
                    event.date.getDate(),
                    event.date.getHours(),
                    event.date.getMinutes(),
                    event.date.getSeconds()
                )
            )
        ).tz("Etc/Universal");

        if (valueEnd && eventDate > valueEnd) {
            if (valueStart) {
                if (!moment.isMoment(valueStart)) {
                    valueStart = moment(valueStart);
                }

                inputStart.val(valueStart.format("YYYY-MM-DD"));
            } else {
                inputStart.val("");
            }

            makeMessage("Start date cannot be later than end date.", "error", {});

            containerStart.closest(".input-group").addClass("has-error");
        } else if (eventDate < dateMin || eventDate > dateMax) {
            makeMessage("Start date conflicts with project duration. Start date must be between " + dateMin.format(userObject.momentFormatDate) + " and " + dateMax.format(userObject.momentFormatDate)  + ".", "error", {});

            containerStart.closest(".input-group").addClass("has-error");
        } else if (checkSprintDates(eventDate, 0, sprintId, true) !== true) {
            containerStart.closest(".input-group").addClass("has-error");
        } else {
            valueStart = eventDate;

            containerStart.bootstrapDP("hide");
            containerStart.closest(".input-group").removeClass("has-error");
        }
    });

    containerEnd.bootstrapDP({
        format: "yyyy-mm-dd",
        weekStart: 1,
        calendarWeeks: true
    })
    .on("changeDate", function(event) {
        var eventDate = moment(
            new Date(
                Date.UTC(
                    event.date.getFullYear(),
                    event.date.getMonth(),
                    event.date.getDate(),
                    event.date.getHours(),
                    event.date.getMinutes(),
                    event.date.getSeconds()
                )
            )
        ).tz("Etc/Universal");

        if (valueStart && eventDate < valueStart) {
            if (valueEnd) {
                if (!moment.isMoment(valueEnd)) {
                    valueEnd = moment(valueEnd);
                }

                inputEnd.val(valueEnd.format("YYYY-MM-DD"));
            } else {
                inputEnd.val("");
            }

            makeMessage("End date cannot be before than start date.", "error", {});

            containerEnd.closest(".input-group").addClass("has-error");
        } else if (eventDate < dateMin || eventDate > dateMax) {
            makeMessage("End date conflicts with project duration. End date must be between " + dateMin.format(userObject.momentFormatDate) + " and " + dateMax.format(userObject.momentFormatDate)  + ".", "error", {});

            containerStart.closest(".input-group").addClass("has-error");
        } else if (checkSprintDates(eventDate, 1, sprintId, true) !== true) {
            containerStart.closest(".input-group").addClass("has-error");
        } else {
            valueEnd = eventDate;

            containerEnd.bootstrapDP("hide");
            containerEnd.closest(".input-group").removeClass("has-error");
        }
    });
}

/**
 * Function initializes sprint backlog tab content to use. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initSprintTabBacklog(modal, contentId) {
    var body = jQuery("body");
    var container = modal.find(contentId);

    // Initialize action menu for stories
    initActionMenu(container, {});

    // User clicks action menu link
    body.on("click", "ul.actionMenu-actions a", function() {
        var element = jQuery(this);
        var storyId = element.data("storyId");
        var action = element.data("action");
        var selector = element.data("selector");

        // We have popover selector, so hide it
        if (selector) {
            jQuery(selector).popover("hide");
        }

        // Hide current modal
        modal.modal("hide");

        // Trigger milestone action event
        body.trigger(action, [storyId, "sprintBacklog"]);
    });

    // Remove 'add new' click listeners, this prevents firing this event multiple times
    body.off("click", "[data-add-new-story='true']");

    // User wants to add new story to current sprint
    body.on("click", "[data-add-new-story='true']", function() {
        var element = jQuery(this);
        var sprintId = element.data("sprintId");
        var projectId = element.data("projectId");

        // Hide current modal
        modal.modal("hide");

        // Trigger story add
        body.trigger("storyAdd", [projectId, sprintId, {trigger: "sprintBacklog", parameters: [sprintId]}]);
    });

    // Make story table to be sortable
    jQuery("#sprintBacklog tbody", container).sortable({
        axis: "y",
        helper: function(e, tr) {
            var helper = tr.clone();

            return helper.addClass("sortable");
        },
        stop: function(event, ui) {
            var table = jQuery("#sprintBacklog", container);
            var rows = table.find("tbody tr");
            var errors = false;
            var update = [];

            rows.fadeTo(0, 0.5);

            // Iterate each row
            rows.each(function(index) {
                var storyId = jQuery(this).data("storyId");

                /**
                 * Update story data via socket does not work - wtf
                 *
                 * This is a mystery, why socket doesn't work here? Am I missing something
                 * or am I just stupid?
                 */
                //socket.put("/Story/" + storyId, {priority: index + 1}, function(story) {
                //    if (handleSocketError(story)) {
                //        update.push(true);
                //
                //        myViewModel.processSocketMessage("story", "update", story.id, story);
                //    } else {
                //        update.push(false);
                //
                //        errors = true;
                //    }
                //
                //    // Check if all is done
                //    checkUpdate();
                //});

                jQuery.ajax({
                    url: "/Story/" + storyId,
                    data: {
                        priority: index + 1,
                        _csrf: getCsrfToken()
                    },
                    type: "PUT",
                    dataType: "json"
                })
                .done(function() {
                    update.push(true);

                    // Check if all is done
                    checkUpdate();
                })
                .fail(function(jqXhr, textStatus, error) {
                    update.push(false);

                    errors = true;

                    handleAjaxError(jqXhr, textStatus, error);
                });
            });

            // Function to make sure that we have updated all rows.
            function checkUpdate() {
                if (update.length == rows.length) {
                    var message = "";
                    var type = "success";

                    if (errors) {
                        type = "error";
                        message = "Error in stories priority update"
                    } else {
                        message = "Stories priorities changed successfully";
                    }

                    makeMessage(message, type, {});

                    rows.fadeTo(0, 1);
                }
            }
        }
    });
}

/**
 * Function initializes sprint charts tab content to use. Note that
 * this init can be called multiple times.
 *
 * Also note that this init is called dynamic from initTabs() function.
 *
 * @param   {jQuery|$}  modal       Current modal content
 * @param   {String}    contentId   Tab content div id
 */
function initSprintTabChart(modal, contentId) {
    var context = jQuery(contentId);
    var sprintId = parseInt(context.data("sprintId"));
    var ajaxData;

    // Create chart
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'burnDownChartTasks',
            events: {
                load: requestData
            }
        },
        title: {
            text: "Loading data..."
        },
        subtitle: {
            text: "Sprint task burndown chart"
        },
        credits: {
            enabled: false
        },
        xAxis: {
            type: "datetime",
            startOnTick: false,
            endOnTick: false,
            tickInterval: 3600 * 1000 * 24,
            labels: {
                rotation: -36,
                useHTML: true,
                align: "right",
                formatter: function() {
                    return "<span class='chartLabel'>" + moment(this.value).format(userObject.momentFormatDate) + "</span>";
                }
            }
        },
        yAxis: {
            title: {
                text: "Tasks remaining"
            },
            gridLineColor: "#dddddd",
            lineWidth: 1,
            min: 0
        },
        plotOptions: {
            series: {
                pointPadding: 0.1,
                groupPadding: 0,
                borderWidth: 0,
                shadow: false
            }
        },
        legend: {
            backgroundColor: "#ffffff",
            align: "right",
            verticalAlign: "top",
            layout: "vertical",
            x: -10,
            y: 60,
            floating: true
        },
        tooltip: {
            shared: true,
            hideDelay: 100,
            useHTML: true,
            borderColor: "#cccccc",
            borderWidth: 1,
            shadow: false,
            formatter: function() {
                var dateEnd = moment(this.x);
                var dateStart = dateEnd.clone().subtract("days", 1);
                var tooltip = "<div class='chartToolTipTasks'>"
                        + "<h1>"
                        + dateStart.format(userObject.momentFormatDate)
                        + " - "
                        + dateEnd.format(userObject.momentFormatDate)
                        + "</h1>"
                        + "<hr />"
                        + "<table>"
                            + "<tr>"
                                + "<td></td>"
                                + "<th>Tasks remaining</th>"
                            + "</tr>"
                    ;

                var actualDone = 0;
                var daysSoFar = 0;
                var daysText = "";
                var showEstimate = true;

                // Iterate each points and add data to tooltip as a table row
                _.each(this.points, function(point, i) {
                    if (point.series.options.nameShort != 'Estimate'
                        || point.series.options.nameShort == 'Estimate' && showEstimate) {
                        tooltip += ""
                            + "<tr>"
                                + "<th class='text-right'>"
                                    + point.series.options.nameShort
                                + "</th>"
                                + "<td>"
                                    + numeral(point.y).format("0[.]00")
                                + "</td>"
                            + "</tr>"
                        ;
                    }

                    if (point.series.options.nameShort == 'Actual') {
                        daysSoFar = (moment(point.x).diff(ajaxData.pointStart, "days") + 1);
                        actualDone = (ajaxData.initTasks - point.y) / daysSoFar;

                        daysText = " <span class='text-muted'>(" + daysSoFar + " days)</span>";

                        showEstimate = false;
                    } else if (point.series.options.nameShort == 'Estimate' && showEstimate) {
                        daysSoFar = (moment(point.x).diff(ajaxData.pointStart, "days") + 1);
                        actualDone = (ajaxData.initTasks - point.y) / daysSoFar;

                        daysText = " <span class='text-muted'>(" + daysSoFar + " days)</span>";
                    }
                });

                tooltip += ""
                    + "<tr>"
                        + "<td></td>"
                        + "<th>Tasks per day</th>"
                    + "</tr>"
                    + "<tr>"
                        + "<th class='text-right'>Ideal</th>"
                        + "<td>"
                            + numeral(ajaxData.statistics.tasksPerDayIdeal).format("0[.]00")
                        + "</td>"
                    + "</tr>"
                ;

                if (actualDone) {
                    var title = showEstimate ? "Estimate" : "Actual";

                    tooltip += ""
                        + "<tr>"
                            + "<th class='text-right'>" + title + "</th>"
                            + "<td>"
                                + numeral(actualDone).format("0[.]00") + daysText
                        + "</td>"
                        + "</tr>"
                    ;
                }

                tooltip += ""
                    + "</table>"
                    + "</div>";

                return tooltip;
            }

        },
        series: []
    });

    /**
     * This function fetches actual data for chart from server.
     *
     * Note that request data from server contains also other data.
     */
    function requestData() {
        jQuery
            .ajax({
                url: "/Sprint/ChartDataTasks",
                type: "GET",
                dataType: "json",
                data: {
                    sprintId: sprintId
                }
            })
            .done(function(data) {
                ajaxData = data;

                // Set main title for chart
                chart.setTitle({
                    text: data.sprint.title + " " + moment(data.sprint.dateStart).format(userObject.momentFormatDate) + " - " + moment(data.sprint.dateEnd).format(userObject.momentFormatDate)
                });

                // Iterate chart data and add new series to chart
                for (var i = 0; i < data.chartData.length; i++) {
                    chart.addSeries(data.chartData[i], false)
                }

                chart.xAxis.min = data.pointStart;

                // Redraw chart
                chart.redraw();
            })
            .fail(function(jqXhr, textStatus, error) {
                handleAjaxError(jqXhr, textStatus, error);
            });
    }
}