process.env.NODE_ENV = "test";

const path = require("path");
const appDir = path.resolve(path.dirname(require.main.filename), "../../..");
const Pathfinder = require(path.join(appDir, "src", "models", "meta", "pathfinder.js")).Pathfinder;
global.Pathfinder = Pathfinder;
Pathfinder.appDir = appDir;

const Config = require(Pathfinder.absPathInSrcFolder(path.join("models", "meta", "config.js"))).Config;
Config.testsTimeout = 1800000;
console.log("Running in test mode and the app directory is : " + Pathfinder.appDir);

global.Config = Config;

global.tests = {};

// uncomment the first time you run the tests after installing dendro
// require(Pathfinder.absPathInTestsFolder("/init/loadOntologiesCache.Test.js"));

// ERROS
//require(Pathfinder.absPathInTestsFolder("/routes/projects/import/route.projects.import.Test.js"));

//require(Pathfinder.absPathInTestsFolder("/routes/projects/route.projects.Test.js"));

//PUBLIC PROJECT FOLDER LEVEL CALCULATE CKAN REPOSITORY DIFFS
require(Pathfinder.absPathInTestsFolder("/routes/project/public_project/data/folderExportCkan/__calculate_ckan_repository_diffs/routes.project.publicProject.data.folderExportCkan.__calculate_ckan_repository_diffs.Test.js"));

//METADATA PROJECT FOLDER LEVEL CALCULATE CKAN REPOSITORY DIFFS
require(Pathfinder.absPathInTestsFolder("/routes/project/metadata_only_project/data/folderExportCkan/__calculate_ckan_repository_diffs/routes.project.metadataOnlyProject.data.folderExportCkan.__calculate_ckan_repository_diffs.Test.js"));

//PRIVATE PROJECT FOLDER LEVEL CALCULATE CKAN REPOSITORY DIFFS
require(Pathfinder.absPathInTestsFolder("/routes/project/private_project/data/folderExportCkan/__calculate_ckan_repository_diffs/routes.project.privateProject.data.folderExportCkan.__calculate_ckan_repository_diffs.Test.js"));

//PUBLIC PROJECT FOLDER LEVEL EXPORT TO CKAN TESTS
require(Pathfinder.absPathInTestsFolder("/routes/project/public_project/data/folderExportCkan/__export_to_repository/routes.project.publicProject.data.folderExportCkan.__export_to_repository[CKAN].Test.js"));

//METADATA ONLY PROJECT FOLDER LEVEL EXPORT TO CKAN TESTS
require(Pathfinder.absPathInTestsFolder("/routes/project/metadata_only_project/data/folderExportCkan/__export_to_repository/routes.project.metadataOnlyProject.data.folderExportCkan.__export_to_repository[CKAN].Test.js"));

//PRIVATE PROJECT FOLDER LEVEL EXPORT TO CKAN TESTS
require(Pathfinder.absPathInTestsFolder("/routes/project/private_project/data/folderExportCkan/__export_to_repository/routes.project.privateProject.data.folderExportCkan.__export_to_repository[CKAN].Test.js"));

