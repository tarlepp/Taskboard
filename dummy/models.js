// JSON objects
var models = {
    rest: {
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
            tasks: '',
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
    },
    knockout: {
        viewModel: {
            projects: function() {},
            phases: function(phases) {},
            users: function(users) {},
            sprints: function(sprints) {},
            stories: function(stories) {},
            types: function(types) {},
            backlog: function(stories) {},
            project: function(project) {},
            sprint: function(sprint) {},
            sortedProjects: function(projects) {},
            sortedSprints: function(sprints) {},
            sortedStories: function(stories) {},
            updateProjectSprintDates: function() {}
        },
        project: {
            id: function() {},
            managerId: function() {},
            title: function() {},
            description: function() {},
            dateStart: function() {},
            dateEnd: function() {},
            manager: function() {},
            sprints: function() {},
            sprintDateMin: function() {},
            sprintDateMax: function() {},
            dateStartObject: function() {},
            dateEndObject: function() {},
            dateStartFormatted: function() {},
            dateEndFormatted: function() {}
        },
        phase: {
            id: function() {},
            title: function() {},
            description: function() {},
            order: function() {},
            tasks: function() {},
            getColumnWidth: function() {},
            cntTasksMax: function() {},
            cntTask: function() {},
            phaseTaskCountStatus: function() {},
            phaseTaskCountText: function() {}
        },
        sprint: {
            id: function() {},
            title: function() {},
            description: function() {},
            dateStart: function() {},
            dateEnd: function() {},
            stories: function() {},
            dateStartObject: function() {},
            dateEndObject: function() {},
            formattedDuration: function() {},
            formattedTitle: function() {},
            duration: function() {}
        },
        story: {
            id: function() {},
            title: function() {},
            description: function() {},
            estimate: function() {},
            priority: function() {},
            vfCase: function() {},
            phases: function() {},
            formattedTitle: function() {},
            storyRowId: function() {},
            addNewTask: function() {}
        },
        phaseStory: {
            id: function() {},
            title: function() {},
            description: function() {},
            order: function() {},
            tasks: function() {}
        },
        task: {
            id: function() {},
            storyId: function() {},
            userId: function() {},
            phaseId: function() {},
            typeId: function() {},
            title: function() {},
            description: function() {},
            user: function() {},
            taskClass: function() {}
        },
        user: {
            id: function() {},
            name: function() {},
            firstname: function() {},
            surname: function() {},
            email: function() {},
            fullname: function() {}
        },
        type: {
            id: function() {},
            title: function() {},
            order: function() {},
            class: function() {}
        }
    }
};