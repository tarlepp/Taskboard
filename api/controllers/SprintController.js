/**
 * SprintController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
'use strict';

var _ = require('lodash');

module.exports = _.merge(_.cloneDeep(require('../services/BaseController')), {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to SprintController)
     */
    _config: {},

    /**
     * Subscribe action for Sprint model. This is kind a weird because I can't found any docs
     * about this expect gist link... Basically without this angularSails client side library
     * cannot subscribe to "listen" this model.
     *
     * @see     https://gist.github.com/Kuirak/11377550
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    subscribe: function(request, response) {
        if (request.isSocket) {
            Sprint.watch(request.socket);

            response.send(200);
        }
    }
});
