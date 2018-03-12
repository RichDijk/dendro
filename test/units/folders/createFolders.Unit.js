process.env.NODE_ENV = "test";

const Pathfinder = global.Pathfinder;
const isNull = require(Pathfinder.absPathInSrcFolder("/utils/null.js")).isNull;

const chai = require("chai");
chai.use(require("chai-http"));
const async = require("async");
const path = require("path");

const userUtils = require(Pathfinder.absPathInTestsFolder("utils/user/userUtils.js"));
const itemUtils = require(Pathfinder.absPathInTestsFolder("/utils/item/itemUtils"));
const unitUtils = require(Pathfinder.absPathInTestsFolder("utils/units/unitUtils.js"));

const demouser1 = require(Pathfinder.absPathInTestsFolder("mockdata/users/demouser1"));

const createProjectsUnit = require(Pathfinder.absPathInTestsFolder("units/projects/createProjects.Unit.js"));

const folder = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folder.js"));
const testFolder1 = require(Pathfinder.absPathInTestsFolder("mockdata/folders/testFolder1.js"));
const testFolder2 = require(Pathfinder.absPathInTestsFolder("mockdata/folders/testFolder2.js"));
const folderDemoUser2 = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folderDemoUser2.js"));
const folderExportCkan = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folderExportCkan.js"));
const folderExportedCkanNoDiffs = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folderExportedCkanNoDiffs.js"));
const folderExportedCkanDendroDiffs = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folderExportedCkanDendroDiffs.js"));
const folderExportedCkanCkanDiffs = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folderExportedCkanCkanDiffs.js"));
const folderMissingDescriptors = require(Pathfinder.absPathInTestsFolder("mockdata/folders/folderMissingDescriptors.js"));

const projectsData = createProjectsUnit.projectsData;
const foldersData = [folder, testFolder1, testFolder2, folderDemoUser2, folderExportCkan, folderExportedCkanNoDiffs, folderExportedCkanDendroDiffs, folderExportedCkanCkanDiffs, folderMissingDescriptors];

let AddContributorsToProjectsUnit = require(Pathfinder.absPathInTestsFolder("units/projects/addContributorsToProjects.Unit.js"));
class CreateFolders extends AddContributorsToProjectsUnit
{
    static load (callback)
    {
        const self = this;
        unitUtils.startLoad(self);
        super.load(function (err, results)
        {
            if (err)
            {
                callback(err, results);
            }
            else
            {
                userUtils.loginUser(demouser1.username, demouser1.password, function (err, agent)
                {
                    if (err)
                    {
                        callback(err, agent);
                    }
                    else
                    {
                        async.mapSeries(projectsData, function (projectData, cb)
                        {
                            async.mapSeries(foldersData, function (folderData, cb)
                            {
                                itemUtils.createFolder(true, agent, projectData.handle, folderData.pathInProject, folderData.name, function (err, res)
                                {
                                    if (!isNull(err))
                                    {
                                        cb(err, results);
                                    }
                                    else
                                    {
                                        cb(null, results);
                                    }
                                });
                            }, function (err, results)
                            {
                                if (!isNull(err))
                                {
                                    cb(err, results);
                                }
                                else
                                {
                                    cb(null, results);
                                }
                            });
                        }, function (err, results)
                        {
                            if (isNull(err))
                            {
                                unitUtils.endLoad(self, function (err, results)
                                {
                                    callback(err, results);
                                });
                            }
                            else
                            {
                                callback(err, results);
                            }
                        });
                    }
                });
            }
        });
    }
    static init (callback)
    {
        super.init(callback);
    }
    static shutdown (callback)
    {
        super.shutdown(callback);
    }
}

CreateFolders.foldersData = foldersData;

module.exports = CreateFolders;
