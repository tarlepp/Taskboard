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
        find:       ["authenticated"], // Todo: try to figure out how to restrict access to all projects
        create:     ["authenticated"], // Todo: it is really good that every user can add new project?
        update:     ["authenticated", "hasProjectAdmin"],
        destroy:    ["authenticated", "hasProjectAdmin"],

        // Custom actions
        add:        ["authenticated"],
        edit:       ["authenticated", "hasProjectAccess"],
        backlog:    ["authenticated", "hasProjectAccess"],
        milestones: ["authenticated", "hasProjectAccess"],
        planning:   ["authenticated", "hasProjectAccess"],
        statistics: ["authenticated", "hasProjectAccess"]
    },

    // Phase controller policies
    "Phase": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated"],
        create:     ["authenticated", "hasProjectAdmin"],
        update:     ["authenticated", "hasProjectAdmin"],
        destroy:    ["authenticated", "hasProjectAdmin"],

        // Custom actions
        edit:       ["authenticated", "hasProjectAdmin"]
    },

    // Sprint controller policies
    "Sprint": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "hasSprintAccess"],
        create:     ["authenticated", "hasSprintAdmin"],
        update:     ["authenticated", "hasSprintAdmin"],
        destroy:    ["authenticated", "hasSprintAdmin"],

        // Custom actions
        add:        ["authenticated", "hasSprintAdmin"],
        edit:       ["authenticated", "hasSprintAccess"],
        backlog:    ["authenticated", "hasSprintAccess"]
    },

    // Milestone controller policies
    "Milestone": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "hasMilestoneAccess"],
        create:     ["authenticated", "hasMilestoneAdmin"],
        update:     ["authenticated", "hasMilestoneAdmin"],
        destroy:    ["authenticated", "hasMilestoneAdmin"],

        // Custom actions
        add:        ["authenticated", "hasMilestoneAdmin"],
        edit:       ["authenticated", "hasMilestoneAccess"],
        stories:    ["authenticated", "hasMilestoneAccess"]
    },

    // Story controller policies
    "Story": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "hasStoryAccess"],
        create:     ["authenticated", "hasStoryAdmin"],
        update:     ["authenticated", "hasStoryAdmin"],
        destroy:    ["authenticated", "hasStoryAdmin"],

        // Custom actions
        add:        ["authenticated", "hasStoryAdmin"],
        split:      ["authenticated", "hasStoryAdmin"],
        edit:       ["authenticated", "hasStoryAccess"],
        tasks:      ["authenticated", "hasStoryAccess"]
    },

    // Task controller policies
    "Task": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "hasTaskAccess"],
        create:     ["authenticated", "hasTaskAdmin"],
        update:     ["authenticated", "hasTaskAdmin"],
        destroy:    ["authenticated", "hasTaskAdmin"],

        // Custom actions
        add:        ["authenticated", "hasTaskAdmin"],
        edit:       ["authenticated", "hasTaskAccess"]
    },

    // User controller policies
    "User": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated"],
        create:     ["authenticated", "hasUserAdmin"],
        update:     ["authenticated", "hasUserAdminOrItself"],
        destroy:    ["authenticated", "hasUserAdmin"],

        // Custom actions
        list:       ["authenticated", "hasUserAdmin"],
        add:        ["authenticated", "hasUserAdmin"],
        edit:       ["authenticated", "hasUserAdminOrItself"],
        history:    ["authenticated", "hasUserAdminOrItself"]
    },

    // ProjectUser controller policies
    "ProjectUser": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated"],
        create:     ["authenticated", "hasProjectAdmin"],
        update:     ["authenticated", "hasProjectAdmin"],
        destroy:    ["authenticated", "hasProjectAdmin"],

        // Custom actions
        users:          ["authenticated", "hasProjectAccess"],
        availableUsers: ["authenticated", "hasProjectAccess"],
        ownProjects:    ["authenticated"],
        getRole:        ["authenticated", "hasProjectAccess"]
    },

    // Type controller policies
    "Type": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated"],
        create:     ["authenticated", "isAdministrator"],
        update:     ["authenticated", "isAdministrator"],
        destroy:    ["authenticated", "isAdministrator"]
    }
};
