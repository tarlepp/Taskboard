var request = require("supertest");
var sails = require("sails");

describe("not logged in user", function() {
    this.timeout(10000);

    global.sails = sails;

    before(function (done) {
        sails.lift(function () {
            setTimeout(done, 5000);
        });
    });

    after(function (done) {
        sails.lower(done);
    });

    describe("accessing to '/board/'", function() {
        it('should be redirected to sign in page', function (done) {
            request(sails.express.server)
                .get('/board')
                .expect(302)
                .expect('Location', '/login', done);
        });
    });

    describe("accessing invalid url", function() {
        it('should show 404 page', function (done) {
            request(sails.express.server)
                .get('/foobar')
                .expect(404)
                .expect('Location', '/foobar', done);
        });
    });
});
