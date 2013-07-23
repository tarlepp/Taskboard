/**
 * TaskController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require('jquery');

module.exports = {
    add: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var data = {
            layout: "layout_ajax",
            projectId: parseInt(req.param('projectId'), 10),
            storyId: parseInt(req.param('storyId'), 10),
            phaseId: false,
            types: false,
            users: false
        };

        Phase.find()
        .where({
            projectId: data.projectId
        })
        .sort('order ASC')
        .limit(1)
        .done(function(error, phases) {
            if (error) {
                res.send(error, 500);
            } else {
                data.phaseId = phases[0].id;

                makeView();
            }
        });

        Type.find()
        .sort('order ASC')
        .done(function(error, types) {
            if (error) {
                res.send(error, 500);
            } else {
                data.types = types;

                makeView();
            }
        });

        User.find()
        .sort('lastName ASC')
        .done(function(error, users) {
            if (error) {
                res.send(error, 500);
            } else {
                data.users = users;

                makeView();
            }
        });

        function makeView() {
            var ok = true;

            jQuery.each(data, function(key, data) {
                if (data === false) {
                    ok = false;
                }
            });

            if (ok) {
                res.view(data);
            }
        }
    }
};
