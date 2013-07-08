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
        var templateData = jQuery.extend(
            {},
            ko.toJS(storyData),
            {
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
            var inputTitle = jQuery('input[name="title"]', modal);

            inputTitle.focus().val(inputTitle.val());

            jQuery('textarea', modal).autosize();
        });
    });
});