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
"use strict";

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to CommentController)
     */
    _config: {},

    /**
     * Main history action. This will render object specified comment GUI where user
     * can view, reply and add new comments.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    index: function(request, response) {
        var objectId = request.param("objectId");
        var objectName = request.param("objectName");

        // Fetch specified object and id comments
        DataService.getComments(objectName, objectId, 0, function(error, comments) {
            if (error) {
                response.send(error.status ? error.status : 500, error.message ? error.message : error);
            } else {
                response.view({
                    objectId: objectId,
                    objectName: objectName,
                    comments: comments
                });
            }
        });
    }
};
