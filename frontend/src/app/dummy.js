/**
 * Dummy JS file for smart IDEs like php/webStorm.
 *
 * Purpose of this file is to help IDE to use autocomplete features.
 */
var models = {
    project: {
        id:             "{Number}",
        title:          "{String}",
        description:    "{String}",
        dateStart:      "{Date}",
        dateEnd:        "{Date}",
        ignoreWeekends: "{Boolean}",
        sprints:        "{models.sprint[]}"
    },
    sprint: {
        id:             "{Number}",
        title:          "{String}",
        description:    "{String}",
        dateStart:      "{Date}",
        dateEnd:        "{Date}",
        ignoreWeekends: "{Boolean}",
        project:        "{models.project}"
    }
};
