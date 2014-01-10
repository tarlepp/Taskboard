// api/policies/addUserDataUpdate.js

/**
 * Policy to set updatedUserId to body.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/addUserDataUpdate.js");

    if (!request.param("updatedUserId")) {
        request.body.updatedUserId = request.user.id;
    }

    next();
};