/**
 * Policies are simply Express middleware functions which run before your controllers.
 * You can apply one or more policies for a given controller or action.
 *
 * Any policy file (e.g. `authenticated.js`) can be dropped into the `/policies` folder,
 * at which point it can be accessed below by its filename, minus the extension, (e.g. `authenticated`)
 *
 * For more information on policies, check out:
 * http://sailsjs.org/#documentation
 */
module.exports.policies = {
    /**
     * By default require authentication always.
     *
     * see api/policies/authenticated.js
     */
    "*": "authenticated",

    // whitelist the auth controller, this is used for login
    "auth": {
        "*": true
    },

    // Project controller policies
    "Project": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "isAjaxOrSocket"], // Todo: try to figure out how to restrict access to all projects
        create:     ["authenticated", "isAjaxOrSocket"], // Todo: it is really good that every user can add new project?
        update:     ["authenticated", "isAjaxOrSocket", "hasProjectAdmin"],
        destroy:    ["authenticated", "isAjaxOrSocket", "hasProjectAdmin"],

        // Custom actions
        add:        ["authenticated", "isAjax"],
        edit:       ["authenticated", "isAjax", "hasProjectAccess"],
        backlog:    ["authenticated", "isAjax", "hasProjectAccess"],
        milestones: ["authenticated", "isAjax", "hasProjectAccess"],
        planning:   ["authenticated", "isAjax", "hasProjectAccess"],
        statistics: ["authenticated", "isAjax", "hasProjectAccess"]
    },

    // Phase controller policies
    "Phase": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "isAjaxOrSocket"],
        create:     ["authenticated", "isAjaxOrSocket", "hasPhaseAdmin"],
        update:     ["authenticated", "isAjaxOrSocket", "hasPhaseAdmin"],
        destroy:    ["authenticated", "isAjaxOrSocket", "hasPhaseAdmin"],

        // Custom actions
        edit:       ["authenticated", "isAjax", "hasProjectAdmin"]
    },

    // Sprint controller policies
    "Sprint": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "isAjaxOrSocket", "hasSprintAccess"],
        create:     ["authenticated", "isAjaxOrSocket", "hasSprintAdmin"],
        update:     ["authenticated", "isAjaxOrSocket", "hasSprintAdmin"],
        destroy:    ["authenticated", "isAjaxOrSocket", "hasSprintAdmin"],

        // Custom actions
        add:        ["authenticated", "isAjax", "hasSprintAdmin"],
        edit:       ["authenticated", "isAjax", "hasSprintAccess"],
        backlog:    ["authenticated", "isAjax", "hasSprintAccess"]
    },

    // Milestone controller policies
    "Milestone": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "isAjaxOrSocket", "hasMilestoneAccess"],
        create:     ["authenticated", "isAjaxOrSocket", "hasMilestoneAdmin"],
        update:     ["authenticated", "isAjaxOrSocket", "hasMilestoneAdmin"],
        destroy:    ["authenticated", "isAjaxOrSocket", "hasMilestoneAdmin"],

        // Custom actions
        add:        ["authenticated", "isAjax", "hasMilestoneAdmin"],
        edit:       ["authenticated", "isAjax", "hasMilestoneAccess"],
        stories:    ["authenticated", "isAjax", "hasMilestoneAccess"]
    },

    // Story controller policies
    "Story": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "isAjaxOrSocket", "hasStoryAccess"],
        create:     ["authenticated", "isAjaxOrSocket", "hasStoryAdmin"],
        update:     ["authenticated", "isAjaxOrSocket", "hasStoryAdmin"],
        destroy:    ["authenticated", "isAjaxOrSocket", "hasStoryAdmin"],

        // Custom actions
        add:        ["authenticated", "isAjax", "hasStoryAdmin"],
        split:      ["authenticated", "isAjax", "hasStoryAdmin"],
        edit:       ["authenticated", "isAjax", "hasStoryAccess"],
        tasks:      ["authenticated", "isAjax", "hasStoryAccess"]
    },

    // Task controller policies
    "Task": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "isAjaxOrSocket", "hasTaskAccess"],
        create:     ["authenticated", "isAjaxOrSocket", "hasTaskAdmin"],
        update:     ["authenticated", "isAjaxOrSocket", "hasTaskAdmin"],
        destroy:    ["authenticated", "isAjaxOrSocket", "hasTaskAdmin"],

        // Custom actions
        add:        ["authenticated", "isAjax", "hasTaskAdmin"],
        edit:       ["authenticated", "isAjax", "hasTaskAccess"]
    },

    // User controller policies
    "User": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "isAjaxOrSocket"],
        create:     ["authenticated", "isAjaxOrSocket", "hasUserAdmin"],
        update:     ["authenticated", "isAjaxOrSocket", "hasUserAdminOrItself"],
        destroy:    ["authenticated", "isAjaxOrSocket", "hasUserAdmin"],

        // Custom actions
        list:           ["authenticated", "isAjax", "hasUserAdmin"],
        add:            ["authenticated", "isAjax", "hasUserAdmin"],
        edit:           ["authenticated", "isAjax", "hasUserAdminOrItself"],
        history:        ["authenticated", "isAjax", "hasUserAdminOrItself"],
        projects:       ["authenticated", "isAjax", "hasUserAdminOrItself"],
        changePassword: ["authenticated", "isAjax", "hasUserAdminOrItself"]
    },

    // ProjectUser controller policies
    "ProjectUser": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "isAjaxOrSocket"],
        create:     ["authenticated", "isAjaxOrSocket", "hasProjectAdmin"],
        update:     ["authenticated", "isAjaxOrSocket", "hasProjectAdmin"],
        destroy:    ["authenticated", "isAjaxOrSocket", "hasProjectAdmin"],

        // Custom actions
        users:          ["authenticated", "isAjax", "hasProjectAccess"],
        availableUsers: ["authenticated", "isAjaxOrSocket", "hasProjectAccess"],
        ownProjects:    ["authenticated", "isAjaxOrSocket"],
        getRole:        ["authenticated", "isAjaxOrSocket", "hasProjectAccess"]
    },

    // Type controller policies
    "Type": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "isAjaxOrSocket"],
        create:     ["authenticated", "isAjaxOrSocket", "isAdministrator"],
        update:     ["authenticated", "isAjaxOrSocket", "isAdministrator"],
        destroy:    ["authenticated", "isAjaxOrSocket", "isAdministrator"]
    },

    // Type controller policies
    "Validator": {
        // By default do not allow nothing
        "*":            false,

        // Custom actions
        isUnique:       ["authenticated", "isAjax"],
        passwordCheck:  ["authenticated", "isAjax", "hasUserAdminOrItself"]
    }
};
