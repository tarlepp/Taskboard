'use strict';

/**
 * Generic object specified (row) policy. Policy is attached to all controllers which are accessible
 * via blueprints API and this policy will call object specified service method to mutate current
 * where object that way that it contains necessary right specified limit conditions.
 *
 * Implementation is pretty straightforward:
 *  1) Create new API
 *  2) Add API specified right checker to 'ObjectRight' service
 *  3) Implement that logic
 *  4) and there is all, happy coding
 *
 * Below is an example of structure of service method.
 *
 *  exports.makeObjectRight[ObjectName] = function(request, response, next) {
 *      // Parse where criteria
 *      var where = actionUtil.parseCriteria(request);
 *
 *      here do your stuff for where object, basically add your business logic
 *      checks here... Yes and those can be complicated - I know . good luck :D
 *
 *      // Remove existing query
 *      delete request.query;
 *
 *      // Set new query to request, that blueprints will use after this
 *      request.query = {
 *          where: where
 *      };
 *
 *      return next();
 *  };
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
    var method = 'makeObjectRightGet' + model.charAt(0).toUpperCase() + model.slice(1);

    // Yeah we found actual policy service function
    if (typeof sails.services['rightsget'][method] === 'function') {
        return sails.services['rightsget'][method](request, response, next);
    } else { // Oh noes, is this ok or not?
        var message = 'There is not object specified get right handling for \'' + model + '\' model. '
            + 'Please \'' + method + '\' method this to \'RightsGet\' service.'
        ;

        sails.log.warn(message);

        return next();
    }
};
