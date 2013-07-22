/**
 * ProjectController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */

module.exports = {
    add: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        User.find().sort('lastName ASC').done(function(error, users) {
            if (error) {
                res.send(error, 500);
            } else {
                return res.view({
                    layout: "layout_ajax",
                    users: users
                });
            }
        });
    },
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('id'), 10);

        Project.findOne(projectId).done(function(error, project) {
            if (error) {
                res.send(error, 500);
            } else {
                User.find().sort('lastName ASC').done(function(error, users) {

                    console.log(users);
                    if (error) {
                        res.send(error, 500);
                    } else {
                        return res.view({
                            layout: "layout_ajax",
                            users: users,
                            project: project
                        });
                    }
                });
            }
        });
    },
    backlog: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }
    }
};
