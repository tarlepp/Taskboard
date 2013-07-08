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
        order: ''
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
        typeId: '',
        phaseId: '',
        title: '',
        description: ''
    },
    type: {
        id: '',
        createdAt: '',
        updatedAt: '',
        title: '',
        order: '',
        class: ''
    },
    user: {
        id: '',
        createdAt: '',
        updatedAt: '',
        name: '',
        firstname: '',
        surname: '',
        email: ''
    },
    phaseStory: {
        id: '',
        createdAt: '',
        updatedAt: '',
        projectId: '',
        title: '',
        description: '',
        order: '',
        tasks: []
    }
};