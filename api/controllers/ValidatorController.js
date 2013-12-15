/**
 * ValidatorController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
"use strict";

module.exports = {
    /**
     * isUnique action. This will check if given attribute is unique in
     * specified model.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    isUnique: function(req, res) {
        var id = req.param("id");
        var model = req.param("model");
        var search = req.param("search");

        // Model found
        if (global[model] && typeof global[model] === "object") {
            global[model]
                .find()
                .where(search)
                .done(function(error, data) {
                    if (error) {
                        res.send(500, error);
                    }

                    var output = false;

                    if (data.length === 0) {
                        output = true;
                    } else if (data[0].id == id) {
                        output = true;
                    }

                    res.json(output);
                });
        } else {
            res.send(404, "Invalid model")
        }
    },

    /**
     * passwordCheck action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    passwordCheck: function(req, res) {
        var userId = req.param("userId");
        var password = req.param("password");

        User
            .findOne(userId)
            .done(function(error, user) {
                if (error) {
                    res.send(500, error);
                } else if (!user) {
                    res.send(404, "User not found");
                } else {
                    res.json(user.validPassword(password));
                }
            });
    }
};
