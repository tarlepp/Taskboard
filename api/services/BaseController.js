/**
 * BaseController.js
 *
 * Base controller for all sails.js controllers. This just contains some common code
 * that every controller uses
 */
'use strict';

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
    /**
     * Generic count action for controller.
     *
     * @param   {Request}   request
     * @param   {Response}  response
     */
    count: function(request, response) {
        var Model = actionUtil.parseModel(request);

        Model
            .count(actionUtil.parseCriteria(request))
            .exec(function found(error, count) {
                if (error) {
                    ResponseService.makeError(error, request, response);
                } else {
                    response.json({count: count});
                }
            });
    }
};
