'use strict';

/**
 * TimeZoneController
 *
 * @description :: Server-side logic for managing Timezones
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = {
    _config: {
        rest: false
    },

    /**
     * Default action for TimeZone controller. This will return array of objects that
     * contains all available timezones. Output format is following:
     *
     *  [
     *      {
     *          id: "Africa/Asmera"
     *          name: "Africa/Asmara"
     *      },
     *      {
     *          id: "Africa/Timbuktu"
     *          name: "Africa/Bamako"
     *      },
     *      ....
     *  ]
     *
     * Actual timezone data parsing is in DateService module.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    index: function(request, response) {
        response.json(200, sails.services['date'].getTimezones());
    }
};
