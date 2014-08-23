'use strict';

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
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */
module.exports.policies = {
    // Default policy for all controllers and actions
    '*': ['passport', 'authenticated'],

    AuthController: {
        '*':                ['passport'],
        'checkPassword':    ['passport', 'authenticated']
    },

    UserController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'isAdminOrUserItself'],
        'create':   ['passport', 'authenticated', 'isSocket', 'isAdmin', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'isAdminOrUserItself', 'addDataUpdate']
    },

    ProjectController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    SprintController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    }
};
