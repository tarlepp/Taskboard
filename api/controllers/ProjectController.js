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

        User.find()
        .sort('lastName ASC')
        .done(function(error, users) {
            if (error) {
                res.send(error, 500);
            } else {
                makeView(users);
            }
        });

        function makeView(users) {
            return res.view({
                layout: "layout_ajax",
                users: users
            });
        }
    },
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('id'), 10);

        Project.findOne(projectId)
        .done(function(error, project) {
            if (error) {
                res.send(error, 500);
            } else {
                fetchUsers(project);
            }
        });

        function fetchUsers(project) {
            User.find()
            .sort('lastName ASC')
            .done(function(error, users) {
                if (error) {
                    res.send(error, 500);
                } else {
                    makeView(users, project);
                }
            });
        }

        function makeView(users, project) {
            return res.view({
                layout: "layout_ajax",
                users: users,
                project: project
            });
        }
    },
    backlog: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('id'), 10);

        Project.findOne(projectId)
        .done(function(error, project) {
            if (error) {
                res.send(error, 500);
            } else {
                fetchStories(project);
            }
        });

        function fetchStories(project) {
            Story.find()
            .where({
                projectId: project.id
            })
            .sort('priority ASC')
            .done(function(error, stories) {
                if (error) {
                    res.send(error, 500);
                } else {
                    fetchSprints(project, stories);
                }
            });
        }

        function fetchSprints(project, stories) {
            Sprint.find()
            .where({
                projectId: project.id
            })
            .sort('dateStart ASC')
            .done(function(error, sprints) {
                if (error) {
                    res.send(error, 500);
                } else {
                    makeView(project, stories, sprints);
                }
            });
        }

        function makeView(project, stories, sprints) {
            return res.view({
                layout: "layout_ajax",
                project: project,
                stories: stories,
                sprints: sprints
            });
        }
    }
};
