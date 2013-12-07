/**
 * Application specified global configuration.
 *
 * @type {{appName: string}}
 */
module.exports = {
    appName: "Taskboard",
    history: {
        ignoreValues: [
            "sessionId",
            "password"
        ]
    }
};