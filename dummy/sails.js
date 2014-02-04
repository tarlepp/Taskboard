/**
 * Dummy JS file for smart IDEs like php/webStorm
 *
 * @author  Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */
var selectedProjectId;
var selectedSprintId;
var loggedUserId;

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
            errors: "",
            message: ""
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
        historyRow: {
            message: "",
            index: "",
            stamp: "",
            data: []
        },
        historyRowData: {
            column: "",
            columnType: "",
            changeType: "",
            valueNew: "",
            valueOld: "",
            valueIdOld: "",
            valueIdNew: ""
        },
        historyDifference: {
            column: "",
            value: ""
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
            admin: "",
            language: "",
            momentFormatDate: "",
            momentFormatDateTime: "",
            momentFormatTime: "",
            momentTimezone: "",
            taskTemplateChangeLimit: "",
            boardSettingHideDoneStories: "",
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
            parentId: "",
            title: "",
            description: "",
            estimate: "",
            priority: "",
            isDone: "",
            timeStart: "",
            timeEnd: "",
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
            priority: "",
            timeStart: "",
            timeEnd: "",
            isDone: "",
            currentUserId: "",
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
                parentId: "",
                title: "",
                description: "",
                estimate: "",
                priority: "",
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
                parentId: "",
                title: "",
                description: "",
                estimate: "",
                priority: "",
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
            milestoneId: "",
            typeId: "",
            parentId: "",
            title: "",
            description: "",
            estimate: "",
            priority: "",
            isDone: "",
            timeStart: "",
            timeEnd: "",
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
            priority: "",
            isDone: "",
            timeStart: "",
            timeEnd: "",
            currentUserId: "",
            id: "",
            updatedUserId: "",
            createdUserId: "",
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
        },
        history: {
            objectName: "",
            objectId: "",
            objectData: "",
            message: ""
        },
        externalLink: {
            projectId: "",
            title: "",
            description: "",
            link: "",
            createdUserId: "",
            updatedUserId:""
        }
    }
};
