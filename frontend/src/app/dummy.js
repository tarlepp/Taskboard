/**
 * Dummy JS file for smart IDEs like php/webStorm.
 *
 * Purpose of this file is to help IDE to use autocomplete features.
 */
/* jshint ignore:start */
var models = {
    project: {
        id:             '{Number}',
        title:          '{String}',
        description:    '{String}',
        dateStart:      '{Date}',
        dateEnd:        '{Date}',
        ignoreWeekends: '{Boolean}',
        sprints:        '{models.sprint[]}'
    },
    sprint: {
        id:             '{Number}',
        title:          '{String}',
        description:    '{String}',
        dateStart:      '{Date}',
        dateEnd:        '{Date}',
        ignoreWeekends: '{Boolean}',
        project:        '{models.project}'
    }
};

var services = {
    ListConfig: {
        getDefault: {
            itemCount:      '{Number}',
            items:          '{Array}',
            itemsPerPage:   '{Number}',
            currentPage:    '{Number}',
            where:          '{Object}',
            loading:        '{Boolean}',
            loaded:         '{Boolean}',
            methodLoad:     '{Function}'
        }
    }
};

/* jshint ignore:end */
