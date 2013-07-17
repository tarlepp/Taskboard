jQuery(document).ready(function() {
    var body = jQuery('body');

    // Task open event
    body.on('dblclick', '.task', function(event) {
        var data = ko.dataFor(this);

        body.trigger('taskEdit', [data]);
    });

    // Story open event
    body.on('dblclick', '.story', function(event) {
        var data = ko.dataFor(this);

        body.trigger('storyEdit', [data]);
    });

    // Help click event
    jQuery('#functionHelp').on('click', 'a', function(event) {
        var source = jQuery('#help-generic').html();
        var template = Handlebars.compile(source);
        var templateData = {};

        var modal = bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                }
            ],
            {
                header: "Generic help"
            }
        );
    });

    body.on('taskEdit', function(event, taskData) {
        var source = jQuery('#task-form-edit').html();
        var template = Handlebars.compile(source);
        var templateData = jQuery.extend(
            {},
            ko.toJS(taskData),
            {
                users: ko.toJS(myViewModel.users()),
                types: ko.toJS(myViewModel.types())
            }
        );

        var modal = bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formTaskEdit');
                        var formItems = form.serializeJSON();

                        if (validateForm(formItems)) {
                            jQuery.ajax({
                                type: "PUT",
                                url: "/task/" + taskData.id(),
                                data: formItems,
                                dataType: 'json'
                            }).done(function (/** models.task */task) {
                                // TODO: update model data

                                jQuery('div.bootbox').modal('hide');
                            })
                            .fail(function (jqxhr, textStatus, error) {
                                handleAjaxError(jqxhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    class: "btn-danger pull-right",
                    callback: function () {
                        bootbox.confirm(
                            "Are you sure of task delete?",
                            function(result) {
                                if (result) {
                                    jQuery.ajax({
                                        type: "DELETE",
                                        url: "/task/" + taskData.id(),
                                        dataType: 'json'
                                    }).done(function () {
                                        myViewModel.deleteTask(taskData.id(), taskData.phaseId(), taskData.storyId());
                                    })
                                    .fail(function (jqxhr, textStatus, error) {
                                        handleAjaxError(jqxhr, textStatus, error);
                                    });
                                } else {
                                    body.trigger('taskEdit', [taskData]);
                                }
                            }
                        );
                    }
                }
            ],
            {
                header: "Edit task"
            }
        );

        modal.on('shown', function() {
            var inputTitle = jQuery('input[name="title"]', modal);

            inputTitle.focus().val(inputTitle.val());

            jQuery('textarea', modal).autosize();
        });
    });


    body.on('storyEdit', function(event, storyData) {
        var source = jQuery('#story-form-edit').html();
        var template = Handlebars.compile(source);
        var templateData = ko.toJS(storyData);

        var modal = bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formStoryEdit');
                        var formItems = form.serializeJSON();

                        if (validateForm(formItems)) {
                            jQuery.ajax({
                                type: "PUT",
                                url: "/story/" + storyData.id(),
                                data: formItems,
                                dataType: 'json'
                            }).done(function (/** models.story */story) {
                                // TODO: update model data

                                jQuery('div.bootbox').modal('hide');
                            })
                            .fail(function (jqxhr, textStatus, error) {
                                handleAjaxError(jqxhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    class: "btn-danger pull-right",
                    callback: function () {
                        bootbox.confirm(
                            "Are you sure of story delete?",
                            function(result) {
                                if (result) {
                                    jQuery.ajax({
                                        type: "DELETE",
                                        url: "/story/" + storyData.id(),
                                        dataType: 'json'
                                    }).done(function () {
                                            myViewModel.deleteStory(storyData.id());
                                        })
                                        .fail(function (jqxhr, textStatus, error) {
                                            handleAjaxError(jqxhr, textStatus, error);
                                        });
                                } else {
                                    body.trigger('storyEdit', [storyData]);
                                }
                            }
                        );
                    }
                }
            ],
            {
                header: "Edit story"
            }
        );

        modal.on('shown', function() {
            initStoryForm(modal, true);
        });
    });

    /**
     * Project phases edit
     */
    body.on('phasesEdit', function(event) {
        var source = jQuery('#phases-form-edit').html();
        var template = Handlebars.compile(source);
        var templateData = {
            project: ko.toJS(myViewModel.project()),
            phases: ko.toJS(myViewModel.phases())
        };

        var modal = bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function () {
                        var errors = false;
                        var lines = jQuery("#projectPhases", modal).find("tbody tr");

                        lines.each(function(key) {
                            var row = jQuery(this);
                            var title = jQuery.trim(row.find('input[name="title[]"]').val());
                            var tasks = parseInt(row.find('input[name="tasks[]"]').val(), 10);
                            var phaseId = parseInt(row.find('input[name="id[]"]').val(), 10);

                            if (title.length == 0) {
                                row.addClass('error');
                            } else {
                                row.removeClass('error');

                                var type = '';
                                var url = '';

                                var phaseData = {
                                    title: title,
                                    order: key,
                                    tasks: isNaN(tasks) ? 0 : tasks,
                                    projectId: ko.toJS(myViewModel.project().id())
                                };

                                if (isNaN(phaseId)) {
                                    type = 'POST';
                                    url = ''
                                } else {
                                    type = 'PUT';
                                    url = phaseId;
                                }

                                jQuery.ajax({
                                    type: type,
                                    url: "/phase/" + url,
                                    data: phaseData,
                                    dataType: 'json'
                                }).done(function (/** models.phase */phase) {
                                    switch (type) {
                                        case 'POST':
                                            myViewModel.phases.push(new Phase(phase));

                                            if (myViewModel.sprint()) {
                                                // TODO: add phase story phases
                                            }
                                            break;
                                        case 'PUT':
                                            // TODO: update model data
                                            break;
                                    }
                                })
                                .fail(function (jqxhr, textStatus, error) {
                                    errors = true;

                                    handleAjaxError(jqxhr, textStatus, error);
                                });
                            }
                        });

                        return false;
                    }
                },
                {
                    label: "Add new phase",
                    class: "pull-right",
                    callback: function () {
                        var newRow = jQuery('#projectPhasesNew', modal).find('tr').clone();
                        var slider = newRow.find('.slider');
                        var input = slider.next('input');
                        var currentValue = parseInt(input.val(), 10);
                        var cellValue = slider.parent().next('td');

                        cellValue.html('unlimited');

                        slider.slider({
                            min: 0,
                            max: 10,
                            value: 0,
                            slide: function(event, ui) {
                                if (isNaN(ui.value) || ui.value === 0) {
                                    cellValue.html('unlimited');
                                } else {
                                    cellValue.html(ui.value);
                                }

                                input.val(ui.value);
                            }
                        });

                        jQuery('#projectPhases', modal).find('tbody').append(newRow);

                        return false;
                    }
                }
            ],
            {
                header: "Phases for project '" + ko.toJS(myViewModel.project().title()) +"'"
            }
        );

        modal.on('shown', function() {
            jQuery.each(jQuery('#projectPhases', modal).find('.slider'), function() {
                var slider = jQuery(this);
                var input = slider.next('input');
                var currentValue = parseInt(input.val(), 10);
                var cellValue = slider.parent().next('td');

                if (isNaN(currentValue) || currentValue === 0) {
                    cellValue.html('unlimited');
                } else {
                    cellValue.html(currentValue);
                }

                slider.slider({
                    min: 0,
                    max: 10,
                    value: currentValue,
                    slide: function(event, ui) {
                        if (isNaN(ui.value) || ui.value === 0) {
                            cellValue.html('unlimited');
                        } else {
                            cellValue.html(ui.value);
                        }

                        input.val(ui.value);
                    }
                });
            });

            var fixHelper = function(e, ui) {
                ui.children().each(function() {
                    jQuery(this).width(jQuery(this).width());
                });

                return ui;
            };

            var sortable = jQuery("#projectPhases").find("tbody");

            sortable.sortable({
                helper: fixHelper,
                axis: 'y',
                cursor: 'move',
                stop: function (event, ui) {
                    jQuery.each(sortable.find('tr'), function(key) {
                        var row = jQuery(this);
                        var phaseId = row.data('phaseId');

                        row.find('input[name="order['+ phaseId +']"]').val(key);
                    });
                }
            }).disableSelection();
        });

        modal.on('click', '.phaseDelete', function() {
            var row = jQuery(this).closest('tr');
            var phaseId = parseInt(row.data('phaseId'), 10);

            // Not a "real" phase, so just remove whole row
            if (isNaN(phaseId)) {
                row.remove();
            } else { // Otherwise we have a real phase
                // Specify parameters to fetch phase task data
                var parameters = {
                    phaseId: phaseId
                };

                // Fetch project sprint data
                jQuery.getJSON("/task/", parameters)
                    .done(function(/** models.task[] */tasks) {
                        // Phase doesn't contain any tasks so delete is possible
                        if (tasks.length === 0) {
                            modal.modal('hide');

                            bootbox.confirm(
                                "Are you sure of phase delete?",
                                function(result) {
                                    if (result) {
                                        jQuery.ajax({
                                            type: "DELETE",
                                            url: "/phase/" + phaseId,
                                            dataType: 'json'
                                        }).done(function () {
                                            myViewModel.deletePhase(phaseId);

                                            body.trigger('phasesEdit');
                                        })
                                        .fail(function (jqxhr, textStatus, error) {
                                            handleAjaxError(jqxhr, textStatus, error);
                                        });
                                    } else {
                                        body.trigger('phasesEdit');
                                    }
                                }
                            );
                        } else {
                            makeMessage("Cannot delete phase, because it contains tasks.", "error", {});
                        }
                    })
                    .fail(function(jqxhr, textStatus, error) {
                        handleAjaxError(jqxhr, textStatus, error);
                    });
            }
        });
    });

    body.on('projectEdit', function() {
        var source = jQuery('#project-form-edit').html();
        var template = Handlebars.compile(source);
        var templateData = {
            users: ko.toJS(myViewModel.users()),
            data: ko.toJS(myViewModel.project())
        };

        var modal = bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formProjectEdit');
                        var formItems = form.serializeJSON();

                        if (validateForm(formItems)) {
                            jQuery.ajax({
                                type: 'PUT',
                                url: "/project/" + ko.toJS(myViewModel.project().id()),
                                data: formItems,
                                dataType: 'json'
                            }).done(function (/** models.project */project) {
                                 // TODO: update knockout data
                            })
                            .fail(function (jqxhr, textStatus, error) {
                                handleAjaxError(jqxhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    class: "btn-danger pull-right",
                    callback: function () {
                        console.log('implement project delete');

                        return false;
                    }
                }
            ],
            {
                header: "Edit project"
            }
        );

        modal.on('shown', function() {
            initProjectForm(modal, true);
        });
    });

    body.on('projectBacklog', function() {
        var sprints = ko.toJS(myViewModel.sprints());

        var data = [];

        jQuery.each(sprints, function(sprintKey, sprintData) {
            data['sprint_' + sprintData.id] = [];
        });

        // Specify parameters to fetch all project stories
        var parameters = {
            projectId: ko.toJS(myViewModel.project().id()),
            sort: 'priority ASC'
        };

        // Make REST request
        jQuery.getJSON("/story/", parameters)
            .done(function (/** models.story[] */stories) {
                // Iterate stories
                jQuery.each(stories, function(storyKey, storyData) {
                    if (typeof data['sprint_' + storyData.sprintId] === 'object') {
                        data['sprint_' + storyData.sprintId].push(storyData);
                    }
                });

                // Iterate stories and assign stories to them
                jQuery.each(sprints, function(sprintKey, sprintData) {
                    sprintData.stories = data['sprint_' + sprintData.id];
                });

                var source = jQuery('#project-backlog').html();
                var template = Handlebars.compile(source);
                var templateData = {
                    project: ko.toJS(myViewModel.project()),
                    backlog: ko.toJS(myViewModel.backlog()),
                    sprints: sprints
                };

                var modal = bootbox.dialog(
                    template(templateData),
                    [
                        {
                            label: "Close",
                            class: "pull-left",
                            callback: function () {
                            }
                        },
                        {
                            label: "Save",
                            class: "btn-primary pull-right",
                            callback: function () {
                                console.log('save backlog order');

                                return false;
                            }
                        },
                        {
                            label: "Add new story",
                            class: "pull-right",
                            callback: function () {
                                console.log('open story add dialog');

                                return false;
                            }
                        }
                    ],
                    {
                        header: "Project backlog"
                    }
                ).addClass('modalBacklog');

                modal.on('shown', function() {
                    initProjectBacklog(modal);
                });
            })
            .fail(function (jqxhr, textStatus, error) {
                handleAjaxError(jqxhr, textStatus, error);
            });
    });

    /**
     * This event handles sprint add functionality. Basically event triggers
     * modal dialog for adding new sprint, form validation and actual POST query
     * to server after form data is validated.
     *
     * After POST query knockout data is updated.
     */
    body.on('sprintAdd', function() {
        // Specify used template data
        var source = jQuery('#sprint-form-new').html();
        var template = Handlebars.compile(source);
        var templateData = {
            projectId: ko.toJS(myViewModel.project().id())
        };

        // Modal initialize
        var modal = bootbox.dialog(
            template(templateData),
            [
                {
                    label: "Close",
                    class: "pull-left",
                    callback: function () {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formSprintNew');
                        var formItems = form.serializeJSON();

                        if (validateForm(formItems)) {
                            // Make POST query to server
                            jQuery.ajax({
                                type: 'POST',
                                url: "/sprint/",
                                data: formItems,
                                dataType: 'json'
                            }).done(function (/** models.sprint */sprint) {
                                // Add inserted sprint to knockout model data
                                myViewModel.sprints.push(new Sprint(sprint));

                                // Update current project sprint dates
                                myViewModel.updateProjectSprintDates();

                                // Remove modal
                                modal.modal('hide');
                            })
                            .fail(function (jqXhr, textStatus, error) {
                                handleAjaxError(jqXhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                }
            ],
            {
                header: "Add sprint"
            }
        );

        // Method initializes sprint form to use
        modal.on('shown', function() {
            initSprintForm(modal, false);
        });
    });
});