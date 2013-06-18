// JSON objects
var models = {
    project: {
        id: '',
        createdAt: '',
        updatedAt: '',
        managerId: '',
        title: '',
        description: '',
        dateStart: '',
        dateEnd: ''
    },
    phase: {
        id: '',
        createdAt: '',
        updatedAt: '',
        projectId: '',
        title: '',
        description: '',
        order: '',
        tasks: ''
    },
    sprint: {
        id: '',
        createdAt: '',
        updatedAt: '',
        projectId: '',
        title: '',
        description: '',
        dateStart: '',
        dateEnd: ''
    },
    story: {
        id: '',
        createdAt: '',
        updatedAt: '',
        projectId: '',
        sprintId: '',
        title: '',
        description: '',
        estimate: '',
        priority: '',
        vfCase: ''
    },
    task: {
        id: '',
        createdAt: '',
        updatedAt: '',
        storyId: '',
        userId: '',
        phaseId: '',
        title: '',
        description: ''
    },
    user: {
        id: '',
        createdAt: '',
        updatedAt: '',
        name: '',
        firstname: '',
        surname: '',
        email: ''
    }
};