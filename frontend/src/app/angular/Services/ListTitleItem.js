/**
 * Service to return lists title items.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('ListTitleItem', function() {
            return {
                getUserProject: function() {
                    return [
                        {
                            title: 'Project ID',
                            column: 'id',
                            searchable: true,
                            sortable: false,
                            inSearch: true,
                            inTitle: false
                        },
                        {
                            title: 'Project',
                            titleSearch: 'Project name',
                            column: 'title',
                            searchable: true,
                            sortable: true,
                            inSearch: true,
                            inTitle: true
                        },
                        {
                            title: 'Project description',
                            column: 'description',
                            searchable: true,
                            sortable: false,
                            inSearch: true,
                            inTitle: false
                        },
                        {
                            title: 'Role',
                            column: 'role',
                            searchable: false,
                            sortable: false,
                            inSearch: false,
                            inTitle: true
                        },
                        {
                            title: 'Members',
                            column: 'members.length',
                            searchable: false,
                            sortable: false,
                            inSearch: false,
                            inTitle: true
                        },
                        {
                            title: 'Sprints',
                            column: 'sprints.length',
                            searchable: false,
                            sortable: false,
                            inSearch: false,
                            inTitle: true
                        },
                        {
                            title: 'Schedule',
                            column: 'dateStart',
                            searchable: false,
                            sortable: true,
                            inSearch: false,
                            inTitle: true
                        },
                        {
                            title: 'Schedule start',
                            column: 'dateStart',
                            searchable: true,
                            sortable: false,
                            inSearch: true,
                            inTitle: false
                        },
                        {
                            title: 'Schedule end',
                            column: 'dateEnd',
                            searchable: true,
                            sortable: false,
                            inSearch: true,
                            inTitle: false
                        }
                    ];
                },
                getUserActivityLog: function() {
                    return [
                        {
                            title: 'Object',
                            column: 'objectName',
                            searchable: true,
                            sortable: true,
                            inSearch: true,
                            inTitle: true
                        },
                        {
                            title: 'ID',
                            column: 'objectId',
                            searchable: true,
                            sortable: true,
                            inSearch: true,
                            inTitle: true
                        },
                        {
                            title: 'Message',
                            column: 'message',
                            searchable: true,
                            sortable: true,
                            inSearch: true,
                            inTitle: true
                        },
                        {
                            title: 'Data',
                            column: 'objectData',
                            class: 'text-right',
                            searchable: true,
                            sortable: false,
                            inSearch: true,
                            inTitle: true
                        },
                        {
                            title: 'Stamp',
                            column: 'createdAt',
                            searchable: true,
                            sortable: true,
                            inSearch: true,
                            inTitle: true
                        }
                    ];
                },
                getUserLoginHistory: function() {
                    return [
                        {
                            title: 'Full login list',
                            titleTab: 'Full list',
                            columns: [
                                {title: 'Login time', inSearch: true, column: 'createdAt'},
                                {title: 'IP-address', inSearch: true, column: 'ip'},
                                {title: 'User-agent', inSearch: true, column: 'agent'}
                            ],
                            sort: {
                                column: 'createdAt',
                                direction: true
                            },
                            methodLoad: 'load',
                            methodCount: 'count',
                            showCount: false,
                            searchWord: '',
                            items: [],
                            itemCount: 0,
                            currentPage: 1
                        },
                        {
                            title: 'Unique IP-addresses',
                            titleTab: 'IP-addresses',
                            columns: [
                                {title: 'IP-address', inSearch: true, column: 'ip'},
                                {title: 'Count', column: 'count', class: 'text-right'}
                            ],
                            sort: {
                                column: 'count',
                                direction: true
                            },
                            methodLoad: 'loadIp',
                            methodCount: 'countIp',
                            showCount: true,
                            searchWord: '',
                            items: [],
                            itemCount: 0,
                            currentPage: 1
                        },
                        {
                            title: 'Unique user-agents',
                            titleTab: 'User-agents',
                            columns: [
                                {title: 'User-agent', inSearch: true, column: 'agent'},
                                {title: 'Count', column: 'count', class: 'text-right'}
                            ],
                            sort: {
                                column: 'count',
                                direction: true
                            },
                            methodLoad: 'loadAgent',
                            methodCount: 'countAgent',
                            showCount: true,
                            searchWord: '',
                            items: [],
                            itemCount: 0,
                            currentPage: 1
                        },
                        {
                            title: 'Used browsers',
                            titleTab: 'Browsers',
                            columns: [
                                {title: 'Browser', inSearch: true, column: 'browserFamily'},
                                {title: 'Count', column: 'count', class: 'text-right'}
                            ],
                            sort: {
                                column: 'count',
                                direction: true
                            },
                            methodLoad: 'loadBrowserFamily',
                            methodCount: 'countBrowserFamily',
                            showCount: true,
                            searchWord: '',
                            items: [],
                            itemCount: 0,
                            currentPage: 1
                        },
                        {
                            title: 'Operation systems',
                            titleTab: 'OS',
                            columns: [
                                {title: 'Operation system', inSearch: true, column: 'osFamily'},
                                {title: 'Count', column: 'count', class: 'text-right'}
                            ],
                            sort: {
                                column: 'count',
                                direction: true
                            },
                            methodLoad: 'loadOsFamily',
                            methodCount: 'countOsFamily',
                            showCount: true,
                            searchWord: '',
                            items: [],
                            itemCount: 0,
                            currentPage: 1
                        }
                    ];
                }
            };
        });
}());