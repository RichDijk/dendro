const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const _ = require('underscore');
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

const privateProject = require(Config.absPathInTestsFolder("mockdata/projects/private_project.js"));
const privateProjectHTMLTests = require(Config.absPathInTestsFolder("mockdata/projects/private_project_for_html.js"))

const folder = require(Config.absPathInTestsFolder("mockdata/folders/folder.js"));

const db = appUtils.requireUncached(Config.absPathInTestsFolder("utils/db/db.Test.js"));
const deleteProjectsUnit = appUtils.requireUncached(Config.absPathInTestsFolder("units/projects/deleteProjects.Unit.js"));

describe("Undelete private Project Tests", function () {
    before(function (done) {
        this.timeout(60000);
        deleteProjectsUnit.setup(function (err, results) {
            should.equal(err, null);
            done();
        });
    });

    describe("[JSON] [POST] /project/:handle?undelete", function () {
        it("Should give an error message when a project does not exist", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                projectUtils.undeleteProject(true, agent, "ARandomProject", function (err, res) {
                    res.statusCode.should.equal(404);
                    res.text.should.contain("Resource not found at uri");
                    res.text.should.contain("ARandomProject");
                    done();
                });
            })
        });

        it("Should give an error when the user is not authenticated", function (done) {
            const app = GLOBAL.tests.app;
            const agent = chai.request.agent(app);
            projectUtils.undeleteProject(true, agent, privateProject.handle, function (err, res) {
                res.statusCode.should.equal(401);
                res.body.message.should.equal("Permission denied : cannot undelete project because you do not have permissions to administer this project.");
                done();
            });
        });

        it("Should give an error when the user is logged in as demouser2(a collaborator in the project with demouser1) and tries to undelete a project created by demouser1 that is currently deleted", function (done) {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent) {
                projectUtils.undeleteProject(true, agent, privateProject.handle, function (err, res) {
                    res.statusCode.should.equal(401);
                    res.body.message.should.equal("Permission denied : cannot undelete project because you do not have permissions to administer this project.");
                    done();
                });
            })
        });

        it("Should give an error when the user is logged in as demouser3(nor collaborator nor creator of the project) and tries to undelete the project that is currently deleted", function (done) {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent) {
                projectUtils.undeleteProject(true, agent, privateProject.handle, function (err, res) {
                    res.statusCode.should.equal(401);
                    res.body.message.should.equal("Permission denied : cannot undelete project because you do not have permissions to administer this project.");
                    done();
                });
            })
        });

        it("Should give a success response when the user is logged in as demouser1(the creator of the project) and tries to undelete the project that is currently deleted", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                projectUtils.undeleteProject(true, agent, privateProject.handle, function (err, res) {
                    res.statusCode.should.equal(200);
                    res.body.message[0].should.equal("Project " + privateProject.handle + " successfully recovered");
                    done();
                });
            })
        })
    });

    describe("[HTML] [POST] /project/:handle?undelete", function () {

        it("Should give an error message when a project does not exist", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                projectUtils.undeleteProject(false, agent, "ARandomProject", function (err, res) {
                    res.statusCode.should.equal(404);
                    res.text.should.contain("Resource not found at uri");
                    res.text.should.contain("ARandomProject");
                    done();
                });
            })
        });

        it("Should give an error when the user is not authenticated", function (done) {
            const app = GLOBAL.tests.app;
            const agent = chai.request.agent(app);
            projectUtils.undeleteProject(false, agent, privateProjectHTMLTests.handle, function (err, res) {
                res.statusCode.should.equal(401);
                res.text.should.contain("Permission denied : cannot undelete project because you do not have permissions to administer this project.");
                done();
            });
        });

        it("Should give an error when the user is logged in as demouser2(a collaborator in the project with demouser1) and tries to undelete a project created by demouser1 that is currently deleted", function (done) {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent) {
                projectUtils.undeleteProject(false, agent, privateProjectHTMLTests.handle, function (err, res) {
                    res.statusCode.should.equal(401);
                    res.text.should.contain("Permission denied : cannot undelete project because you do not have permissions to administer this project.");
                    done();
                });
            })
        });

        it("Should give an error when the user is logged in as demouser3(nor collaborator nor creator of the project) and tries to undelete the project that is currently deleted", function (done) {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent) {
                projectUtils.undeleteProject(false, agent, privateProjectHTMLTests.handle, function (err, res) {
                    res.statusCode.should.equal(401);
                    res.text.should.contain("Permission denied : cannot undelete project because you do not have permissions to administer this project.");
                    done();
                });
            })
        });

        it("Should give a success response when the user is logged in as demouser1(the creator of the project) and tries to undelete the project that is currently deleted", function (done) {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent) {
                projectUtils.undeleteProject(false, agent, privateProjectHTMLTests.handle, function (err, res) {
                    res.statusCode.should.equal(200);
                    res.text.should.contain("This is a metadata only test project with handle metadataonlyhtmlprojectcreatedbydemouser1 and created by demouser1");
                    res.text.should.not.contain("Permission denied : cannot undelete project because you do not have permissions to administer this project.");
                    res.text.should.not.contain("This is a metadata only test project with handle metadataonlyhtmlprojectcreatedbydemouser1 and created by demouser1 Creator Deleted");
                    done();
                });
            })
        })
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