// api/policies/flashMessage.js
"use strict";

/**
 * Policy to check if flash messages are set from controllers.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call after policy is processed
 */
module.exports = function flashMessage(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/flashMessage.js");

    var session = request.session;

    /**
     * Setter method for flash messages. This will store message to session and it will
     * be shown in next request. Actual messages are shown via noty in client side.
     *
     * @param   {String}    message Message to show
     * @param   {String}    type    Message type, defaults to "success"
     * @param   {{}}        options Extra options for message
     */
    request.flash.message = function(message, type, options) {
        type = type || "success";
        options = options || {};

        // Store message to session
        request.session.messages.push({
            "message": message,
            "type": type,
            "options": options
        });
    };

    // Get messages from session or initialize message session
    var messages = session.messages || (session.messages = []);

    // Store current messages to res.locals so they can be accessed from views
    response.locals.flashMessages = (!messages.length) ? false : messages;

    // Clear existing messages from session
    request.session.messages = [];

    next();
};