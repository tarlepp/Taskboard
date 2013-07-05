jQuery(document).ready(function() {
    var body = jQuery('body');

    // Task open event
    body.on('dblclick', '.task', function(event) {
        var data = ko.dataFor(this);
        var source = jQuery('#task-form-edit').html();
        var template = Handlebars.compile(source);
        var templateData = jQuery.extend(
            {},
            ko.toJS(data),
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
                                url: "/task/" + data.id(),
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
                                console.log("confirm: " + result);
                            }
                        );

                        return false;
                    }
                }
            ],
            {
                header: "Edit task"
            }
        );

        modal.on('shown', function() {
            jQuery('input[name="title"]', modal).focus();
        });
    });

    // Story open event
    body.on('dblclick', '.story', function(event) {
        var data = ko.dataFor(this);

        console.log('implement story edit');
        console.log(ko.toJS(data));
    });
});