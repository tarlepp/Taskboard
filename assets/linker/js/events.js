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
            jQuery('#boardContent').show();
        } else {
            jQuery('#boardContent').hide();
        }

        if (initNavigationDone) {
            jQuery('#navigation').show();
        } else {
            jQuery('#navigation').hide();
        }
    });

    // Task open event
    body.on('dblclick', '.task', function() {
        var data = ko.dataFor(this);

        body.trigger('taskEdit', [data]);
    });

    // Story open event
    body.on('dblclick', '.story', function() {
        var data = ko.dataFor(this);

        body.trigger('storyEdit', [data.id()]);
    });

    // Help click event
    jQuery('#functionHelp').on('click', 'a', function() {
        var title = "Generic help";

        // create bootbox modal
        var modal = createBootboxDialog(title, JST["assets/linker/templates/help_generic.html"](), null, false);

        // Add help class and show help modal
        modal.addClass('modalHelp');
        modal.modal('show');
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
                className: "btn-primary pull-right",
                callback: function() {
                    var form = jQuery('#formProjectNew', modal);
                    var formItems = form.serializeJSON();

                    // Validate form and try to create new project
                    if (validateForm(formItems, modal)) {
                        // Create new project
                        socket.post('/Project', formItems, function(/** sails.json.project */data) {
                            if (handleSocketError(data)) {
                                makeMessage('Project created successfully.', 'success', {});

                                modal.modal('hide');

                                // Update client bindings
                                myViewModel.projects.push(new Project(data));
                            }
                        });
                    }

                    return false;
                }
            };

            // Open bootbox modal
            var modal = createBootboxDialog(title, content, buttons, false);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initProjectForm(modal, false);
            });

            modal.modal('show');
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
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formProjectEdit', modal);
                        var formItems = form.serializeJSON();

                        // Validate form and try to update project data
                        if (validateForm(formItems, modal)) {
                            // Update project data
                            socket.put(
                                '/Project/'  + ko.toJS(myViewModel.project().id()),
                                formItems,
                                function(/** sails.json.project */data) {
                                    if (handleSocketError(data)) {
                                        makeMessage('Project updated successfully.', 'success', {});

                                        modal.modal('hide');

                                        // Update client bindings
                                        var project = _.find(myViewModel.projects(), function(project) {
                                            return project.id() === data.id;
                                        });

                                        if (typeof project !== 'undefined') {
                                            myViewModel.projects.replace(project, new Project(data));
                                        }
                                    }
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    className: "btn-danger pull-right",
                    callback: function() {
                        // TODO implement this
                        console.log('implement project delete');

                        return false;
                    }
                }
            ];

            // Open bootbox modal
            var modal = createBootboxDialog(title, content, buttons, false);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initProjectForm(modal, true);
            });

            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    // TODO
    body.on('projectBacklog', function() {
        console.log("Implement project backlog.");
    });

    /**
     * Project planning event, this opens a modal bootbox dialog with project backlog view on it.
     * In this dialog user can prioritize user stories and assign them to existing sprints or move
     * them back to backlog.
     */
    body.on('projectPlanning', function() {
        jQuery.get('/Project/planning', {id: ko.toJS(myViewModel.project().id())}, function(content) {
            var title = 'Project planning view';
            var buttons = [
                {
                    label: "Add new sprint",
                    className: "btn-primary pull-right",
                    callback: function() {
                        modal.modal('hide');

                        jQuery('body').trigger('sprintAdd', ['projectPlanning']);

                        return false;
                    }
                },
                {
                    label: "Add new story",
                    className: "btn-primary pull-right",
                    callback: function() {
                        modal.modal('hide');

                        jQuery('body').trigger('storyAdd', [myViewModel.project().id(), 0, 'projectPlanning']);

                        return false;
                    }
                }
            ];

            // Open bootbox modal
            var modal = createBootboxDialog(title, content, buttons, false);

            // Add required class for backlog
            modal.addClass('modalBacklog');

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initProjectPlanning(modal);
            });

            modal.on('click', 'i.event', function(event) {
                event.preventDefault();

                var element = jQuery(this);
                var id = element.data('id');
                var trigger = element.data('type') + "Edit";

                body.trigger(trigger, [id, 'projectPlanning']);

                modal.modal('hide');
            });

            modal.modal('show');
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
    body.on('phasesEdit', function() {
        jQuery.get('/Phase/edit', {id: ko.toJS(myViewModel.project().id())}, function(content) {
            var title = "Phases for project '" + ko.toJS(myViewModel.project().title()) + "'";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var errors = false;
                        var lines = jQuery("#projectPhases", modal).find("tbody tr");
                        var phases = [];

                        lines.each(function(key) {
                            var row = jQuery(this);
                            var title = jQuery.trim(row.find('input[name="title[]"]').val());
                            var isDone = row.find('input[name="isDone[]"]').is(':checked') ? 1 : 0;
                            var tasks = parseInt(row.find('input[name="tasks[]"]').val(), 10);
                            var phaseId = parseInt(row.find('input[name="id[]"]').val(), 10);

                            if (title.length == 0) {
                                makeMessage('Phase name cannot be empty.', 'error', {});

                                row.addClass('has-error');

                                errors = true;
                            } else {
                                row.removeClass('has-error');

                                var phaseData = {
                                    title: title,
                                    order: key,
                                    tasks: isNaN(tasks) ? 0 : tasks,
                                    isDone: isDone,
                                    projectId: ko.toJS(myViewModel.project().id())
                                };

                                if (isNaN(phaseId)) {
                                    socket.post('/Phase', phaseData, function(/** sails.json.phase */data) {
                                        if (handleSocketError(data)) {
                                            // Update client bindings
                                            myViewModel.phases.push(new Phase(data));

                                            phases.push(true);

                                            checkData();
                                        } else {
                                            errors = true;
                                        }
                                    });
                                } else {
                                    // Update project data
                                    socket.put('/Phase/'  + phaseId, phaseData, function(/** sails.json.phase */data) {
                                        if (handleSocketError(data)) {
                                            // Update client bindings
                                            var phase = _.find(myViewModel.phases(), function(phase) {
                                                return phase.id() === data.id;
                                            });

                                            if (typeof phase !== 'undefined') {
                                                myViewModel.phases.replace(phase, new Phase(data));
                                            }

                                            phases.push(true);

                                            checkData();
                                        } else {
                                            errors = true;
                                        }
                                    });
                                }
                            }
                        });

                        function checkData() {
                            var ready = true;

                            if (lines.length === phases.length) {
                                jQuery.each(phases, function(key, value) {
                                    if (value !== true) {
                                        ready = false;
                                    }
                                });
                            } else {
                                ready = false;
                            }

                            if (ready && errors === false) {
                                makeMessage('Project phases saved successfully.', 'success', {});

                                modal.modal('hide');
                                body.trigger('phasesEdit');
                            }
                        }

                        return false;
                    }
                },
                {
                    label: "Add new phase",
                    className: "btn-primary pull-right",
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
            var modal = createBootboxDialog(title, content, buttons, false);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initProjectPhases(modal);
            });

            modal.modal('show');
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
    body.on('sprintAdd', function(event, trigger) {
        trigger = trigger || false;

        jQuery.get('/Sprint/add', {projectId: ko.toJS(myViewModel.project().id())}, function(content) {
            var title = "Add sprint";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formSprintNew', modal);
                        var formItems = form.serializeJSON();

                        // Validate form and try to create new sprint
                        if (validateForm(formItems, modal)) {
                            // Create new sprint
                            socket.post('/Sprint', formItems, function(/** sails.json.sprint */data) {
                                if (handleSocketError(data)) {
                                    makeMessage('New sprint added to project successfully.', 'success', {});

                                    modal.modal('hide');

                                    // Update client bindings
                                    myViewModel.sprints.push(new Sprint(data));

                                    if (trigger) {
                                        body.trigger(trigger)
                                    }
                                }
                            });
                        }

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initSprintForm(modal, false);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * This event handles sprint edit functionality. Basically event triggers
     * modal dialog for editing currently selected sprint, form validation and
     * actual PUT query to server after form data is validated.
     *
     * After PUT query knockout data is updated.
     */
    body.on('sprintEdit', function(event, sprintId, trigger) {
        sprintId = sprintId || myViewModel.sprint().id();
        trigger = trigger || false;

        jQuery.get('/Sprint/edit', {id: sprintId}, function(content) {
            var title = "Edit sprint";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formSprintEdit', modal);
                        var formItems = form.serializeJSON();

                        // Validate form and try to create new sprint
                        if (validateForm(formItems, modal)) {
                            // Update sprint data
                            socket.put('/Sprint/' + sprintId, formItems, function(/** sails.json.sprint */data) {
                                if (handleSocketError(data)) {
                                    makeMessage('Sprint saved successfully.', 'success', {});

                                    modal.modal('hide');

                                    // Update client bindings
                                    var sprint = _.find(myViewModel.sprints(), function(sprint) {
                                        return sprint.id() === data.id;
                                    });

                                    if (typeof sprint !== 'undefined') {
                                        myViewModel.sprints.replace(sprint, new Sprint(data));
                                    }

                                    if (trigger) {
                                        body.trigger(trigger)
                                    }
                                }
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    className: "btn-danger pull-right",
                    callback: function() {
                        body.trigger('sprintDelete', [sprintId, {event: 'sprintEdit', parameters: [sprintId, trigger]}])
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initSprintForm(modal, true);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    body.on('sprintDelete', function(event, sprintId, trigger) {
        trigger = (trigger && trigger.event) ? trigger : false;

        bootbox.confirm({
            title: 'danger - danger - danger',
            message: 'Are you sure of sprint delete? Existing user stories in this sprint are moved to project backlog.',
            buttons: {
                'cancel': {
                    className: 'btn-default pull-left'
                },
                'confirm': {
                    label: 'Delete',
                    className: 'btn-danger pull-right'
                }
            },
            callback: function(result) {
                if (result) {
                    // Delete sprint data
                    socket.delete('/Sprint/' + sprintId, function(data) {
                        if (handleSocketError(data)) {
                            makeMessage("Sprint deleted successfully.", "success", {});

                            var sprint = _.find(myViewModel.sprints(), function(sprint) {
                                return sprint.id() === data.id;
                            });

                            if (typeof sprint !== 'undefined') {
                                myViewModel.sprints.remove(sprint);
                            }

                            // If sprint is currently selected => reset sprint data
                            if (myViewModel.sprint().id() === data.id) {
                                myViewModel.resetSprint();
                            }

                            if (trigger) {
                                body.trigger(trigger.event, trigger.parameters)
                            }
                        }
                    });
                } else {
                    if (trigger) {
                        body.trigger(trigger.event, trigger.parameters)
                    }
                }
            }
        });
    });

    /**
     * User story add event, this opens a modal bootbox dialog with user story add
     * form on it.
     *
     * Note that this events requires projectId and sprintId parameters.
     */
    body.on('storyAdd', function(event, projectId, sprintId, trigger) {
        trigger = trigger || false;

        jQuery.get('/Story/add', {projectId: projectId, sprintId: sprintId}, function(content) {
            var title = "Add new user story";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formStoryNew', modal);
                        var formItems = form.serializeJSON();

                        // Validate form and try to create new user story
                        if (validateForm(formItems, modal)) {
                            // Create new user story
                            socket.post('/Story', formItems, function(/** sails.json.story */data) {
                                if (handleSocketError(data)) {
                                    makeMessage('User story created successfully.', 'success', {});

                                    modal.modal('hide');

                                    if (trigger) {
                                        body.trigger(trigger)
                                    }

                                    // Update client bindings
                                    myViewModel.stories.push(new Story(data));
                                }
                            });
                        }

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initStoryForm(modal, false);
            });

            // Open bootbox modal
            modal.modal('show')
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * User story edit event, this opens a modal bootbox dialog with user story edit
     * form on it.
     */
    body.on('storyEdit', function(event, storyId, trigger) {
        trigger = trigger || false;

        jQuery.get('/Story/edit', {id: storyId}, function(content) {
            var title = "Edit user story";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formStoryEdit', modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to update user story data
                        if (validateForm(formItems, modal)) {
                            // Update user story
                            socket.put('/Story/' + storyId, formItems, function(/** sails.json.story */data) {
                                if (handleSocketError(data)) {
                                    makeMessage('User story updated successfully.', 'success', {});

                                    modal.modal('hide');

                                    handleEventTrigger(trigger);

                                    // Update client bindings
                                    var story = _.find(myViewModel.stories(), function(story) {
                                        return story.id() === data.id;
                                    });

                                    if (typeof story !== 'undefined') {
                                        myViewModel.stories.replace(story, new Story(data));
                                    }
                                }
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Split story",
                    className: "btn-warning pull-right",
                    id: "split",
                    callback: function() {
                        var options = [];

                        options.push({value: 0, text: 'Project backlog'});

                        jQuery.each(myViewModel.sprints(), function(key, sprint) {
                            options.push({value: sprint.id(), text: sprint.formattedTitle()});
                        });

                        var prompt = bootbox.prompt({
                            title: "Select sprint where to add new story",
                            buttons: {
                                'cancel': {
                                    label: 'close',
                                    className: 'btn-default pull-left'
                                },
                                'confirm': {
                                    label: 'Split story',
                                    className: 'btn-primary pull-right'
                                }
                            },
                            inputType: "select",
                            options: options,
                            callback: function(result) {
                                if (result !== null) {
                                    jQuery.ajax({
                                        type: 'POST',
                                        url: "/Story/split",
                                        data: {
                                            storyId: storyId,
                                            sprintId: result,
                                            projectId: myViewModel.project().id()
                                        },
                                        dataType: 'json'
                                    })
                                    .done(function(data) {
                                        makeMessage("User story splitted successfully.", "success", {});

                                        prompt.modal('hide');

                                        body.trigger('storyEdit', [storyId, trigger]);

                                        // Update client bindings
                                        var story = _.find(myViewModel.stories(), function(story) {
                                            return story.id() === data.storyOld.id;
                                        });

                                        if (typeof story !== 'undefined') {
                                            myViewModel.stories.replace(story, new Story(data.storyOld));
                                        }

                                        if (data.storyNew.sprintId === myViewModel.sprint().id()) {
                                            myViewModel.stories.push(new Story(data.storyNew))
                                        }

                                        // TODO remember to update task data!
                                    })
                                    .fail(function(jqXhr, textStatus, error) {
                                        handleAjaxError(jqXhr, textStatus, error);
                                    });

                                    return false;
                                } else {
                                    prompt.modal('hide');

                                    body.trigger('storyEdit', [storyId, trigger]);
                                }

                                return false;
                            }
                        });
                    }
                },
                {
                    label: "Delete",
                    className: "btn-danger pull-right",
                    callback: function() {
                        bootbox.confirm({
                            title: 'danger - danger - danger',
                            message: 'Are you sure of story delete?',
                            buttons: {
                                'cancel': {
                                    className: 'btn-default pull-left'
                                },
                                'confirm': {
                                    label: 'Delete',
                                        className: 'btn-danger pull-right'
                                }
                            },
                            callback: function(result) {
                                if (result) {
                                    // Delete story data
                                    socket.delete('/Story/' + storyId, function(data) {
                                        if (handleSocketError(data)) {
                                            makeMessage("User story deleted successfully.", "success", {});

                                            if (trigger) {
                                                body.trigger(trigger.event, trigger.parameters)
                                            }

                                            var story = _.find(myViewModel.stories(), function(story) {
                                                return story.id() === data.id;
                                            });

                                            if (typeof story !== 'undefined') {
                                                myViewModel.stories.remove(story);
                                            }
                                        }
                                    });
                                } else {
                                    body.trigger('storyEdit', [storyId, trigger]);
                                }
                            }
                        });
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initStoryForm(modal, true);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * User story edit event, this opens a modal bootbox dialog with user story edit
     * form on it.
     */
    body.on('storyDelete', function(event, storyId, trigger) {
        trigger = trigger || false;

        // Make confirm box
        bootbox.confirm({
            title: 'danger - danger - danger',
            message: 'Are you sure of story delete?',
            buttons: {
                'cancel': {
                    className: 'btn-default pull-left'
                },
                'confirm': {
                    label: 'Delete',
                    className: 'btn-danger pull-right'
                }
            },
            callback: function(result) {
                if (result) {
                    // Delete story data
                    socket.delete('/Story/' + storyId, function(data) {
                        if (handleSocketError(data)) {
                            makeMessage("User story deleted successfully.", "success", {});

                            if (trigger) {
                                body.trigger(trigger.event, trigger.parameters)
                            }

                            var story = _.find(myViewModel.stories(), function(story) {
                                return story.id() === data.id;
                            });

                            if (typeof story !== 'undefined') {
                                myViewModel.stories.remove(story);
                            }
                            handleEventTrigger(trigger);
                        }
                    });
                } else {
                    handleEventTrigger(trigger);
                }
            }
        });
    });

    body.on('storySplit', function(event, storyId, trigger) {
        trigger = trigger || false;

        var options = [];

        options.push({value: 0, text: 'Project backlog'});

        // Iterate project sprints and add those to option lists
        jQuery.each(myViewModel.sprints(), function(key, sprint) {
            options.push({value: sprint.id(), text: sprint.formattedTitle()});
        });

        // Make prompt box
        var prompt = bootbox.prompt({
            title: "Select sprint where to add new story",
            buttons: {
                'cancel': {
                    label: 'close',
                    className: 'btn-default pull-left'
                },
                'confirm': {
                    label: 'Split story',
                    className: 'btn-primary pull-right'
                }
            },
            inputType: "select",
            options: options,
            callback: function(result) {
                if (result !== null) {
                    jQuery.ajax({
                        type: 'POST',
                        url: "/Story/split",
                        data: {
                            storyId: storyId,
                            sprintId: result,
                            projectId: myViewModel.project().id()
                        },
                        dataType: 'json'
                    })
                    .done(function(data) {
                        makeMessage("User story splitted successfully.", "success", {});

                        prompt.modal('hide');

                        handleEventTrigger(trigger);

                        // Update client bindings
                        var story = _.find(myViewModel.stories(), function(story) {
                            return story.id() === data.storyOld.id;
                        });

                        if (typeof story !== 'undefined') {
                            myViewModel.stories.replace(story, new Story(data.storyOld));
                        }

                        if (data.storyNew.sprintId === myViewModel.sprint().id()) {
                            myViewModel.stories.push(new Story(data.storyNew))
                        }

                        // TODO remember to update task data!
                    })
                    .fail(function(jqXhr, textStatus, error) {
                        handleAjaxError(jqXhr, textStatus, error);
                    });
                    return false;
                } else {
                    prompt.modal('hide');

                    handleEventTrigger(trigger);
                }

                return false;
            }
        });
    });

    /**
     * Task add event, this opens a modal bootbox dialog with task add
     * form on it.
     *
     * Note that this event requires knockout story model in parameters.
     */
    body.on('taskAdd', function(event, story) {
        jQuery.get('/Task/add', {projectId: story.projectId(), storyId: story.id()}, function(content) {
            var title = "Add new task to story '" + ko.toJS(story.title()) + "'";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formTaskNew', modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to create new task
                        if (validateForm(formItems, modal)) {
                            // Create new task
                            socket.post('/Task', formItems, function(/** sails.json.task */data) {
                                if (handleSocketError(data)) {
                                    makeMessage('Task created successfully.', 'success', {});

                                    modal.modal('hide');

                                    // Update client bindings
                                    myViewModel.tasks.push(new Task(data));
                                }
                            });
                        }

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, false);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initTaskForm(modal, false);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Task edit event, this opens a modal bootbox dialog with task edit
     * form on it.
     */
    body.on('taskEdit', function(event, task) {
        jQuery.get('/Task/edit', {id: task.id()}, function(content) {
            var title = "Edit task";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formTaskEdit', modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to update task data
                        if (validateForm(formItems, modal)) {
                            // Update task data
                            socket.put('/Task/'  + task.id(), formItems, function(/** sails.json.task */data) {
                                if (handleSocketError(data)) {
                                    makeMessage("Task updated successfully.", "success", {});

                                    modal.modal('hide');

                                    // Update client bindings
                                    var task = _.find(myViewModel.tasks(), function(task) {
                                        return task.id() === data.id;
                                    });

                                    if (typeof task !== 'undefined') {
                                        myViewModel.tasks.replace(task, new Task(data));
                                    }
                                }
                            });
                        }

                        return false;
                    }
                },
                {
                    label: "Delete",
                    className: "btn-danger pull-right",
                    callback: function() {
                        bootbox.confirm({
                            title: 'danger - danger - danger',
                            message: 'Are you sure of task delete?',
                            buttons: {
                                'cancel': {
                                    className: 'btn-default pull-left'
                                },
                                'confirm': {
                                    label: 'Delete',
                                    className: 'btn-danger pull-right'
                                }
                            },
                            callback: function(result) {
                                if (result) {
                                    // Delete task data
                                    socket.delete('/Task/' + task.id(), function(data) {
                                        if (handleSocketError(data)) {
                                            makeMessage("Task deleted successfully.", "success", {});

                                            var task = _.find(myViewModel.tasks(), function(task) {
                                                return task.id() === data.id;
                                            });

                                            if (typeof task !== 'undefined') {
                                                myViewModel.tasks.remove(task);
                                            }
                                        }
                                    });
                                } else {
                                    body.trigger('taskEdit', [task]);
                                }
                            }
                        });
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, false);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initTaskForm(modal, true);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Project milestone list event. This opens a modal dialog which contains all current project
     * milestones. User can edit existing milestones, add new ones, change existing milestones, add
     * stories to milestones and edit stories which are attached to milestone.
     */
    body.on('milestoneList', function(event, projectId) {
        // If projectId parameter not given select current project id
        if (!projectId) {
            projectId = myViewModel.selectedProjectId();
        }

        // Fetch milestone list data from server
        jQuery.get('/Milestone/list', {projectId: projectId}, function(content) {
            var title = "Project milestones";

            // Specify modal buttons
            var buttons = [
                {
                    label: "Add new milestone",
                    className: "btn-primary pull-right",
                    callback: function() {
                        modal.modal('hide');

                        jQuery('body').trigger('milestoneAdd', [projectId, 'milestoneList']);

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog (title, content, buttons, false);

            // Make init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initMilestoneList(modal);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    /**
     * Milestone add event. This opens a modal dialog with milestone add form.
     */
    body.on('milestoneAdd', function(event, projectId, trigger) {
        jQuery.get('/Milestone/add', {projectId: projectId}, function(content) {
            var title = "Add new milestone";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function () {
                        var form = jQuery('#formMilestoneNew', modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to create new task
                        if (validateForm(formItems, modal)) {
                            jQuery.ajax({
                                type: 'POST',
                                url: "/Milestone/",
                                data: formItems,
                                dataType: 'json'
                            })
                            .done(function(/** models.rest.milestone */milestone) {
                                makeMessage("Milestone created successfully.", "success", {});

                                modal.modal('hide');

                                if (trigger) {
                                    body.trigger(trigger)
                                }
                            })
                            .fail(function(jqXhr, textStatus, error) {
                                handleAjaxError(jqXhr, textStatus, error);
                            });
                        }

                        return false;
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initMilestoneForm(modal, false);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    body.on('milestoneEdit', function(event, milestoneId, trigger) {
        jQuery.get('/Milestone/edit', {id: milestoneId}, function(content) {
            var title = "Edit milestone";
            var buttons = [
                {
                    label: "Save",
                    className: "btn-primary pull-right",
                    callback: function() {
                        var form = jQuery('#formMilestoneEdit', modal);
                        var formItems = form.serializeJSON();

                        // Validate current form items and try to update milestone data
                        if (validateForm(formItems, modal)) {
                            jQuery.ajax({
                                type: "PUT",
                                url: "/Milestone/" + milestoneId,
                                data: formItems,
                                dataType: 'json'
                            })
                            .done(function(/** models.rest.milestone */milestone) {
                                makeMessage("Milestone updated successfully.", "success", {});

                                modal.modal('hide');

                                if (trigger) {
                                    body.trigger(trigger)
                                }
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
                    className: "btn-danger pull-right",
                    callback: function() {
                        modal.modal('hide');

                        bootbox.confirm({
                            title: 'danger - danger - danger',
                            message: 'Are you sure of milesone delete?',
                            buttons: {
                                'cancel': {
                                    className: 'btn-default pull-left'
                                },
                                'confirm': {
                                    label: 'Delete',
                                    className: 'btn-danger pull-right'
                                }
                            },
                            callback: function(result) {
                                if (result) {
                                    jQuery.ajax({
                                        type: "DELETE",
                                        url: "/milestone/" + milestoneId,
                                        dataType: 'json'
                                    })
                                        .done(function() {
                                            makeMessage("Milestone deleted successfully.", "success", {});

                                            jQuery('body').trigger(trigger);
                                        })
                                        .fail(function(jqXhr, textStatus, error) {
                                            handleAjaxError(jqXhr, textStatus, error);
                                        });
                                } else {
                                    jQuery('body').trigger('milestoneEdit', [milestoneId, trigger]);
                                }
                            }
                        });
                    }
                }
            ];

            // Create bootbox modal
            var modal = createBootboxDialog(title, content, buttons, trigger);

            // Make form init when dialog is opened.
            modal.on('shown.bs.modal', function() {
                initMilestoneForm(modal, true);
            });

            // Open bootbox modal
            modal.modal('show');
        })
        .fail(function(jqXhr, textStatus, error) {
            handleAjaxError(jqXhr, textStatus, error);
        });
    });

    body.on('milestoneDelete', function(event, milestoneId, trigger) {
        bootbox.confirm({
            title: 'danger - danger - danger',
            message: 'Are you sure of milesone delete?',
            buttons: {
                'cancel': {
                    className: 'btn-default pull-left'
                },
                'confirm': {
                    label: 'Delete',
                    className: 'btn-danger pull-right'
                }
            },
            callback: function(result) {
                if (result) {
                    jQuery.ajax({
                        type: "DELETE",
                        url: "/milestone/" + milestoneId,
                        dataType: 'json'
                    })
                    .done(function() {
                        makeMessage("Milestone deleted successfully.", "success", {});

                        jQuery('body').trigger(trigger);
                    })
                    .fail(function(jqXhr, textStatus, error) {
                        handleAjaxError(jqXhr, textStatus, error);
                    });
                } else {
                    jQuery('body').trigger(trigger);
                }
            }
        });
    });
});
