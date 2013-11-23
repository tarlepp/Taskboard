// api/policies/isAjax.js

/**
 * Policy to check if current request is AJAX or not.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function isAjax(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/isAjax.js");

    if (request.isAjax) {
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
