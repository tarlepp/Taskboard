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

    CommentController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    EpicController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    ExcludeSprintDayController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    ExternalLinkController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    FileController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    HistoryController: {
        '*':                false,
        'find':             ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':          ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':            ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':           false,
        'update':           false,
        'formattedHistory': ['passport', 'authenticated', 'isSocket']
    },

    LanguageController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'isAdmin', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'isAdmin', 'addDataUpdate']
    },

    LinkController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    MilestoneController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    PhaseController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    ProjectController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    ProjectUserController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    SprintController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    StoryController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    TaskController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    TaskTypeController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'addDataUpdate']
    },

    TimezoneController: {
        '*':        false,
        'index':    ['passport', 'authenticated', 'isSocket']
    },

    UserController: {
        '*':        false,
        'find':     ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':  ['passport', 'authenticated', 'isSocket', 'objectRight', 'isAdminOrUserItself'],
        'count':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':   ['passport', 'authenticated', 'isSocket', 'isAdmin', 'addDataCreate'],
        'update':   ['passport', 'authenticated', 'isSocket', 'isAdminOrUserItself', 'addDataUpdate']
    },

    UserLoginController: {
        '*':                    true,
        'find':                 ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'findOne':              ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'count':                ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'create':               false,
        'update':               false,
        'dataIp':               ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'dataAgent':            ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'dataBrowserFamily':    ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'dataOsFamily':         ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'countIp':              ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'countAgent':           ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'countBrowserFamily':   ['passport', 'authenticated', 'isSocket', 'objectRight'],
        'countOsFamily':        ['passport', 'authenticated', 'isSocket', 'objectRight']
    }
};
