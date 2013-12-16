var request = require("supertest");
var should = require('chai').should();
var sailsHelper = require("./../helpers/sailsHelper");

var sails;
before(function(done) {
    sailsHelper.build(function(error, _sails) {
        if (error || !_sails) {
            return done(error || 'Sails could not be instantiated.');
        }

        sails = _sails;

        return done();
    });
});


describe("not logged in user", function() {

    describe("accessing to '/board/'", function() {
        it('should be redirected to sign in page', function (done) {
            request(sails.express.server)
                .get('/board')
                .expect(302)
                .expect('Location', '/login')
                .end(function(error, result) {
                    should.not.exist(error);
                    should.exist(result);

                    done();
                });
        });
    });

    describe("accessing invalid url", function() {
        it('should show 404 page', function (done) {
            request(sails.express.server)
                .get('/foobar')
                .expect(404)
                .end(function(error, result) {
                    should.not.exist(error);
                    should.exist(result);

                    done();
                });
        });
    });
});
