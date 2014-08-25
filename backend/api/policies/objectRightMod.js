'use strict';

/**
 * Generic object add policy that can be used with every controller that uses
 * blueprints 'update' method. Note that each model has it own service method
 * to determine if user has right to add object or not.
 *
 * Actual right methods are listed in 'RightsMod' service, which are called
 * from here. Also not that this policy will generate warning if there is not
 * specified service method.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
module.exports = function(request, response, next) {
    sails.log.verbose(' POLICY - ' + __filename + ':' + __line);

    // Determine model and method name
    var model = request.options.model || request.options.controller;
    var method = 'makeObjectRightMod' + model.charAt(0).toUpperCase() + model.slice(1);

    // Yeah we found actual policy service function
    if (typeof sails.services['rightsmod'][method] === 'function') {
        return sails.services['rightsmod'][method](request, response, next);
    } else { // Oh noes, is this ok or not?
        var message = 'There is not object specified mod right handling for \'' + model + '\' model. '
                + 'Please \'' + method + '\' method this to \'RightsMod\' service.'
            ;

        sails.log.warn(message);

        return next();
    }
};
