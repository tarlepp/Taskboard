/**
 * TaskController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
var jQuery = require('jquery');

module.exports = {
    /**
     * Task add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        // Specify template data
        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
            projectId: parseInt(req.param('projectId'), 10),
            storyId: parseInt(req.param('storyId'), 10),
            phaseId: false,
            types: false,
            story: false,
            users: false
        };

        // Fetch first phase for current project
        Phase
            .find()
            .where({
                projectId: data.projectId
            })
            .sort('order ASC')
            .limit(1)
            .done(function(error, phases) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.phaseId = (phases.length > 0) ? phases[0].id : 0;

                    makeView();
                }
            });

        // Fetch story
        Story
            .findOne(data.storyId)
            .done(function(error, story) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.story = story;

                    makeView();
                }
            });

        // Fetch task types
        Type
            .find()
            .sort('order ASC')
            .done(function(error, types) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.types = types;

                    makeView();
                }
            });

        // Fetch users
        User
            .find()
            .sort('lastName ASC')
            .done(function(error, users) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.users = users;

                    makeView();
                }
            });

        /**
         * Function makes actual view if all necessary data is fetched
         * from database for template.
         */
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
    },
    /**
     * Task edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        var taskId = parseInt(req.param('id'), 10);

        // Specify template data
        var data = {
            layout: req.isAjax ? "layout_ajax" : "layout",
            task: false,
            types: false,
            users: false
        };

        // Fetch task data
        Task
            .findOne(taskId)
            .done(function(error, task) {
                if (error) {
                    res.send(error, 500);
                } else if (!task) {
                    res.send("Task not found.", 404);
                } else {
                    data.task = task;

                    makeView();
                }
            });

        // Fetch task types
        Type
            .find()
            .sort('order ASC')
            .done(function(error, types) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.types = types;

                    makeView();
                }
            });

        // Fetch users
        User
            .find()
            .sort('lastName ASC')
            .done(function(error, users) {
                if (error) {
                    res.send(error, 500);
                } else {
                    data.users = users;

                    makeView();
                }
            });

        /**
         * Function makes actual view if all necessary data is fetched
         * from database for template.
         */
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
