/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!documentation/
 */
'use strict';

module.exports.policies = {
    // Default policy for all controllers and actions
    // (`true` allows public access)
    '*': ['Authenticated'],

    // whitelist the auth controller, this is used for login
    'Auth': {
        '*': true,

        'checkPassword': ['Authenticated']
    },
    'Board': {
        'index': true
    }
};
