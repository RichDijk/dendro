const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const _ = require("underscore");
chai.use(chaiHttp);
const md5 = require("md5");
const fs = require("fs");
var async = require("async");
const csvWriter = require("csv-write-stream");
const Pathfinder = global.Pathfinder;
const Config = require(Pathfinder.absPathInSrcFolder("models/meta/config.js")).Config;

const keywordsUtils = require(Pathfinder.absPathInTestsFolder("utils/keywords/keywordsUtils.js"));
const userUtils = require(Pathfinder.absPathInTestsFolder("utils/user/userUtils.js"));
const fileUtils = require(Pathfinder.absPathInTestsFolder("utils/file/fileUtils.js"));
const itemUtils = require(Pathfinder.absPathInTestsFolder("utils/item/itemUtils.js"));
const descriptorUtils = require(Pathfinder.absPathInTestsFolder("utils/descriptor/descriptorUtils.js"));
const appUtils = require(Pathfinder.absPathInTestsFolder("utils/app/appUtils.js"));

const demouser1 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser1.js"));

const privateProject = require(Pathfinder.absPathInTestsFolder("mockdata/projects/private_project.js"));
const createFoldersUnitKeywords = appUtils.requireUncached(Pathfinder.absPathInTestsFolder("units/folders/createFoldersKeywords.Unit.js"));

const testFolder1 = require(Pathfinder.absPathInTestsFolder("mockdata/folders/testFolder1.js"));
const BusPerformance = require(Pathfinder.absPathInTestsFolder("mockdata/files/keywords/BusPerformance.js"));
const SimulatingVehicle = require(Pathfinder.absPathInTestsFolder("mockdata/files/keywords/SimulatingVehicle.js"));
const driverattitude = require(Pathfinder.absPathInTestsFolder("mockdata/files/keywords/driverattitude.js"));
const RegenerativeBraking = require(Pathfinder.absPathInTestsFolder("mockdata/files/keywords/RegenerativeBraking.js"));
const RoutePlanning = require(Pathfinder.absPathInTestsFolder("mockdata/files/keywords/RoutePlanning.js"));


