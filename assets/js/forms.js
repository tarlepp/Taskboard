/**
 * Generic form validation function.
 *
 * @param   {jQuery[]}  items
 *
 * @returns {boolean}
 */
function validateForm(items) {
    var valid = true;

    jQuery.each(items, function(key, item) {
        var input = jQuery('#' + key);
        var group = input.closest('.control-group');
        var value = jQuery.trim(input.val());

        if ((input.prop('required') && value == '')
            || (input.getType() == 'select' && value == '#')
        ) {
            group.addClass('error');

            valid = false;
        } else {
            group.removeClass('error');
        }
    });

    return valid;
}