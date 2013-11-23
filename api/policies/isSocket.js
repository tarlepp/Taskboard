// api/policies/isSocket.js

/**
 * Policy to check if current request is socket or not.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function isSocket(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/isSocket.js");

    if (request.isSocket) {
        next();
    } else {
        setTimeout(function() {
            /**
             * TODO make message which is been shown to current user only. Is there some
             *      "right" way to this kind of messaging?
             */
        }, 1000);

        return response.redirect("/");
    }
};
