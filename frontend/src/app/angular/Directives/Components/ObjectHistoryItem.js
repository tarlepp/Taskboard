/**
 * Directive to render specified object history item data. This one is called from
 * 'object-history' directive. Usage example:
 *
 *  <object-history-item
 *      data-ng-repeat="item in item.data"
 *      data-item="item"
 *  ></object-history-item>
 *
 * Where,
 *  item.data   = is data from one object that GET 'http://localhost/history/formattedHistory' returns
 *
 * @todo implement 'create' and 'delete' type handlers.
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('objectHistoryItem',
            [
                '$compile',
                'rfc4122',
                function($compile,
                         rfc4122
                ) {
                    /**
                     * Todo: implement this
                     *
                     * @param   {helpers.history.data}  item    Item data
                     */
                    var getContentInsert = function(item) {
                        console.log('Hey man, now it\'s time to implement this!');
                    };

                    /**
                     * Helper function to get necessary template for update
                     *
                     * @param   {helpers.history.data}  item
                     *
                     * @returns {string}
                     */
                    var getContentUpdate = function(item) {
                        var template = '';

                        if (item.columnType === 'relation' || item.columnType === 'boolean') {
                            template = 'Changed column <span class="text-info">{{item.column}}</span> value from ' +
                                '<span class="text-info">{{item.valueOld}}</span>'
                            ;

                            if (item.columnType !== 'boolean') {
                                template = template +
                                    ' <span class="text-muted">[{{item.valueIdOld}}]</span>'
                                ;
                            }

                            template = template +
                                ' to ' +
                                '<span class="text-info">{{item.valueNew}}</span> '
                            ;

                            if (item.columnType !== 'boolean') {
                                template = template +
                                    '<span class="text-muted">[{{item.valueIdNew}}]</span> '
                                ;
                            }
                        } else {
                            template = 'Changed column <span id="qtip-trigger-{{id}}" class="text-info">{{item.column}}</span> value';

                            template = template +
                                '<div data-qtip data-qtip-id="{{id}}" data-position="bottomRight" data-class="tooltip-history" data-qtip-title="Change information for <em>{{item.column}}</em> column">' +
                                '   <table class="table table-condensed">' +
                                '       <tr><th>Old value</th></tr>' +
                                '       <tr><td class="text-small">{{item.valueOld}}</td></tr>' +
                                '       <tr><th>New value</th></tr>' +
                                '       <tr><td class="text-small">{{item.valueNew}}</td></tr>' +
                                '   </table>' +
                                '</div>'
                            ;
                        }

                        return template;
                    };

                    /**
                     * Todo: implement this
                     *
                     * @param   {helpers.history.data}  item    Item data
                     */
                    var getContentDelete = function(item) {
                        console.log('Hey man, now it\'s time to implement this!');
                    };

                    /**
                     * Helper function to
                     *
                     * @param   {helpers.history.data}  item    Item data
                     *
                     * @returns {string}
                     */
                    var getTemplate = function(item) {
                        var output = '';

                        switch (item.changeType) {
                            case 'insert':
                                output = getContentInsert(item);
                                break;
                            case 'update':
                                output = getContentUpdate(item);
                                break;
                            case 'delete':
                                output = getContentDelete(item);
                                break;
                        }

                        return '<li data-ng-if="id">' + output + '</li>';
                    };

                    /**
                     * Linker function which will make directive to work.
                     *
                     * @param   {{}}        scope
                     * @param   {jQuery}    element
                     */
                    var linker = function(scope, element) {
                        scope.id = rfc4122.v4();

                        element.html(getTemplate(scope.item)).show();

                        $compile(element.contents())(scope);
                    };

                    return {
                        restrict: 'E',
                        replace: 'true',
                        link: linker,
                        scope: {
                            item: '='
                        }
                    };
                }
            ]
        );
}());
