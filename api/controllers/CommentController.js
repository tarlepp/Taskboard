/**
 * CommentController
 *
 * @module      ::  Controller
 * @description ::  A set of functions called `actions`.
 *
 *                  Actions contain code telling Sails how to respond to a certain type of request.
 *                  (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                  You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                  and/or override them with custom routes (`config/routes.js`)
 *
 *                  NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        ::  http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to CommentController)
     */
    _config: {},

    /**
     * Main history action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    index: function(req, res) {
        var objectId = req.param("objectId");
        var objectName = req.param("objectName");

        // Fetch specified object and id comments
        DataService.getComments(objectName, objectId, 0, function(error, comments) {
            res.view({
                layout: req.isAjax ? "layout_ajax" : "layout",
                objectId: objectId,
                objectName: objectName,
                comments: comments
            });
        });
    }
};
