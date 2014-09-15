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

var socket = {
    message: {
        update: {
            data:       '{{}}',
            id:         '{Number}',
            verb:       '{String}',
            previous:   '{{}}'
        }
    }
};

var helpers = {
    history: {
        data: {
            changeType:     '{String}',
            column:         '{String}',
            columnType:     '{String}',
            valueIdNew:     '{String|Number|Boolean|Float|Null}',
            valueIdOld:     '{String|Number|Boolean|Float|Null}',
            valueNew:       '{String|Number|Boolean|Float|Null}',
            valueOld:       '{String|Number|Boolean|Float|Null}'
        }
    },
    modalQueue: {
        instance:   '{bootstrap.modalInstance}',
        method:     '{String}',
        parameters: '{*[]}'
    },
    tabConfig: {
        title:      '{String}',
        template:   '{String}',
        buttonSet:  '{String}',
        form:       '{String}',
        hasInit:    '{String}',
        lastUpdate: '{Date}'
    }
};

var bootstrap = {
    modalInstance: {
        result:     '{Promise}',
        opened:     '{Promise}',
        close:      '{Function}',
        dismiss:    '{Function}'
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
