const path = require("path");
const Pathfinder = global.Pathfinder;
const Config = require(Pathfinder.absPathInSrcFolder("models/meta/config.js")).Config;
const md5File = require("md5-file");

module.exports = {
    md5: md5File.sync(Pathfinder.absPathInApp("/test/mockdata/files/test_folder_restore/folderWithOnlyOneFile.zip")),
    name: "folderWithOnlyOneFile.zip",
    extension: "zip",
    location: Pathfinder.absPathInApp("/test/mockdata/files/test_folder_restore/folderWithOnlyOneFile.zip"),
    metadata: [
        {
            prefix: "dcterms",
            shortName: "abstract",
            value: "This is a folderWithOnlyOneFile file and its search tag is folderWithOnlyOneFile.zip. It is a fantastic test of search for specific metadata."
        },
        {
            prefix: "dcterms",
            shortName: "abstract",
            value: "This is a zip file for testing the folder restore feature."
        },
        {
            prefix: "dcterms",
            shortName: "title",
            value: "folderWithOnlyOneFile file."
        }
    ]
};
