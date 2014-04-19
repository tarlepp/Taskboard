/**
 * BoardController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
"use strict";

module.exports = {
    index: function(request, response) {
        response.view("board/index");
    }
};
