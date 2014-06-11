'use strict';

/**
 * Policy to check that request is done via authenticated user. This policy uses existing
 * JWT tokens to validate that user is authenticated. If use is not authenticate policy
 * sends 401 response back to client.
 *
 * @param   {Request}   request
 * @param   {Response}  response
 * @param   {Function}  next
 * @returns {*}
 */
module.exports = function(request, response, next) {
    var token;

    // Yeah we got required 'authorization' header
    if (request.headers && request.headers.authorization) {
        var parts = request.headers.authorization.split(' ');

        if (parts.length == 2) {
            var scheme = parts[0],
                credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else {
            return response.json(401, {message: 'Format is Authorization: Bearer [token]'});
        }
    } else if (request.param('token')) { // JWT token sent by parameter
        token = request.param('token');

        // We delete the token from query and body to not mess with blueprints
        delete request.query.token;
        delete request.body.token;
    } else { // Otherwise request didn't contain required JWT token
        return response.json(401, {message: 'No Authorization header was found'});
    }

    // Verify JWT token via service
    tokenService.verifyToken(token, function(error, token) {
        if (error) {
            return response.json(401, {message: 'The token is not valid'});
        } else {
            request.token = token;

            return next();
        }
    });
};
