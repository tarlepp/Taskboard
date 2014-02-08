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
    "*": ["flashMessage", "authenticated"],

    // whitelist the auth controller, this is used for login
    "auth": {
        "*": true,

        // Custom actions
        login:          ["flashMessage"],
        logout:         [true],
        authenticate:   [true]
    },

    // Project controller policies
    "Project": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAdmin"],

        // Custom actions
        add:        ["flashMessage", "authenticated", "isAjax"],
        edit:       ["flashMessage", "authenticated", "isAjax", "hasProjectAccess"],
        backlog:    ["flashMessage", "authenticated", "isAjax", "hasProjectAccess"],
        milestones: ["flashMessage", "authenticated", "isAjax", "hasProjectAccess"],
        planning:   ["flashMessage", "authenticated", "isAjax", "hasProjectAccess"],
        statistics: ["flashMessage", "authenticated", "isAjax", "hasProjectAccess"],
        sprints:    ["flashMessage", "authenticated", "isAjax", "hasProjectAccess"]
    },

    // Phase controller policies
    "Phase": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasPhaseAdmin", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasPhaseAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasPhaseAdmin"],

        // Custom actions
        edit:       ["flashMessage", "authenticated", "isAjax", "hasProjectAdmin"]
    },

    // Sprint controller policies
    "Sprint": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket", "hasSprintAccess"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasSprintAdmin", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasSprintAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasSprintAdmin"],

        // Custom actions
        add:            ["flashMessage", "authenticated", "isAjax", "hasSprintAdmin"],
        edit:           ["flashMessage", "authenticated", "isAjax", "hasSprintAccess"],
        backlog:        ["flashMessage", "authenticated", "isAjax", "hasSprintAccess"],
        charts:         ["flashMessage", "authenticated", "isAjax", "hasSprintAccess"],
        chartDataTasks: ["flashMessage", "authenticated", "isAjax", "hasSprintAccess"]
    },

    // Milestone controller policies
    "Milestone": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket", "hasMilestoneAccess"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasMilestoneAdmin", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasMilestoneAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasMilestoneAdmin"],

        // Custom actions
        add:        ["flashMessage", "authenticated", "isAjax", "hasMilestoneAdmin"],
        edit:       ["flashMessage", "authenticated", "isAjax", "hasMilestoneAccess"],
        stories:    ["flashMessage", "authenticated", "isAjax", "hasMilestoneAccess"]
    },

    // Story controller policies
    "Story": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket", "hasStoryAccess"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasStoryAdmin", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasStoryAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasStoryAdmin"],

        // Custom actions
        add:        ["flashMessage", "authenticated", "isAjax", "hasStoryAdmin"],
        split:      ["flashMessage", "authenticated", "isAjax", "hasStoryAdmin"],
        edit:       ["flashMessage", "authenticated", "isAjax", "hasStoryAccess"],
        tasks:      ["flashMessage", "authenticated", "isAjax", "hasStoryAccess"]
    },

    // Task controller policies
    "Task": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket", "hasTaskAccess"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasTaskAdmin", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasTaskAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasTaskAdmin"],

        // Custom actions
        add:        ["flashMessage", "authenticated", "isAjax", "hasTaskAdmin"],
        edit:       ["flashMessage", "authenticated", "isAjax", "hasTaskAccess"],
        statistics: ["flashMessage", "authenticated", "isAjax", "hasTaskAccess"],
        releaseTask:["flashMessage", "authenticated", "isAjax", "hasTaskAccess"],
        takeTask:   ["flashMessage", "authenticated", "isAjax", "hasTaskAccess"]
    },

    // User controller policies
    "User": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasUserAdmin", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasUserAdminOrItself", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasUserAdmin"],

        // Custom actions
        list:           ["flashMessage", "authenticated", "isAjax", "hasUserAdmin"],
        add:            ["flashMessage", "authenticated", "isAjax", "hasUserAdmin"],
        edit:           ["flashMessage", "authenticated", "isAjax", "hasUserAdminOrItself"],
        history:        ["flashMessage", "authenticated", "isAjax", "hasUserAdminOrItself"],
        projects:       ["flashMessage", "authenticated", "isAjax", "hasUserAdminOrItself"],
        changePassword: ["flashMessage", "authenticated", "isAjax", "hasUserAdminOrItself"]
    },

    // ProjectUser controller policies
    "ProjectUser": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAdmin", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAdmin"],

        // Custom actions
        users:          ["flashMessage", "authenticated", "isAjax", "hasProjectAccess"],
        availableUsers: ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAccess"],
        ownProjects:    ["flashMessage", "authenticated", "isAjaxOrSocket"],
        getRole:        ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAccess"]
    },

    // Type controller policies
    "Type": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "isAdministrator"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "isAdministrator", "addUserDataCreate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "isAdministrator", "addUserDataUpdate"]
    },

    // Comment controller policies
    "Comment": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket", "hasCommentObjectAccess"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasCommentObjectCreate", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasCommentObjectAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasCommentObjectAdmin"],

        // Custom actions
        index:      ["flashMessage", "authenticated", "isAjax", "hasCommentObjectAccess"]
    },

    // Validator controller policies
    "Validator": {
        // By default do not allow nothing
        "*":            false,

        // Custom actions
        isUnique:       ["flashMessage", "authenticated", "isAjax"],
        passwordCheck:  ["flashMessage", "authenticated", "isAjax", "hasUserAdminOrItself"]
    },

    // ExternalLink controller policies
    "ExternalLink": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket", "hasExternalLinkAccess"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasExternalLinkAdmin", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasExternalLinkAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasExternalLinkAdmin"],

        // Custom actions
        list:       ["flashMessage", "authenticated", "isAjax", "hasExternalLinkAccess"],
        add:        ["flashMessage", "authenticated", "isAjax", "hasExternalLinkAdmin"],
        edit:       ["flashMessage", "authenticated", "isAjax", "hasExternalLinkAccess"]
    },

    // Link controller policies
    "Link": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket", "hasLinkObjectAccess"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasLinkObjectCreate", "addUserDataCreate"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasLinkObjectAdmin", "addUserDataUpdate"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasLinkObjectAdmin"],

        // Custom actions
        index:      ["flashMessage", "authenticated", "isAjax", "hasLinkObjectAccess"]
    }
};
