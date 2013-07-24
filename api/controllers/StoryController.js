/**
 * StoryController
 *
 * @module      ::  Controller
 * @description ::  Contains logic for handling requests.
 */
module.exports = {
    /**
     * Story add action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    add: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('projectId'), 10);
        var sprintId = parseInt(req.param('sprintId'), 10);

        res.view({
            layout: "layout_ajax",
            projectId: projectId,
            sprintId: sprintId
        });
    },
    /**
     * Story edit action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    edit: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var storyId = parseInt(req.param('id'), 10);

        // Fetch story data
        Story
            .findOne(storyId)
            .done(function(error, story) {
                if (error) {
                    res.send(error, 500);
                } else if (!story) {
                    res.send("Story not found.", 404);
                } else {
                    res.view({
                        layout: "layout_ajax",
                        story: story
                    });
                }
            });
    }
};
