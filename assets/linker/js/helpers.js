jQuery(document).ready(function() {
    // Bootstrap date picker fix with jQuery UI component
    jQuery.fn.bootstrapDP = jQuery.fn.datepicker.noConflict();

    /**
     * jQuery function to serialize forms to JSON objects. Usage example:
     *
     * console.log(jQuery('#yourForm').serializeJSON());
     *
     * @returns {{}}
     */
    jQuery.fn.serializeJSON = function() {
        var json = {};

        jQuery.map(jQuery(this).serializeArray(), function(n) {
            var _ = n.name.indexOf('[');

            if (_ > -1) {
                var o = json, _name;

                _name = n.name.replace(/\]/gi, '').split('[');

                for (var i = 0, len = _name.length; i < len; i++) {
                    if (i == len - 1) {
                        if (o[_name[i]]) {
                            if (typeof o[_name[i]] == 'string') {
                                o[_name[i]] = [o[_name[i]]];
                            }
                            o[_name[i]].push(n.value);
                        } else {
                            o[_name[i]] = n.value || '';
                        }
                    } else {
                        o = o[_name[i]] = o[_name[i]] || {};
                    }
                }
            } else {
                if (json[n.name] !== undefined) {
                    if (!json[n.name].push) {
                        json[n.name] = [json[n.name]];
                    }

                    json[n.name].push(n.value || '');
                } else {
                    json[n.name] = n.value || '';
                }
            }
        });

        return json;
    };

    /**
     * Generic html element type getter.
     *
     * @returns {String}
     */
    jQuery.fn.getType = function() {
        return this[0].tagName == "INPUT" ? jQuery(this[0]).attr("type").toLowerCase() : this[0].tagName.toLowerCase();
    };
});