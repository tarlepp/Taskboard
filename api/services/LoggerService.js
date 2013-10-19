/**
 * /api/services/LogService.js
 *
 * Logger service.
 */
"use strict";

/**
 * Generic logger service method to write all necessary data of users
 * sign in action.
 *
 * @param   {sails.model.user}  user    User data
 */
exports.userSignIn = function(user) {
    var currentTime = new Date();

    // Update user row
    User
        .update(
            {id: user.id},
            {
                id: user.id,
                lastLogin: currentTime
            },
            function(error, user) {}
    );
};
