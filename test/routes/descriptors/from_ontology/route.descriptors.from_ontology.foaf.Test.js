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
const descriptorUtils = rlequire("dendro", "test/utils/descriptor/descriptorUtils.js");
const appUtils = rlequire("dendro", "test/utils/app/appUtils.js");

const demouser1 = rlequire("dendro", "test/mockdata/users/demouser1.js");
const demouser2 = rlequire("dendro", "test/mockdata/users/demouser2.js");
const demouser3 = rlequire("dendro", "test/mockdata/users/demouser3.js");

const publicProject = rlequire("dendro", "test/mockdata/projects/public_project.js");
const metadataOnlyProject = rlequire("dendro", "test/mockdata/projects/metadata_only_project.js");
const privateProject = rlequire("dendro", "test/mockdata/projects/private_project.js");

const folder = rlequire("dendro", "test/mockdata/folders/folder.js");
const folderForDemouser2 = rlequire("dendro", "test/mockdata/folders/folderDemoUser2.js");
const ontologyPrefix = "foaf";
const addContributorsToProjectsUnit = rlequire("dendro", "test/units/projects/addContributorsToProjects.Unit.js");
const db = rlequire("dendro", "test/utils/db/db.Test.js");

describe("Descriptors from foaf ontology", function (done)
{
    this.timeout(Config.testsTimeout);
    before(function (done)
    {
        addContributorsToProjectsUnit.setup(function (err, results)
        {
            should.equal(err, null);
            done();
        });
    });

    describe("[GET] /descriptors/from_ontology/foaf", function ()
    {
        /**
         * PUBLIC PROJECT
         */
        it("[HTML] It should give a 405 error (method not supported) if the Accept: application/json Header was not sent. User logged in as demouser1(The creator of the Public project " + publicProject.handle + ")", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(false, agent, ontologyPrefix, publicProject.handle, function (err, res)
                {
                    res.should.have.status(405);
                    err.message.should.equal("Method Not Allowed");
                    done();
                });
            });
        });

        it("[JSON] It should give an error when trying to get descriptors from foaf ontology when logged in as demouser1 and passing an unknown project handle in the query", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, "unknownProjectHandle", function (err, res)
                {
                    res.body.message[0].should.include("Resource not found at ");
                    res.body.message[0].should.include("unknownProjectHandle");
                    res.should.have.status(404);
                    done();
                });
            });
        });

        it("[JSON] It should give an error when trying to get descriptors from foaf ontology when logged in as demouser1 and passing null project handle in the query", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, null, function (err, res)
                {
                    res.body.message[0].should.include("Resource not found at ");
                    res.body.message[0].should.include("null");
                    res.should.have.status(404);
                    done();
                });
            });
        });

        it("[JSON] It should get descriptors from foaf ontology when logged in as demouser1(The creator of the Public project " + publicProject.handle + ")", function (done)
        {
            // should return all the descriptors from this ontology -> currently 62 elements
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, publicProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.descriptors.length.should.equal(62);
                    done();
                });
            });
        });

        it("[JSON] It should get the descriptors from foaf ontology when logged in as demouser2(a collaborator of the Public project " + publicProject.handle + ")", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, publicProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.descriptors.length.should.equal(62);
                    done();
                });
            });
        });

        it("[JSON] It should get descriptors from foaf ontology when logged in as demouser3 (not Collaborator or creator of the Public project " + publicProject.handle + ")", function (done)
        {
            // because it is a public project
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, publicProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.descriptors.length.should.equal(62);
                    done();
                });
            });
        });

        it("[JSON] It should not get descriptors from foaf ontology (when unauthenticated and accessing Public project " + publicProject.handle + ")", function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);
            descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, publicProject.handle, function (err, res)
            {
                res.should.have.status(401);
                done();
            });
        });

        /**
         * METADATA_ONLY PROJECT
         */
        it("[HTML] It should give a 405 error (method not supported) if the Accept: application/json Header was not sent. User logged in as demouser1 (The creator of the Metadata Only project " + metadataOnlyProject.handle + ")", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(false, agent, ontologyPrefix, metadataOnlyProject.handle, function (err, res)
                {
                    res.should.have.status(405);
                    err.message.should.equal("Method Not Allowed");
                    done();
                });
            });
        });

        it("[JSON] It should get descriptors from foaf ontology when logged in as demouser1 (The creator of the Metadata Only project " + metadataOnlyProject.handle + ")", function (done)
        {
            // should return all the descriptors from this ontology -> currently 62 elements
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, metadataOnlyProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.descriptors.length.should.equal(62);
                    done();
                });
            });
        });

        it("[JSON] It should get descriptors from foaf ontology when logged in as demouser2 (collaborator of the Metadata Only project " + metadataOnlyProject.handle + ")", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, metadataOnlyProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.descriptors.length.should.equal(62);
                    done();
                });
            });
        });

        it("[JSON] It should get descriptors from foaf ontology when logged in as demouser3 (not collaborator or creator of the Metadata Only project " + metadataOnlyProject.handle + ")", function (done)
        {
            // because it is a metadata-only project
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, metadataOnlyProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.descriptors.length.should.equal(62);
                    done();
                });
            });
        });

        it("[JSON] It should not get descriptors from foaf ontology (when unauthenticated and inside of the Metadata Only project " + metadataOnlyProject.handle + ")", function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);
            descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, metadataOnlyProject.handle, function (err, res)
            {
                res.should.have.status(401);
                done();
            });
        });

        /**
         * PRIVATE PROJECT
         */
        it("[HTML] It should give a 405 error (method not supported) if the Accept: application/json Header was not sent. User logged in as demouser1 (The creator of the Private project " + privateProject.handle + ")", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(false, agent, ontologyPrefix, privateProject.handle, function (err, res)
                {
                    res.should.have.status(405);
                    err.message.should.equal("Method Not Allowed");
                    done();
                });
            });
        });

        it("[JSON] It should get descriptors from foaf ontology when logged in as demouser1 (The creator of the Private project " + privateProject.handle + ")", function (done)
        {
            // should return all the descriptors from this ontology -> currently 62 elements
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, privateProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.descriptors.length.should.equal(62);
                    done();
                });
            });
        });

        it("[JSON] It should get descriptors from foaf ontology when logged in as demouser2 (a collaborator of the Private project " + privateProject.handle + ")", function (done)
        {
            userUtils.loginUser(demouser2.username, demouser2.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, privateProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    res.body.descriptors.length.should.equal(62);
                    done();
                });
            });
        });

        it("[JSON] It should get descriptors from foaf ontology when logged in as demouser3 (not collaborator or creator of the Private project " + privateProject.handle + ")", function (done)
        {
            console.log(demouser3);
            userUtils.loginUser(demouser3.username, demouser3.password, function (err, agent)
            {
                descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, privateProject.handle, function (err, res)
                {
                    res.should.have.status(200);
                    done();
                });
            });
        });

        it("[JSON] It should not get descriptors from foaf ontology (when unauthenticated and inside of the Private project " + privateProject.handle + ")", function (done)
        {
            const app = global.tests.app;
            const agent = chai.request.agent(app);
            descriptorUtils.getProjectDescriptorsFromOntology(true, agent, ontologyPrefix, privateProject.handle, function (err, res)
            {
                res.should.have.status(401);
                done();
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
