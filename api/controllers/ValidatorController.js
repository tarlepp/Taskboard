/**
 * ValidatorController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
module.exports = {
    /**
     * isUnique action. This is just a temporary solution for this...
     *
     * todo: This is not secure way to do this...
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    isUnique: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var model = req.param("model");
        var search = req.param("search");
        var id = req.param("id");

        // Just check that model really exists
        try {
            require("../models/" + model);
        } catch (Error) {
            res.send("Invalid model", 404);
        }

        // This is dirty, very dirty...
        eval(model)
            .find()
            .where(search)
            .done(function(error, data) {
                if (error) {
                    res.send(error, 500);
                }

                var output = false;

                if (data.length === 0) {
                    output = true;
                } else if (data[0].id == id) {
                    output = true;
                }

                res.json(output);
            });
    }
};
