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
    var body = jQuery('body');

    /**
     * Event to check if all initialize methods are done. If all necessary init methods
     * are executed event trigger will un-hide specified dom elements.
     *
     * @param   {Event}     event       Current event object
     * @param   {String}    initMethod  Initialize event name
     */
    body.on('initializeCheck', function(event, initMethod) {
        var initContainerDone = true;
        var initNavigationDone = true;

        // Change init event state to done
        initContainer[initMethod] = true;
        initNavigation[initMethod] = true;

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
            jQuery('#boardContent').show();
        }

        if (initNavigationDone) {
            jQuery('#navigation').show();
        }
    });

    /**
     * Project add event, this opens a modal bootbox dialog with project add
     * form on it.
     */
    body.on('projectAdd', function() {
        jQuery.get('/Project/add', {}, function(content) {
            var title = 'Add new project';
            var buttons = {
                label: "Save",
                class: "btn-primary pull-right",
                callback: function() {
                    var form = jQuery('#formProjectNew', modal);
                    var formItems = form.serializeJSON();

                    // Validate form and try to create new project
                    if (validateForm(formItems)) {
                        // Make POST query to server
                        jQuery.ajax({
                            type: 'POST',
                            url: "/project/",
                            data: formItems,
                            dataType: 'json'
                        })
                        .done(function(/** models.rest.project */project) {
                            // Add new project to knockout data
                            myViewModel.projects.push(new Project(project));

                            makeMessage('Project created successfully.', 'success', {});

                            modal.modal('hide');

                            // TODO should this new project to be selected automatically?
                        })
                        .fail(function(jqXhr, textStatus, error) {
                            handleAjaxError(jqXhr, textStatus, error);
                        });
                    }

                    return false;
                }
            };

            // Open bootbox modal
            var modal = openBootboxDialog(title, content, buttons);

            // Make form init when dialog is opened.
            modal.on('shown', function() {
                initProjectForm(modal, false);
            });
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Project edit event, this opens a modal bootbox dialog with project edit
     * form on it.
     */
    body.on('projectEdit', function() {
        jQuery.get('/Project/edit', {id: ko.toJS(myViewModel.project().id())}, function(content) {
            var title = 'Edit project';
            var buttons = [
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formProjectEdit');
                        var formItems = form.serializeJSON();

                        // Validate form and try to update project data
                        if (validateForm(formItems)) {
                            jQuery.ajax({
                                type: 'PUT',
                                url: "/project/" + ko.toJS(myViewModel.project().id()),
                                data: formItems,
                                dataType: 'json'
                            })
                            .done(function(/** models.rest.project */projectData) {
                                var updatedProject = new Project(projectData);

                                // Iterate current knockout model projects
                                jQuery.each(myViewModel.projects(), function(index, project) {
                                    if (project.id() === myViewModel.project().id()) {
                                        // Replace old project model with new one
                                        myViewModel.projects.replace(project, updatedProject);
                                        myViewModel.project(updatedProject);
                                    }
                                });

                                makeMessage('Project updated successfully.', 'success', {});

                                modal.modal('hide');
                            })
                            .fail(function(jqXhr, textStatus, error) {
                                handleAjaxError(jqXhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    class: "btn-danger pull-right",
                    callback: function() {
                        // TODO implement this
                        console.log('implement project delete');

                        return false;
                    }
                }
            ];

            // Open bootbox modal
            var modal = openBootboxDialog(title, content, buttons);

            // Make form init when dialog is opened.
            modal.on('shown', function() {
                initProjectForm(modal, true);
            });
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Project backlog event, this opens a modal bootbox dialog with project backlog view on it.
     * In this dialog user can prioritize user stories and assign them to existing sprints or move
     * them back to backlog.
     */
    body.on('projectBacklog', function() {
        jQuery.get('/Project/backlog', {id: ko.toJS(myViewModel.project().id())}, function(content) {
            var title = 'Edit project';
            var buttons = [
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function() {
                        // TODO implement this
                        console.log('save backlog order');

                        return false;
                    }
                },
                {
                    label: "Add new story",
                    class: "pull-right",
                    callback: function() {
                        // TODO implement this
                        console.log('open story add dialog');

                        return false;
                    }
                }
            ];

            // Open bootbox modal
            var modal = openBootboxDialog(title, content, buttons);

            // Add required class for backlog
            modal.addClass('modalBacklog');

            // Make form init when dialog is opened.
            modal.on('shown', function() {
                initProjectBacklog(modal);
            });
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Project phases edit event. This opens a modal dialog which contains all current project
     * phases. User can edit existing phases, add new ones and change phases order simply by
     * dragging them. All the phases are saved in "same" time.
     */
    body.on('phasesEdit', function(event) {
        jQuery.get('/Phase/edit', {id: ko.toJS(myViewModel.project().id())}, function(content) {
            var title = "Phases for project '" + ko.toJS(myViewModel.project().title()) + "'";
            var buttons = [
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function() {
                        var errors = false;
                        var lines = jQuery("#projectPhases", modal).find("tbody tr");

                        lines.each(function(key) {
                            var row = jQuery(this);
                            var title = jQuery.trim(row.find('input[name="title[]"]').val());
                            var tasks = parseInt(row.find('input[name="tasks[]"]').val(), 10);
                            var phaseId = parseInt(row.find('input[name="id[]"]').val(), 10);

                            if (title.length == 0) {
                                makeMessage('Phase name cannot be empty.', 'error', {});

                                row.addClass('error');

                                errors = true;
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
                                })
                                .done(function(/** models.rest.phase */phase) {
                                    var phaseObject = new Phase(phase);

                                    switch (type) {
                                        case 'POST':
                                            myViewModel.phases.push(phaseObject);

                                            if (myViewModel.sprint()) {
                                                // TODO: add phase story phases
                                            }
                                            break;
                                        case 'PUT':
                                            jQuery.each(myViewModel.phases(), function(key, phase) {
                                                if (phase.id() === phaseObject.id()) {
                                                    // Replace old phase model with new one
                                                    myViewModel.phases.replace(phase, phaseObject);
                                                }
                                            });

                                            if (myViewModel.sprint()) {
                                                // TODO: update phase story phases
                                            }
                                            break;
                                    }
                                })
                                .fail(function(jqXhr, textStatus, error) {
                                    errors = true;

                                    handleAjaxError(jqXhr, textStatus, error);
                                });
                            }
                        });

                        // All went just like in strömsö
                        if (errors === false) {
                            makeMessage('Project phases saved successfully.', 'success', {});

                            modal.modal('hide');
                        }

                        return false;
                    }
                },
                {
                    label: "Add new phase",
                    class: "pull-right",
                    callback: function() {
                        var newRow = jQuery('#projectPhasesNew', modal).find('tr').clone();
                        var slider = newRow.find('.slider');
                        var input = slider.next('input');
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
            ];

            // Open bootbox modal
            var modal = openBootboxDialog(title, content, buttons);

            // Make form init when dialog is opened.
            modal.on('shown', function() {
                initProjectPhases(modal);
            });
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
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
        jQuery.get('/Sprint/add', {projectId: ko.toJS(myViewModel.project().id())}, function(content) {
            var title = "Add sprint";
            var buttons = [
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formSprintNew');
                        var formItems = form.serializeJSON();

                        // Validate form and try to create new sprint
                        if (validateForm(formItems)) {
                            // Make POST query to server
                            jQuery.ajax({
                                type: 'POST',
                                url: "/sprint/",
                                data: formItems,
                                dataType: 'json'
                            })
                            .done(function(/** models.rest.sprint */sprint) {
                                makeMessage('New sprint added to project successfully.', 'success', {});

                                // Add inserted sprint to knockout model data
                                myViewModel.sprints.push(new Sprint(sprint));

                                // Update current project sprint dates
                                myViewModel.updateProjectSprintDates();

                                // Remove modal
                                modal.modal('hide');
                            })
                            .fail(function(jqXhr, textStatus, error) {
                                handleAjaxError(jqXhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                }
            ];

            // Open bootbox modal
            var modal = openBootboxDialog(title, content, buttons);

            // Make form init when dialog is opened.
            modal.on('shown', function() {
                initSprintForm(modal, false);
            });
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    body.on('sprintEdit', function() {
        // TODO: implement later
    });

    /**
     * User story add event, this opens a modal bootbox dialog with user story add
     * form on it.
     *
     * Note that this events requires projectId and sprintId parameters.
     */
    body.on('storyAdd', function(event, projectId, sprintId) {
        jQuery.get('/Story/add', {projectId: projectId, sprintId: sprintId}, function(content) {
            var title = "Add new user story";
            var buttons = [
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formStoryNew');
                        var formItems = form.serializeJSON();

                        // Validate form and try to create new user story
                        if (validateForm(formItems)) {
                            jQuery.ajax({
                                type: 'POST',
                                url: "/Story/",
                                data: formItems,
                                dataType: 'json'
                            })
                            .done(function(/** models.rest.story */story) {
                                makeMessage("User story created successfully.", "success", {});

                                // Add created story to knockout model data.
                                myViewModel.stories.push(new Story(story));

                                modal.modal('hide');
                            })
                            .fail(function(jqXhr, textStatus, error) {
                                handleAjaxError(jqXhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                }
            ];

            // Open bootbox modal
            var modal = openBootboxDialog(title, content, buttons);

            // Make form init when dialog is opened.
            modal.on('shown', function() {
                initStoryForm(modal, false);
            });
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });


    /**
     * Below is code that needs refactoring...
     */



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
                    callback: function() {
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
                    callback: function() {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formTaskEdit');
                        var formItems = form.serializeJSON();

                        if (validateForm(formItems)) {
                            jQuery.ajax({
                                type: "PUT",
                                url: "/task/" + taskData.id(),
                                data: formItems,
                                dataType: 'json'
                            }).done(function(/** models.task */task) {
                                // TODO: update model data

                                jQuery('div.bootbox').modal('hide');
                            })
                            .fail(function(jqxhr, textStatus, error) {
                                handleAjaxError(jqxhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    class: "btn-danger pull-right",
                    callback: function() {
                        bootbox.confirm(
                            "Are you sure of task delete?",
                            function(result) {
                                if (result) {
                                    jQuery.ajax({
                                        type: "DELETE",
                                        url: "/task/" + taskData.id(),
                                        dataType: 'json'
                                    }).done(function() {
                                        myViewModel.deleteTask(taskData.id(), taskData.phaseId(), taskData.storyId());
                                    })
                                    .fail(function(jqxhr, textStatus, error) {
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
                    callback: function() {
                    }
                },
                {
                    label: "Save",
                    class: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formStoryEdit');
                        var formItems = form.serializeJSON();

                        if (validateForm(formItems)) {
                            jQuery.ajax({
                                type: "PUT",
                                url: "/story/" + storyData.id(),
                                data: formItems,
                                dataType: 'json'
                            }).done(function(/** models.story */story) {
                                // TODO: update model data

                                jQuery('div.bootbox').modal('hide');
                            })
                            .fail(function(jqxhr, textStatus, error) {
                                handleAjaxError(jqxhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    class: "btn-danger pull-right",
                    callback: function() {
                        bootbox.confirm(
                            "Are you sure of story delete?",
                            function(result) {
                                if (result) {
                                    jQuery.ajax({
                                        type: "DELETE",
                                        url: "/story/" + storyData.id(),
                                        dataType: 'json'
                                    }).done(function() {
                                            myViewModel.deleteStory(storyData.id());
                                        })
                                        .fail(function(jqxhr, textStatus, error) {
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






});