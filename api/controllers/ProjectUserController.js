/**
 * ProjectUserController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
var jQuery = require('jquery');

module.exports = {
    /**
     * This actions makes view for project users. Note that 'projectId' parameter is
     * required for this action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    users: function(req, res) {
        if (!req.isAjax) {
            res.send("Only AJAX request allowed", 403);
        }

        var projectId = req.param("projectId");
        var data = {
            layout: "layout_ajax",
            users: false,
            project: false
        };

        // Fetch project data
        Project
            .findOne(projectId)
            .done(function(error, /** sails.json.project */project) {
                if (error) {
                    res.send(error, 500);
                } else if (!project) {
                    res.send("Project not found.", 404);
                } else {
                    data.project = project;

                    fetchProjectUsers();
                }
            });

        /**
         * Function to fetch project user data. Also note that this will add selected
         * project manager to this user list.
         *
         * todo:    potential bug for duplicate user, eg user is attached to project
         *          and afterwards this same user has been selected to project manager.
         *
         *          This is not a big deal yet, but remember to handle this :D
         */
        function fetchProjectUsers() {
            // Fetch all project user
            ProjectUser
                .find()
                .where({projectId: projectId})
                .done(function(error, /** sails.json.projectUser */projectUsers) {
                    if (error) {
                        res.send(error, 500);
                    } else {
                        data.users = projectUsers;

                        // Add project main manager to project users data
                        projectUsers.push({
                            projectId: data.project.id,
                            userId: data.project.managerId,
                            role: -1,
                            main: 1
                        });

                        // Fetch detailed user data
                        fetchUserData();
                    }
                });
        }

        /**
         * Function to fetch detailed user data from database.
         *
         * todo:    refactor role text determination.
         */
        function fetchUserData() {
            // Iterate project users, we have always at least one user
            jQuery.each(data.users, function(key, /** sails.json.projectUser */projectUser) {
                // Initialize project user user property
                projectUser.data = false;

                var roleText = "Unknown";

                switch (projectUser.role) {
                    case -1:
                        roleText = "Manager";
                        break;
                    case 0:
                        roleText = "Viewer";
                        break;
                    case 1:
                        roleText = "User";
                        break;
                }

                projectUser.roleText = roleText;

                // Fetch single user data from database
                User
                    .findOne(projectUser.userId)
                    .done(function(error, user) {
                        if (error) {
                            res.send(error, 500);
                        } else if (!user) {
                            res.send("User not found.", 404);
                        } else {
                            jQuery.extend(projectUser, user, {data: true});

                            makeView();
                        }
                    });
            });
        }

        /**
         * Function makes actual view if all necessary data is fetched
         * from database for template.
         */
        function makeView() {
            if (data.users.length > 0) {
                var show = true;

                // Check that we have fetched all users data for project
                jQuery.each(data.users, function(key, /** sails.json.projectUser */projectUser) {
                    // All user data are not yet fetched
                    if (projectUser.data === false) {
                        show = false;
                    }
                });

                if (show) {
                    // Sort user data
                    data.users = _.sortBy(data.users, function(user) {
                        return [user.role, user.fullName(), user.username].join("|");
                    });

                    res.view(data);
                }
            } else {
                res.view(data);
            }
        }
    },

    /**
     * This actions fetches available users for specified project. These users can be
     * attached to specified project.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    availableUsers: function(req, res) {
        if (!req.isAjax) {
            res.send('Only AJAX request allowed', 403);
        }

        var projectId = parseInt(req.param('projectId'), 10);
        var userIds = [];

        // Fetch project data
        Project
            .findOne(projectId)
            .done(function(error, project) {
                if (error) {
                    res.send(error, 500);
                } else if (!project) {
                    res.send("Project not found.", 404);
                } else {
                    // Add project manager to "used" users
                    userIds.push({id: {"!": project.managerId}});

                    // Fetch current attached users
                    fetchCurrentUsers();
                }
            });

        /**
         * Private function to fetch all users who are already attached
         * to specified project.
         */
        function fetchCurrentUsers() {
            ProjectUser
                .find()
                .where({projectId: projectId})
                .done(function(error, users) {
                    if (error) {
                        res.send(error, 500);
                    } else {
                        // Iterate users and add those to "used" users
                        _.each(users, function(projectUser) {
                            userIds.push({id: {"!": projectUser.userId}});
                        });

                        // And finally fetch available users
                        fetchAvailableUsers();
                    }
                });
        }

        /**
         * Private function to fetch all available users for
         * specified project.
         */
        function fetchAvailableUsers() {
            User
                .find()
                .where({
                    and: userIds
                })
                .done(function(error, users) {
                    if (error) {
                        res.send(error, 500);
                    } else {
                        res.send(users);
                    }
                });
        }
    }
};
