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
        update:     ["authenticated", "hasProjectUpdate"],
        destroy:    ["authenticated", "hasProjectDestroy"],

        // Custom actions
        add:        ["authenticated"],
        edit:       ["authenticated", "hasProjectAccess"],
        backlog:    ["authenticated", "hasProjectAccess"],
        milestones: ["authenticated", "hasProjectAccess"],
        planning:   ["authenticated", "hasProjectAccess"],
        statistics: ["authenticated", "hasProjectAccess"]
    },

    // Sprint controller policies
    "Sprint": {
        // By default do not allow nothing
        "*":        false,

        // Default handling for blueprints
        find:       ["authenticated", "hasSprintAccess"],
        create:     ["authenticated", "hasSprintCreate"],
        update:     ["authenticated", "hasSprintUpdate"],
        destroy:    ["authenticated", "hasSprintDestroy"],

        // Custom actions
        add:        ["authenticated", "hasProjectAccess"],
        edit:       ["authenticated", "hasSprintAccess"],
        backlog:    ["authenticated", "hasSprintAccess"]
    }
};
