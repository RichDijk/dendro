const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
chai.use(chaiHttp);

const rlequire = require("rlequire");
const Config = rlequire("dendro", "src/models/meta/config.js").Config;

const userUtils = rlequire("dendro", "test/utils/user/userUtils.js");
const itemUtils = rlequire("dendro", "test/utils/item/itemUtils.js");
const appUtils = rlequire("dendro", "test/utils/app/appUtils.js");

const demouser1 = rlequire("dendro", "test/mockdata/users/demouser1.js");
const demouser2 = rlequire("dendro", "test/mockdata/users/demouser2.js");
const demouser3 = rlequire("dendro", "test/mockdata/users/demouser3.js");

const privateProject = rlequire("dendro", "test/mockdata/projects/private_project.js");
const invalidProject = rlequire("dendro", "test/mockdata/projects/invalidProject.js");

const testFolder1 = rlequire("dendro", "test/mockdata/folders/testFolder1.js");
const notFoundFolder = rlequire("dendro", "test/mockdata/folders/notFoundFolder.js");
const folderForDemouser2 = rlequire("dendro", "test/mockdata/folders/folderDemoUser2");
const addMetadataToFoldersUnit = rlequire("dendro", "test/units/metadata/addMetadataToFolders.Unit.js");
const db = rlequire("dendro", "test/utils/db/db.Test.js");

describe("Private project testFolder1 level ?version", function ()
{
    this.timeout(Config.testsTimeout);
    before(function (done)
    {
        addMetadataToFoldersUnit.setup(function (err, results)
        {
            should.equal(err, null);
            done();
        });
    });

    describe("[GET] [PRIVATE PROJECT] /project/" + privateProject.handle + "/data/foldername?version", function ()
    {
        // API ONLY
        it("Should give an error if the request type for this route is HTML", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.getItemVersion(false, agent, privateProject.handle, testFolder1.name, testFolder1.version, function (err, res)
                {
                    res.statusCode.should.equal(400);
                    done();
                });
            });
        });

        it("Should give an error if the user is unauthenticated", function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);

            itemUtils.getItemVersion(true, agent, privateProject.handle, testFolder1.name, testFolder1.version, function (err, res)
            {
                res.statusCode.should.equal(401);// because it is a private project
                done();
            });
        });

        it("Should give an error if the project does not exist", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.getItemVersion(true, agent, invalidProject.handle, testFolder1.name, testFolder1.version, function (err, res)
                {
                    res.statusCode.should.equal(404);
                    res.body.result.should.equal("not_found");
                    res.body.message.should.be.an("array");
                    res.body.message.length.should.equal(1);
                    res.body.message[0].should.contain("Resource not found at uri ");
                    res.body.message[0].should.contain(testFolder1.name);
                    res.body.message[0].should.contain(invalidProject.handle);
                    done();
                });
            });
        });

        it("Should give an error if the folder identified by foldername does not exist", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.getItemVersion(true, agent, privateProject.handle, notFoundFolder.name, notFoundFolder.version, function (err, res)
                {
                    res.statusCode.should.equal(404);
                    res.body.result.should.equal("not_found");
                    res.body.message.should.be.an("array");
                    res.body.message.length.should.equal(1);
                    res.body.message[0].should.contain("Resource not found at uri ");
                    res.body.message[0].should.contain(notFoundFolder.name);
                    res.body.message[0].should.contain(privateProject.handle);
                    done();
                });
            });
        });

        it("Should give an error if the user is logged in as demouser3(not a collaborator nor creator of the project)", function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                itemUtils.getItemVersion(true, agent, privateProject.handle, testFolder1.name, testFolder1.version, function (err, res)
                {
                    res.statusCode.should.equal(401);// because it is a private project
                    done();
                });
            });
        });

        it("Should give the folder versions if the folder exists and if the user is logged in as demouser1(the creator of the project)", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.getItemVersion(true, agent, privateProject.handle, testFolder1.name, testFolder1.version, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    res.body.uri.should.not.equal(null);
                    res.body.changes.should.be.instanceof(Array);
                    res.body.changes.length.should.equal(3);// The abstract, title and creator descriptors
                    should.not.exist(res.body.ddr.versionCreator.ddr.password);
                    done();
                });
            });
        });

        it("Should give the folder versions if the folder exists and if the user is logged in as demouser2(a collaborator on the project)", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                itemUtils.getItemVersion(true, agent, privateProject.handle, folderForDemouser2.name, folderForDemouser2.version, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    res.body.uri.should.not.equal(null);
                    res.body.changes.should.be.instanceof(Array);
                    res.body.changes.length.should.equal(3);// The abstract, title and creator descriptors
                    should.not.exist(res.body.ddr.versionCreator.ddr.password);
                    done();
                });
            });
        });

        it("Should give an error if no version is specified", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                itemUtils.getItemVersion(true, agent, privateProject.handle, testFolder1.name, null, function (err, res)
                {
                    res.statusCode.should.equal(405);
                    done();
                });
            });
        });
    });

    after(function (done)
    {
        // destroy graphs

        appUtils.clearAppState(function (err, data)
        {
            should.equal(err, null);
            done(err);
        });
    });
});