// Dendro Keywords
describe("Searches DBpedia for important terms", function (done)
{
    this.timeout(Config.testsTimeout);
    before(function (done)
    {
        createFoldersUnitKeywords.setup(function (err, results)
        {
            should.equal(err, null);
            done();
        });
    });


    describe("[POST] [PRIVATE PROJECT] [Valid Cases] /project/" + privateProject.handle + "/data/:foldername?upload", function ()
    {
        it("Should upload a PDF file successfully and extract its text for content-based indexing", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                fileUtils.uploadFile(true, agent, privateProject.handle, testFolder1.name, BusPerformance, function (err, res)
                {
                    res.statusCode.should.equal(200);
                    res.body.should.be.instanceof(Object);
                    res.body.should.be.instanceof(Array);
                    res.body.length.should.equal(1);
                    const newResourceUri = res.body[0].uri;

                    itemUtils.getItemMetadataByUri(true, agent, newResourceUri, function (error, res)
                    {
                        res.statusCode.should.equal(200);
                        res.body.descriptors.should.be.instanceof(Array);
                        artigo = JSON.parse(res.text).descriptors[7].value;
                        descriptorUtils.noPrivateDescriptors(JSON.parse(res.text).descriptors).should.equal(true);

                        descriptorUtils.containsAllMetadata(
                            BusPerformance.metadata,
                            JSON.parse(res.text).descriptors
                        );

                        done();
                    });
                });
            });
        });
    });
    // let artigo;
    // describe("[GET] /keywords/conceptextraction", function ()
    // {
    //     it("[HTML] Simple test to extract POS and lemma", function (done)
    //     {
    //         userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
    //         {
    //             keywordsUtils.preProcessing("a really Interesting string with some words", agent, function (err, res)
    //             {
    //                 res.statusCode.should.equal(200);
    //                 // console.log(res.text);
    //                 res.text.should.contain("interesting");
    //                 res.text.should.contain("string");
    //                 res.text.should.contain("word");
    //                 done();
    //             });
    //         });
    //     });
    //     it("[GET] single term extraction", function (done)
    //     {
    //         userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
    //         {
    //             // console.log(artigo.toString());
    //             keywordsUtils.preProcessing(artigo, agent, function (err, res)
    //             {
    //                 res.statusCode.should.equal(200);
    //                 res.text.should.contain("introduction");
    //                 // console.log(res.text);
    //                 // res.text.should.contain("science");
    //                 keywordsUtils.termExtraction([res.text], [artigo.toString()], agent, function (err, te)
    //                 {
    //                     te.statusCode.should.equal(200);
    //                     // te.text.should.contain("google");
    //                     // te.text.should.contain("kaggle");
    //                     // te.text.should.contain("3.068528194400547");
    //                     // te.text.should.contain("3.068528194400547");
    //
    //                     done();
    //                 });
    //             });
    //         });
    //     });
    //     it("[Get] DBpedia lookup higher frequency items", function (done)
    //     {
    //         userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
    //         {
    //             // console.log(artigo.toString());
    //             keywordsUtils.preProcessing(artigo, agent, function (err, res)
    //             {
    //                 res.statusCode.should.equal(200);
    //                 res.text.should.contain("introduction");
    //                 // console.log(res.text);
    //                 // res.text.should.contain("science");
    //                 keywordsUtils.termExtraction([res.text], [artigo.toString()], agent, function (err, te)
    //                 {
    //                     te.statusCode.should.equal(200);
    //                     console.log(te.text);
    //                     // te.text.should.contain("google");
    //                     // te.text.should.contain("kaggle");
    //                     // te.text.should.contain("3.068528194400547");
    //                     // te.text.should.contain("3.068528194400547");
    //
    //                     keywordsUtils.dbpediaLookup(te.text, agent, function (err, db)
    //                     {
    //                         db.statusCode.should.equal(200);
    //                         console.log(db.body.dbpediaUri.result);
    //                         // db.text.should.contain("Google");
    //                         // db.text.should.contain("Kaggle");
    //                         done();
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // });

    describe("[GET] Complete path using all 5 files", function ()
    {
        let loadfiles = function (lookup, cb)
        {
            fileUtils.uploadFile(true, agent, privateProject.handle, testFolder1.name, lookup, function (err, res)
            {
                res.statusCode.should.equal(200);
                res.body.should.be.instanceof(Object);
                res.body.should.be.instanceof(Array);
                res.body.length.should.equal(1);
                const newResourceUri = res.body[0].uri;
                itemUtils.getItemMetadataByUri(true, agent, newResourceUri, function (error, res)
                {
                    res.statusCode.should.equal(200);
                    res.body.descriptors.should.be.instanceof(Array);
                    cb(null, JSON.parse(res.text).descriptors[7].value);
                });
            });
        };
        /*
        let processfiles = function (lookup, cb)
        {
            keywordsUtils.preProcessing(lookup, agent, function (err, res)
            {
                res.statusCode.should.equal(200);
                cb(null, [res.text, JSON.parse(res.text).text]);

                // console.log(artigos[0]);
            });
        };
        */
        let articles = [];
        let dbpediaTerms;
        let docList = [BusPerformance, SimulatingVehicle, driverattitude, RegenerativeBraking, RoutePlanning];
        it("Should load every pdf and extract their content", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                async.mapSeries(docList, loadfiles, function (err, results)
                {
                    for (let i = 0; i < results.length; i++)
                    {
                        articles.push({text: results[i]});
                    }
                    done();
                });
            });
        });
        it("Should preProcess and extract terms", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                keywordsUtils.processExtract(articles, agent, function (err, te)
                {
                    te.statusCode.should.equal(200);
                    // console.log(te.text);
                    dbpediaTerms = te.body.output.dbpediaTerms.keywords;
                    // keyword = JSON.parse(te.text).dbpediaTerms.keywords;

                    // console.log(keyword);

                    done();
                });
            });
        });
        /*
        it("Should pre process text", function (done)
        {
            userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
            {
                async.mapSeries(artigos, processfiles, function (err, results)
                {
                    for (let i = 0; i < results.length; i++)
                    {
                        preProcessing.push(results[i][0]);
                        //console.log(preProcessing);
                        textprocessado.push(results[i][1]);
                        console.log(textprocessado);
                    }
                    done();
                });
            });
        });

        it("Should extract keywords", function (done)
        {
            keywordsUtils.termExtraction(preProcessing, textprocessado, agent, function (err, te)
            {
                var keyword;
                te.statusCode.should.equal(200);
                // console.log(te.text);
                dbpediaTerms = te.text;
                keyword = JSON.parse(te.text).dbpediaTerms.keywords;

                // console.log(keyword);

                done();
            });
        });
*/

        let dbpediaConcepts = [];
        it("Search terms in dbpedia", function (done)
        {
            this.timeout(1500000);
            // console.log(agent);
            keywordsUtils.dbpediaLookup(dbpediaTerms, agent, function (err, db)
            {
                // console.log(err);
                db.statusCode.should.equal(200);
                dbpediaConcepts = db.body.dbpediaUri.result;
                /*
                let writer = csvWriter();
                if (!fs.existsSync(Pathfinder.absPathInTestsFolder("mockdata/files/keywords/vehicle/vehicle-cvalue-jj.csv")))
                {
                    writer = csvWriter({ separator: ",", headers: [ "searchTerm", "score", "dbpediaLabel", "dbpediaUri", "dbpediaDescription" ]});
                }
                else
                {
                    writer = csvWriter({sendHeaders: false});
                }
                writer.pipe(fs.createWriteStream(Pathfinder.absPathInTestsFolder("mockdata/files/keywords/vehicle/vehicle-cvalue-jj.csv"), {flags: "a"}));
                for (let i = 0; i < dbpediaConcepts.length; i++)
                {
                    writer.write(dbpediaConcepts[i]);
                }
                writer.end();
                */
                done();
            });
        });
        it("Get properties from LOV", function (done)
        {
            this.timeout(1500000);
            keywordsUtils.dbpediaProperties(dbpediaConcepts, agent, function (err, db)
            {
                // console.log(err);
                db.statusCode.should.equal(200);
                /*
                let writer = csvWriter();
                if (!fs.existsSync(Pathfinder.absPathInTestsFolder("mockdata/files/keywords/vehicle/dbpediapropertiescvalue-jj.csv")))
                {
                    writer = csvWriter({headers: ["searchTerm", "lovScore", "lovVocabulary", "lovUri", "lovLabel"]});
                }
                else
                {
                    writer = csvWriter({separator: ",", sendHeaders: false});
                }
                writer.pipe(fs.createWriteStream(Pathfinder.absPathInTestsFolder("mockdata/files/keywords/vehicle/dbpediapropertiescvalue-jj.csv"), {flags: "a"}));
                for (let i = 0; i < db.body.dbpediaUri.result.length; i++)
                {
                    writer.write(db.body.dbpediaUri.result[i]);
                }
                writer.end();
                */
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
