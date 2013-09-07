/**
 * HistoryController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */

module.exports = {
    /**
     * Main history action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    index: function(req, res) {
        var objectId = req.param('objectId');
        var objectName = req.param('objectName');

        // Todo implement actual functionality in next phase.
    }
};
