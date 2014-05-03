"use strict";

angular.module("TaskBoard", [
    "ngRoute",
    "ngCookies",
    "ngResource",
    "route-segment",
    "view-segment",
    "ui.router",
    "ui.bootstrap",
    "angularjs-gravatardirective",
    "angularMoment",
    "sails.io",
    "ngPrettyJson",
    "TaskBoardControllers",
    "TaskBoardServices",
    "TaskBoardFilters",
    "TaskBoardDirectives",
    "TaskBoardInterceptors"
]);

angular.module("TaskBoardControllers", []);
angular.module("TaskBoardServices", []);
angular.module("TaskBoardFilters", []);
angular.module("TaskBoardDirectives", []);
angular.module("TaskBoardInterceptors", []);
