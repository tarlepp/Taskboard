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
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket"], // Todo: try to figure out how to restrict access to all projects
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket"], // Todo: it is really good that every user can add new project?
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAdmin"],
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
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasPhaseAdmin"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasPhaseAdmin"],
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
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasSprintAdmin"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasSprintAdmin"],
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
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasMilestoneAdmin"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasMilestoneAdmin"],
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
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasStoryAdmin"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasStoryAdmin"],
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
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasTaskAdmin"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasTaskAdmin"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "hasTaskAdmin"],

        // Custom actions
        add:        ["flashMessage", "authenticated", "isAjax", "hasTaskAdmin"],
        edit:       ["flashMessage", "authenticated", "isAjax", "hasTaskAccess"],
        statistics: ["flashMessage", "authenticated", "isAjax", "hasTaskAccess"]
    },

    // User controller policies
    "User": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["flashMessage", "authenticated", "isAjaxOrSocket"],
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasUserAdmin"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasUserAdminOrItself"],
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
        create:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAdmin"],
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "hasProjectAdmin"],
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
        update:     ["flashMessage", "authenticated", "isAjaxOrSocket", "isAdministrator"],
        destroy:    ["flashMessage", "authenticated", "isAjaxOrSocket", "isAdministrator"]
    },

    // Story controller policies
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
    }
};
