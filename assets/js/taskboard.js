"use strict";

angular.module("TaskBoard", [
    "ngRoute",
    "ngCookies",
    "ngResource",
    "ngSanitize",
    "route-segment",
    "view-segment",
    "ui.router",
    "ui.bootstrap",
    "ui.bootstrap.showErrors",
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
