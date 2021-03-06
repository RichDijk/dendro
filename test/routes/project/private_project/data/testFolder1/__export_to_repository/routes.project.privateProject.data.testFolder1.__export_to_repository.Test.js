process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
chai.use(chaiHttp);

const rlequire = require("rlequire");
const Config = rlequire("dendro", "src/models/meta/config.js").Config;

const projectUtils = rlequire("dendro", "test/utils/project/projectUtils.js");
const userUtils = rlequire("dendro", "test/utils/user/userUtils.js");
const folderUtils = rlequire("dendro", "test/utils/folder/folderUtils.js");
const httpUtils = rlequire("dendro", "test/utils/http/httpUtils.js");
const repositoryUtils = rlequire("dendro", "test/utils/repository/repositoryUtils.js");
const appUtils = rlequire("dendro", "test/utils/app/appUtils.js");

const demouser1 = rlequire("dendro", "test/mockdata/users/demouser1.js");
const demouser2 = rlequire("dendro", "test/mockdata/users/demouser2.js");
const demouser3 = rlequire("dendro", "test/mockdata/users/demouser3.js");

const privateProject = rlequire("dendro", "test/mockdata/projects/private_project.js");
const folder = rlequire("dendro", "test/mockdata/folders/folder.js");
const testFolder1 = rlequire("dendro", "test/mockdata/folders/testFolder1.js");

const createExportToRepositoriesConfig = rlequire("dendro", "test/units/repositories/createExportToRepositoriesConfigs.Unit.js");

const db = rlequire("dendro", "test/utils/db/db.Test.js");

let createdUnknownRepo = rlequire("dendro", "test/mockdata/repositories/created/created_unknown_export_repo.js");
let createdB2shareConfigInvalidToken = rlequire("dendro", "test/mockdata/repositories/created/createdB2shareWithInvalidToken.js");
let createdB2shareConfigInvalidUrl = rlequire("dendro", "test/mockdata/repositories/created/createdB2shareWithInvalidUrl.js");
let createdZenodoConfigInvalidToken = rlequire("dendro", "test/mockdata/repositories/created/createdZenodoWithInvalidToken.js");

let b2shareData, ckanData, zenodoData, dspaceData, eprintsData, figshareData;

