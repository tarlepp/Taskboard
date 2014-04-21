"use strict";

angular.module("TaskBoard", [
    "ngRoute",
    "ngCookies",
    "ngResource",
    "route-segment",
    "view-segment",
    "ui.router",
    "angularjs-gravatardirective",
    "ngSails",
    "angularMoment",
    "TaskBoardControllers",
    "TaskBoardServices",
    "TaskBoardFilters",
    "TaskBoardDirectives"
]);

angular.module("TaskBoardControllers", []);
angular.module("TaskBoardServices", []);
angular.module("TaskBoardFilters", []);
angular.module("TaskBoardDirectives", []);
