/**
 * StoryController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */

module.exports = {
    add: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('projectId'), 10);
        var sprintId = parseInt(req.param('sprintId'), 10);

        return res.view({
            layout: "layout_ajax",
            projectId: projectId,
            sprintId: sprintId
        });
    },
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var storyId = parseInt(req.param('id'), 10);

        Story.findOne(storyId)
        .done(function(error, story) {
            if (error) {
                res.send(error, 500);
            } else {
                makeView(story);
            }
        });

        function makeView(story) {
            return res.view({
                layout: "layout_ajax",
                story: story
            });
        }
    }
};
