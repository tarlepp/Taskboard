"use strict";

// Specify TaskBoard application dependencies
angular.module("TaskBoardApplication", ["TaskBoard"]);

angular.module("TaskBoardApplication")
    .config(
        [
            "$routeSegmentProvider", "$routeProvider",
            function($routeSegmentProvider, $routeProvider) {
                console.log("jee");
                $routeSegmentProvider.options.autoLoadTemplates = true;

                $routeSegmentProvider
                    .when("/login", "auth.login")

                    .when("/",      "board.main")
                    .when("/board", "board.main")

                    .segment("auth", {
                        templateUrl: "templates/auth/index.html",
                        controller: "AuthController"
                    })

                    .within()
                        .segment("login", {
                            templateUrl: "templates/auth/login.html"
                        })

                    .up()

                    .segment("board", {
                        templateUrl: "templates/board/index.html",
                        controller: "BoardController"
                    })

                    .within()
                        .segment("main", {
                            templateUrl: "templates/board/board.html"
                        })

                    .up()
                ;

                $routeProvider
                    .otherwise({
                        redirectTo: "/"
                    })
                ;
            }
        ]
    );
