// api/policies/hasTaskAccess.js

/**
 * Policy to check if user has access to specified task or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasTaskAccess
 *  - hasStoryAccess
 *
 * Note that this policy relies one of following parameters are:
 *
 *  - id
 *  - sprintId
 *  - projectId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasTaskAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasTaskAccess.js");

    var taskId = parseInt(request.param("id"), 10);
    var storyId = parseInt(request.param("storyId"), 10);
    var where = request.param("where");

   if (!isNaN(taskId)) { // Story id found, check that user has access to it
        AuthService.hasTaskAccess(request.user, taskId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No access right to task
                response.send("Insufficient rights to access task.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(storyId) && storyId > 0) { // Check that current user has access to specified story
        AuthService.hasStoryAccess(request.user, storyId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No access right to story
                response.send("Insufficient rights to access task.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (where.or) { // We have multiple stories to check...
       // Iterate data, note I don't like this...
       _.each(where.or, function(data) {
           AuthService.hasStoryAccess(request.user, data.storyId, function(error, hasRight) {
               if (error) { // Error occurred
                   response.send(error, error.status ? error.status : 500);
               } else if (!hasRight) { // No access right to story
                   response.send("Insufficient rights to access task.", 403);
               }
           });
       });

       sails.log.verbose("          OK");

       next();
   } else {
        response.send("Cannot identify task.", 403);
    }
};

