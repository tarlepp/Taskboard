/**
 * UserController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
module.exports = {
    /**
     * User list action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    list: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        // Fetch user data
        User
            .find()
            .sort("lastName ASC")
            .sort("firstName ASC")
            .sort("username ASC")
            .done(function(error, users) {
                if (error) {
                    res.send(error, 500);
                } else {
                    res.view({
                        layout: "layout_ajax",
                        users: users
                    });
                }
            });
    },

    /**
     * User add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        res.view({
            layout: "layout_ajax"
        });
    },

    /**
     * User edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        res.view({
            layout: "layout_ajax"
        });
    }
};
