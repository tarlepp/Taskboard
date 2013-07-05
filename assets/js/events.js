jQuery(document).ready(function() {
    var body = jQuery('body');

    // Task open event
    body.on('dblclick', '.task', function(event) {
        var data = ko.dataFor(this);

        console.log('implement task edit');
        console.log(ko.toJS(data));
    });

    // Story open event
    body.on('dblclick', '.story', function(event) {
        var data = ko.dataFor(this);

        console.log('implement story edit');
        console.log(ko.toJS(data));
    });
});