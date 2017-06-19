var Config = function() { return GLOBAL.Config; }();
var Class = require(Config.absPathInSrcFolder("/models/meta/class.js")).Class;
var Descriptor = require(Config.absPathInSrcFolder("/models/meta/descriptor.js")).Descriptor;
var Post = require(Config.absPathInSrcFolder("/models/social/post.js")).Post;
var ArchivedResource = require(Config.absPathInSrcFolder("/models/versions/archived_resource.js")).ArchivedResource;
var InformationElement = require(Config.absPathInSrcFolder("/models/directory_structure/information_element.js")).InformationElement;
var DbConnection = require(Config.absPathInSrcFolder("/kb/db.js")).DbConnection;
var uuid = require('uuid');

var db = function() { return GLOBAL.db.default; }();
var db_social = function() { return GLOBAL.db.social; }();

var gfs = function() { return GLOBAL.gfs.default; }();
var _ = require('underscore');
var async = require('async');

function FileSystemPost (object)
{
    FileSystemPost.baseConstructor.call(this, object);
    var self = this;

    if(object.uri != null)
    {
        self.uri = object.uri;
    }
    else
    {
        self.uri = Config.baseUri + "/posts/" + uuid.v4();
    }

    self.copyOrInitDescriptors(object);

    self.rdf.type = "ddr:FileSystemPost";

    return self;
}

FileSystemPost.buildFromRmdirOperation = function (userUri, project, folder, callback) {
    let title = userUri.split("/").pop() + " deleted folder " + folder.nie.title;
    let newPost = new FileSystemPost({
        ddr: {
            projectUri: project.uri,
            changeType: "rmdir"
        },
        dcterms: {
            creator: userUri,
            title: title
        },
        schema: {
            sharedContent: folder.uri
        }
    });
    callback(null, newPost);
};

FileSystemPost.buildFromMkdirOperation = function (userUri, project, folder, callback) {
    let title = userUri.split("/").pop() + " created folder " + folder.nie.title;
    let newPost = new FileSystemPost({
        ddr: {
            projectUri: project.uri,
            changeType: "mkdir"
        },
        dcterms: {
            creator: userUri,
            title: title
        },
        schema: {
            sharedContent: folder.uri
        }
    });
    callback(null, newPost);
};

FileSystemPost.buildFromUpload = function (userUri, project, file, callback) {

};


FileSystemPost.prototype.getResourceInfo = function (callback) {
    var self = this;
    let resourceUri = self.schema.sharedContent;

    InformationElement.findByUri(resourceUri, function (err, resource) {
        if(!err)
        {
            if(!resource.metadataQuality)
            {
                resource.metadataQuality = 0;
            }
            callback(err, resource);
        }
        else
        {
            console.error("Error getting resource info from a FileSystemPost");
            console.error(err);
            callback(err, resource);
        }
    }, null, db.graphUri, false, null, null);
};


/*FileSystemPost.prefixedRDFType = "ddr:FileSystemPost";*/

FileSystemPost = Class.extend(FileSystemPost, Post);

module.exports.FileSystemPost = FileSystemPost;




