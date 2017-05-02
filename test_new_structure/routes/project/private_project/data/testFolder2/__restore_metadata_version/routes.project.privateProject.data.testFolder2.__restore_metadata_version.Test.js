var chai = require('chai');
var chaiHttp = require('chai-http');
const should = chai.should();
var _ = require('underscore');
chai.use(chaiHttp);

const Config = GLOBAL.Config;

const userUtils = require(Config.absPathInTestsFolder("utils/user/userUtils.js"));
const itemUtils = require(Config.absPathInTestsFolder("utils/item/itemUtils.js"));

const demouser1 = require(Config.absPathInTestsFolder("mockdata/users/demouser1.js"));
const demouser2 = require(Config.absPathInTestsFolder("mockdata/users/demouser2.js"));
const demouser3 = require(Config.absPathInTestsFolder("mockdata/users/demouser3.js"));

const privateProject = require(Config.absPathInTestsFolder("mockdata/projects/private_project.js"));
const invalidProject = require(Config.absPathInTestsFolder("mockdata/projects/invalidProject.js"));

const testFolder2 = require(Config.absPathInTestsFolder("mockdata/folders/testFolder2.js"));
const notFoundFolder = require(Config.absPathInTestsFolder("mockdata/folders/notFoundFolder.js"));
const folderForDemouser2 = require(Config.absPathInTestsFolder("mockdata/folders/folderDemoUser2"));
var addMetadataToFoldersUnit = requireUncached(Config.absPathInTestsFolder("units/metadata/addMetadataToFolders.Unit.js"));
var db = requireUncached(Config.absPathInTestsFolder("utils/db/db.Test.js"));

function requireUncached(module) {
    delete require.cache[require.resolve(module)]
    return require(module)
}

describe("Private project testFolder2 level restore_metadata_version", function () {
    before(function (done) {
        this.timeout(60000);
        addMetadataToFoldersUnit.setup(function (err, results) {
            should.equal(err, null);
            done();
        });
    });

    describe("[POST] [PRIVATE PROJECT] /project/" + privateProject.handle + "/data/foldername?restore_metadata_version", function () {
        //API ONLY
        it("Should give an error of the request type for this route is html", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.itemRestoreMetadataVersion(false, agent, privateProject.handle, testFolder2.name, 0, function (err, res) {
                    res.statusCode.should.equal(400);
                    done();
                });
            });
        });

        it("Should give an error if the user is unauthenticated", function (done) {
            var app = GLOBAL.tests.app;
            var agent = chai.request.agent(app);

            itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, testFolder2.name, 0, function (err, res) {
                res.statusCode.should.equal(401);
                done();
            });
        });

        it("Should give an error if the project does not exist", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.itemRestoreMetadataVersion(true, agent, invalidProject.handle, testFolder2.name, 0, function (err, res) {
                    res.statusCode.should.equal(401);
                    done();
                });
            });
        });

        it("Should give an error if the folder identified by foldername does not exist", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, notFoundFolder.name, 0, function (err, res) {
                    res.statusCode.should.equal(500);
                    res.body.message.should.contain("Unable to retrieve version");
                    done();
                });
            });
        });

        it("Should give an error if the metadata_version sent in the body is in an invalid format", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, testFolder2.name, "thisisaninvalidversion", function (err, res) {
                    res.statusCode.should.equal(500);
                    res.body.message.should.contain("Unable to retrieve version");
                    done();
                });
            });
        });

        it("Should give an error if the user is logged in as demouser3(not a collaborator nor creator of the project)", function (done) {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent) {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, testFolder2.name, 0, function (err, res) {
                    res.statusCode.should.equal(401);
                    done();
                });
            });
        });

        it("Should restore the metadata version related to the folder if the folder exists and if the user is logged in as demouser1(the creator of the project) and if the version sent in the body is a valid one", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, testFolder2.name, 0, function (err, res) {
                    res.statusCode.should.equal(200);
                    res.body.message.should.contain("succesfully restored to version " + 0);
                    done();
                });
            });
        });

        it("Should restore the metadata version related to the folder if the folder exists and if the user is logged in as demouser2(a collaborator on the project) and if the version sent in the body is a valid one", function (done) {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent) {
                itemUtils.itemRestoreMetadataVersion(true, agent, privateProject.handle, folderForDemouser2.name, 0, function (err, res) {
                    res.statusCode.should.equal(200);
                    res.body.message.should.contain("succesfully restored to version " + 0);
                    done();
                });
            });
        });
    });

    after(function (done) {
        //destroy graphs
        this.timeout(60000);
        db.deleteGraphs(function (err, data) {
            should.equal(err, null);
            GLOBAL.tests.server.close();
            done();
        });
    });
});