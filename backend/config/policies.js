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
   // '*': ['passport', 'authenticated'],

    AuthController: {
        '*':                ['passport'],
        'checkPassword':    ['passport', 'authenticated']
    },

    CommentController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    EpicController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    ExcludeSprintDayController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    ExternalLinkController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    FileController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    HistoryController: {
        '*':                false,
        'schema':           ['passport', 'authenticated', 'isSocket'],
        'find':             ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':          ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':            ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':           false,
        'update':           false,
        'formattedHistory': ['passport', 'authenticated', 'isSocket']
    },

    LanguageController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket'],
        'findOne':  ['passport', 'authenticated', 'isSocket'],
        'count':    ['passport', 'authenticated', 'isSocket'],
        'create':   ['passport', 'authenticated', 'isSocket', 'isAdmin', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'isAdmin', 'addDataUpdate']
    },

    LinkController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    MilestoneController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    PhaseController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    ProjectController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    ProjectUserController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    SprintController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    StoryController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    TaskController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    TaskTypeController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'objectRightAdd', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'objectRightMod', 'addDataUpdate']
    },

    TimezoneController: {
        '*':        false,
        'index':    ['passport', 'authenticated', 'isSocket']
    },

    UserController: {
        '*':        false,
        'schema':   ['passport', 'authenticated', 'isSocket'],
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRightGet', 'isAdminOrUserItself'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':   ['passport', 'authenticated', 'isSocket', 'isAdmin', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'isAdminOrUserItself', 'addDataUpdate']
    },

    UserLoginController: {
        '*':                    true,
        'schema':               ['passport', 'authenticated', 'isSocket'],
        'find':                 ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'findOne':              ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'count':                ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'create':               false,
        'update':               false,
        'dataIp':               ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'dataAgent':            ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'dataBrowserFamily':    ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'dataOsFamily':         ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'countIp':              ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'countAgent':           ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'countBrowserFamily':   ['passport', 'authenticated', 'isSocket', 'objectRightGet'],
        'countOsFamily':        ['passport', 'authenticated', 'isSocket', 'objectRightGet']
    }
};
