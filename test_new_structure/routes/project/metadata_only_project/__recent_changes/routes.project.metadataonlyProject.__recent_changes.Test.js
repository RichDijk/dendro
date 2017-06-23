var chai = require('chai');
var chaiHttp = require('chai-http');
const should = chai.should();
var _ = require('underscore');
chai.use(chaiHttp);

const Config = GLOBAL.Config;

const projectUtils = require(Config.absPathInTestsFolder("utils/project/projectUtils.js"));
const userUtils = require(Config.absPathInTestsFolder("utils/user/userUtils.js"));
const folderUtils = require(Config.absPathInTestsFolder("utils/folder/folderUtils.js"));
const httpUtils = require(Config.absPathInTestsFolder("utils/http/httpUtils.js"));
const descriptorUtils = require(Config.absPathInTestsFolder("utils/descriptor/descriptorUtils.js"));
const appUtils = require(Config.absPathInTestsFolder("utils/app/appUtils.js"));

const demouser1 = require(Config.absPathInTestsFolder("mockdata/users/demouser1.js"));
const demouser2 = require(Config.absPathInTestsFolder("mockdata/users/demouser2.js"));
const demouser3 = require(Config.absPathInTestsFolder("mockdata/users/demouser3.js"));

const metadataProject = require(Config.absPathInTestsFolder("mockdata/projects/metadata_only_project.js"));

const folder = require(Config.absPathInTestsFolder("mockdata/folders/folder.js"));
var addMetadataToFoldersUnit = appUtils.requireUncached(Config.absPathInTestsFolder("units/metadata/addMetadataToFolders.Unit.js"));
var db = appUtils.requireUncached(Config.absPathInTestsFolder("utils/db/db.Test.js"));

describe("metadata project recent changes", function () {
    before(function (done) {
        this.timeout(60000);
        addMetadataToFoldersUnit.setup(function (err, results) {
            should.equal(err, null);
            done();
        });
    });

    describe("[GET] /project/:handle?recent_changes", function () {
        //API ONLY
        it("Should give an error if the request type for the route is HTML", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                //jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(false, agent, metadataProject.handle, function (err, res) {
                    res.should.have.status(400);
                    done();
                });
            });
        });

        it("Should give the recent project changes if the user is unauthenticated", function (done) {
            var app = GLOBAL.tests.app;
            var agent = chai.request.agent(app);

            projectUtils.getProjectRecentChanges(true, agent, metadataProject.handle, function (err, res) {
                res.should.have.status(200);//because the project is metadata only
                res.body.length.should.equal(4);
                done();
            });
        });

        it("Should give an error if the project does not exist", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                //jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(true, agent, "ARandomProjectHandle", function (err, res) {
                    res.statusCode.should.equal(404);
                    res.body.result.should.equal("not_found");
                    res.body.message.should.be.an('array');
                    res.body.message.length.should.equal(1);
                    res.body.message[0].should.contain("Resource not found at uri ");
                    res.body.message[0].should.contain(notFoundFolder.name);
                    res.body.message[0].should.contain("ARandomProjectHandle");
                    done();
                });
            });
        });

        it("Should give the recent project changes if the user is logged in as demouser3(not a collaborator nor creator of the project)", function (done) {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent) {
                //jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(true, agent, metadataProject.handle, function (err, res) {
                    res.should.have.status(200);//because the project is metadata only
                    res.body.length.should.equal(4);
                    done();
                });
            });
        });

        it("Should give the recent project changes if the user is logged in as demouser1(the creator of the project)", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                //jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(true, agent, metadataProject.handle, function (err, res) {
                    res.should.have.status(200);
                    res.body.length.should.equal(4);
                    done();
                });
            });
        });

        it("Should give the recent project changes if the user is logged in as demouser2(a collaborator on the project)", function (done) {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent) {
                //jsonOnly, agent, projectHandle, cb
                projectUtils.getProjectRecentChanges(true, agent, metadataProject.handle, function (err, res) {
                    res.should.have.status(200);
                    res.body.length.should.equal(4);
                    done();
                });
            });
        });
    });

    after(function (done) {
        //destroy graphs
        this.timeout(60000);
        appUtils.clearAppState(function (err, data) {
            should.equal(err, null);
            done();
        });
    });
});