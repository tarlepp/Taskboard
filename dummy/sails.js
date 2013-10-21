/**
 * Dummy JS file for smart IDEs like php/webStorm
 *
 * @author  Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */
var selectedProjectId;
var selectedSprintId;
var loggedUserId;

/**
 * AuthService methods
 *
 * @type {{hasProjectAccess: Function, hasProjectDestroy: Function}}
 */
var AuthService = {
    hasProjectAccess:   function(user, projectId, next, returnRole) {},
    hasProjectUpdate:   function(user, projectId, next) {},
    hasProjectDestroy:  function(user, projectId, next) {},
    hasSprintAccess:    function(user, sprintId, next, returnRole) {},
    hasSprintAdmin:     function(user, sprintId, next) {},
    hasMilestoneAccess: function(user, milestoneId, next, returnRole) {},
    hasMilestoneAdmin:  function(user, milestoneId, next) {},
    hasStoryAccess:     function(user, storyId, next, returnRole) {},
    hasStoryAdmin:      function(user, storyId, next) {}
};

var knockout = {
    sortable: {
        arg: {
            item: "",
            sourceParent: "",
            sourceParentNode: "",
            sourceIndex: "",
            targetParent: "",
            targetIndex: "",
            cancelDrop: ""
        }
    }
};

var sails = {
    req: {
        user: {
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            admin: "",
            password: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        }
    },
    error: {
        socket: {
            status: "",
            errors: ""
        },
        generic: {
            message: "",
            stack: ""
        },
        validation: {
            ValidationError: []
        }
    },
    helper: {
        history: {
            objectId: "",
            objectName: "",
            objectData: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        trigger: {
            trigger: "",
            parameters: []
        }
    },
    json: {
        history: {
            objectId: "",
            objectName: "",
            objectData: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        type: {
            title: "",
            order: "",
            class: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        user: {
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        project: {
            managerId: "",
            title: "",
            description: "",
            dateStart: "",
            dateEnd: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        projectUser: {
            projectId: "",
            userId: "",
            role: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        milestone: {
            projectId: "",
            title: "",
            description: "",
            deadline: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        phase: {
            projectId: "",
            title: "",
            description: "",
            order: "",
            tasks: "",
            isDone: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        sprint: {
            projectId: "",
            title: "",
            description: "",
            dateStart: "",
            dateEnd: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        story: {
            projectId: "",
            sprintId: "",
            milestoneId: "",
            typeId: "",
            title: "",
            description: "",
            estimate: "",
            priority: "",
            vfCase: "",
            isDone: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        task: {
            storyId: "",
            userId: "",
            phaseId: "",
            typeId: "",
            title: "",
            description: "",
            isDone: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        storySplit: {
            storyOld: {
                projectId: "",
                sprintId: "",
                milestoneId: "",
                typeId: "",
                title: "",
                description: "",
                estimate: "",
                priority: "",
                vfCase: "",
                isDone: "",
                id: "",
                createdAt: "",
                updatedAt: ""
            },
            storyNew: {
                projectId: "",
                sprintId: "",
                milestoneId: "",
                typeId: "",
                title: "",
                description: "",
                estimate: "",
                priority: "",
                vfCase: "",
                isDone: "",
                id: "",
                createdAt: "",
                updatedAt: ""
            },
            tasks: [],
            taskCnt: 0
        }
    },

    /**
     * Knockout models.
     */
    knockout: {
        project: new Project(sails.json.project),
        phase: new Phase(sails.json.phase),
        sprint: new Sprint(sails.json.sprint),
        story: new Story(sails.json.story),
        task: new Task(sails.json.task),
        type: new Type(sails.json.type),
        user: new User(sails.json.user)
    },

    /**
     * Sails.js models
     */
    model: {
        milestone: {
            projectId: "",
            title: "",
            description: "",
            deadline: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        phase: {
            projectId: "",
            title: "",
            description: "",
            order: "",
            tasks: "",
            isDone: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        story: {
            projectId: "",
            sprintId: "",
            title: "",
            description: "",
            estimate: "",
            priority: "",
            vfCase: "",
            isDone: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        task: {
            storyId: "",
            userId: "",
            phaseId: "",
            typeId: "",
            title: "",
            description: "",
            isDone: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        },
        user: {
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            admin: "",
            password: "",
            id: "",
            createdAt: "",
            updatedAt: ""
        }
    }
};