describe("Export private project testFolder1 level to repositories tests", function ()
{
    this.timeout(Config.testsTimeout);
    before(function (done)
    {
        createExportToRepositoriesConfig.init(function (err, results)
        {
            should.equal(err, null);
            repositoryUtils.getMyExternalRepositories(true, agent, function (err, res)
            {
                res.statusCode.should.equal(200);
                res.body.length.should.equal(5);// TODO change this after dspace is working to 6
                b2shareData = _.find(res.body, function (externalRepo)
                {
                    return externalRepo.ddr.hasPlatform.foaf.nick == "b2share";
                });
                ckanData = _.find(res.body, function (externalRepo)
                {
                    return externalRepo.ddr.hasPlatform.foaf.nick == "ckan";
                });
                zenodoData = _.find(res.body, function (externalRepo)
                {
                    return externalRepo.ddr.hasPlatform.foaf.nick == "zenodo";
                });
                // TODO add the line bellow when dspace is working
                // dspaceData = _.find(res.body, function (externalRepo) {return externalRepo.ddr.hasPlatform.foaf.nick == "dspace"});
                eprintsData = _.find(res.body, function (externalRepo)
                {
                    return externalRepo.ddr.hasPlatform.foaf.nick == "eprints";
                });
                figshareData = _.find(res.body, function (externalRepo)
                {
                    return externalRepo.ddr.hasPlatform.foaf.nick == "figshare";
                });
                done();
            });
        });
    });

    describe("[POST] [B2SHARE] /project/:handle/data/:foldername?export_to_repository", function ()
    {
        it("Should give an error when the target repository is invalid[not b2share zenodo etc]", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                // jsonOnly, projectHandle, folderPath, agent, exportData, cb
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, createdUnknownRepo, function (err, res)
                {
                    console.log(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid target repository");
                    done();
                });
            });
        });

        it("Should give an error when the user is unauthenticated", function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);
            repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: b2shareData}, function (err, res)
            {
                res.statusCode.should.equal(401);
                res.body.message.should.equal("Permission denied : cannot export resource because you do not have permissions to edit this project.");
                done();
            });
        });

        it("Should give an error message when the user is logged in as demouser3(not a creator or collaborator of the project)", function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: b2shareData}, function (err, res)
                {
                    res.statusCode.should.equal(401);
                    done();
                });
            });
        });

        it("Should give a success message when the user is logged in as demouser2(a collaborator of the project)", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: b2shareData}, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    done();
                });
            });
        });

        it("Should give an error when there is an invalid access token for deposit although a creator or collaborator is logged in", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: createdB2shareConfigInvalidToken}, function (err, res)
                {
                    res.statusCode.should.equal(500);
                    done();
                });
            });
        });

        it("Should give an error when there is an invalid external url for deposit although a creator or collaborator is logged in", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: createdB2shareConfigInvalidUrl}, function (err, res)
                {
                    res.statusCode.should.equal(500);
                    done();
                });
            });
        });

        it("Should give an error when the project does not exist although a creator or collaborator is logged in", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, "unknownProjectHandle", testFolder1.pathInProject + testFolder1.name, agent, {repository: b2shareData}, function (err, res)
                {
                    res.statusCode.should.equal(401);// TODO aqui devia ser 404 certo ?
                    done();
                });
            });
        });

        it("Should give an error when the folder to export does not exist although a creator or collaborator is logged in", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, "randomfoldername", agent, {repository: b2shareData}, function (err, res)
                {
                    res.statusCode.should.equal(404);
                    done();
                });
            });
        });

        it("Should give a success message when the folder to export exists and a creator or collaborator is logged in", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: b2shareData}, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    done();
                });
            });
        });
    });

    describe("[POST] [ZENODO] /project/:handle/data/:foldername?export_to_repository", function ()
    {
        it("Should give an error when the target repository is invalid[not b2share zenodo etc]", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                // jsonOnly, projectHandle, folderPath, agent, exportData, cb
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, createdUnknownRepo, function (err, res)
                {
                    console.log(res);
                    res.statusCode.should.equal(500);
                    res.body.message.should.equal("Invalid target repository");
                    done();
                });
            });
        });

        it("Should give an error when the user is unauthenticated", function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);
            repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: zenodoData}, function (err, res)
            {
                res.statusCode.should.equal(401);
                res.body.message.should.equal("Permission denied : cannot export resource because you do not have permissions to edit this project.");
                done();
            });
        });

        it("Should give an error message when the user is logged in as demouser3(not a collaborator or creator of the project)", function (done)
        {
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: zenodoData}, function (err, res)
                {
                    res.statusCode.should.equal(401);
                    done();
                });
            });
        });

        it("Should give a success message when the user is logged in as demouser2(a collaborator of the project)", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: zenodoData}, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    done();
                });
            });
        });

        it("Should give an error when there is an invalid access token for deposit although a creator or collaborator is logged in", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: createdZenodoConfigInvalidToken}, function (err, res)
                {
                    res.statusCode.should.equal(500);
                    done();
                });
            });
        });

        it("Should give an error when the project does not exist although a creator or collaborator is logged in", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, "unknownProjectHandle", testFolder1.pathInProject + testFolder1.name, agent, {repository: zenodoData}, function (err, res)
                {
                    res.statusCode.should.equal(401);// TODO aqui devia ser 404 certo ?
                    done();
                });
            });
        });

        it("Should give an error when the folder to export does not exist although a creator or collaborator is logged in", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, "randomfoldername", agent, {repository: zenodoData}, function (err, res)
                {
                    res.statusCode.should.equal(400);
                    done();
                });
            });
        });

        it("Should give a success message when the folder to export exists and a creator or collaborator is logged in", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                repositoryUtils.exportFolderToRepository(true, privateProject.handle, testFolder1.pathInProject + testFolder1.name, agent, {repository: zenodoData}, function (err, res)
                {
                    res.statusCode.should.equal(200);
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
