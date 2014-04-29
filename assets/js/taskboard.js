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
    "TaskBoardControllers",
    "TaskBoardServices",
    "TaskBoardFilters",
    "TaskBoardDirectives"
]);

angular.module("TaskBoardControllers", []);
angular.module("TaskBoardServices", []);
angular.module("TaskBoardFilters", []);
angular.module("TaskBoardDirectives", []);
