/**
 * ValidatorController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
"use strict";

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ValidatorController)
     */
    _config: {
        blueprints: {
            actions: true,
            rest: false,
            shortcuts: false
        }
    },

    /**
     * isUnique action. This will check if given attribute is unique in
     * specified model.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    isUnique: function(request, response) {
        var id = request.param("id");
        var model = request.param("model");
        var search = request.param("search");

        // Model found
        if (global[model] && typeof global[model] === "object") {
            global[model]
                .find()
                .where(search)
                .done(function(error, data) {
                    if (error) {
                        ResponseService.makeError(error, request, response);
                    } else {
                        var output = false;

                        if (data.length === 0) {
                            output = true;
                        } else if (data[0].id == id) {
                            output = true;
                        }

                        response.json(output);
                    }
                });
        } else {
            var errorMessage = new Error();

            errorMessage.message = "Invalid model";
            errorMessage.status = 404;

            ResponseService.makeError(errorMessage, request, response);
        }
    },

    /**
     * passwordCheck action.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    passwordCheck: function(request, response) {
        var userId = parseInt(request.param("userId"), 10);
        var password = request.param("password");

        DataService.getUser(userId, function(error, user) {
            if (error) {
                ResponseService.makeError(error, request, response);
            } else {
                response.json(user.validPassword(password));
            }
        });
    }
};
