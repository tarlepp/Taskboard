/**
 * This is really bad, for some reason I can't run multiple test files at once.
 *
 * Hopefully sails.js dev team writes some docs about proper testing of sails.js app.
 */

/**
var request = require("supertest");
var should = require('chai').should();
var sailsHelper = require("./../helpers/sailsHelper");

describe("not logged in user", function () {
    var sails;

    before(function(done) {
        sailsHelper.build(function (error, _sails) {
            if (error || !_sails) {
                return done(error || 'Sails could not be instantiated.');
            }
            sails = _sails;

            return done();
        });
    });

    after(function(done) {
        sailsHelper.teardown(sails, done);
    });

    describe("trying to sign in", function() {
        describe("with invalid credential data", function () {
            var loginData = {
                username: "foo",
                password: "bar"
            };
            it("user should not be signed in", function (done) {
                request(sails.express.server)
                    .post("/login")
                    .send(loginData)
                    .expect(401)
                    .end(function (error, result) {
                        should.not.exist(error);
                        should.exist(result);
                        done();
                    });
            });
        });
    });
});
*/
