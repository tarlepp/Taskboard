/**
 * Dummy JS file for smart IDEs like php/webStorm
 *
 * @author  Tarmo Leppänen <tarmo.leppanen@protacon.com>
 */
var selectedProjectId;
var selectedSprintId;

var sails = {
    error: {
        socket: {
            status: '',
            errors: ''
        },
        generic: {
            message: '',
            stack: ''
        },
        validation: {
            ValidationError: []
        }
    },
    helper: {
        history: {
            objectId: '',
            objectName: '',
            objectData: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        trigger: {
            trigger: '',
            parameters: []
        }
    },
    json: {
        history: {
            objectId: '',
            objectName: '',
            objectData: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        type: {
            title: '',
            order: '',
            class: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        user: {
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        project: {
            managerId: '',
            title: '',
            description: '',
            dateStart: '',
            dateEnd: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        phase: {
            projectId: '',
            title: '',
            description: '',
            order: '',
            tasks: '',
            isDone: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        sprint: {
            projectId: '',
            title: '',
            description: '',
            dateStart: '',
            dateEnd: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        story: {
            projectId: '',
            sprintId: '',
            milestoneId: '',
            typeId: '',
            title: '',
            description: '',
            estimate: '',
            priority: '',
            vfCase: '',
            isDone: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        task: {
            storyId: '',
            userId: '',
            phaseId: '',
            typeId: '',
            title: '',
            description: '',
            isDone: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        storySplit: {
            storyOld: {
                projectId: '',
                sprintId: '',
                milestoneId: '',
                typeId: '',
                title: '',
                description: '',
                estimate: '',
                priority: '',
                vfCase: '',
                isDone: '',
                id: '',
                createdAt: '',
                updatedAt: ''
            },
            storyNew: {
                projectId: '',
                sprintId: '',
                milestoneId: '',
                typeId: '',
                title: '',
                description: '',
                estimate: '',
                priority: '',
                vfCase: '',
                isDone: '',
                id: '',
                createdAt: '',
                updatedAt: ''
            },
            tasks: [],
            taskCnt: 0
        }
    },
    model: {
        milestone: {
            projectId: '',
            title: '',
            description: '',
            deadline: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        phase: {
            projectId: '',
            title: '',
            description: '',
            order: '',
            tasks: '',
            isDone: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        story: {
            projectId: '',
            sprintId: '',
            title: '',
            description: '',
            estimate: '',
            priority: '',
            vfCase: '',
            isDone: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        },
        task: {
            storyId: '',
            userId: '',
            phaseId: '',
            typeId: '',
            title: '',
            description: '',
            isDone: '',
            id: '',
            createdAt: '',
            updatedAt: ''
        }
    }
};
