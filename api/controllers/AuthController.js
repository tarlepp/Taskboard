/**
 * AuthController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
"use strict";

module.exports = {
    /**
     * Action to check if user is authenticated or not. This action is called by Angular
     * application within every route to ensure that user has signed in. If not angular
     * will redirect user back to sign in page.
     *
     * Action will output user data as a JSON object if he / she is signed in to application
     * otherwise JSON output contains just 'false' and HTTP 401 headers are sent.
     *
     * @see /assets/js/application.js
     *
     * @param   {Request}   request
     * @param   {Response}  response
     * @constructor
     */
    Authenticated: function(request, response) {
        try {
            if (request.isAuthenticated()) {
                response.json(request.user, 200);
            } else {
                response.json(false, 401);
            }
        } catch (error) {
            sails.log.error(error);

            response.json(false, 401);
        }
    }
};
