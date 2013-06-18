/*---------------------
	:: Data 
	-> controller
---------------------*/
var DataController = {
    getProjectSprints: function(id) {
        Sprint.findAll({projectId: id}).done(function(err, sprints) {


            var output = [];

            for (var i = 0; i < sprints.length; i++) {
                var foo = sprints[i].values;
                console.log(foo);
                output.push(foo);
            }

            return output;
        });
    },
    getAll: function(req, res) {
        Project.findAll().done(function(err, projects) {
            if (err) {
                return res.send(err, 500);
            }

            var output = [];

            for (var i = 0; i < projects.length; i++) {
                var foo = projects[i].values;

                foo.sprints = DataController.getProjectSprints(foo.id);
                foo.jee = 'asdfasdf';

                output.push(foo);
            }

            res.json(output);
        });
    }
};

module.exports = DataController;