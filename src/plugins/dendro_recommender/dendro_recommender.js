var path = require('path');

var Config = require("../../models/meta/config.js").Config;

var Class = require(Config.absPathInSrcFolder("/models/meta/class.js")).Class;
var Plugin = require(Config.absPathInSrcFolder("/plugins/plugin.js")).Plugin;
var Permissions = require(Config.absPathInSrcFolder("/models/meta/permissions.js")).Permissions;

var DendroRecommender = function()
{
    var self = this;
    return self;
};

DendroRecommender.setup = function(app)
{
    var self = this;
    var pluginRootFolder = self.getPluginRootFolder();

    var interactions = require(path.join(pluginRootFolder, "package", "controllers", "interactions.js"));

    app = DendroRecommender.registerRoute(app, 'POST', 'push_interactions/from/:starting_instant_in_iso_format',[Permissions.acl.user], interactions.refresh_interactions);
    app = DendroRecommender.registerRoute(app, 'POST', 'push_interactions/all', [Permissions.acl.user], interactions.refresh_interactions);
    app = DendroRecommender.registerRoute(app, 'POST', 'push_interactions/random', [Permissions.acl.user], interactions.generate_random_interactions);
    app = DendroRecommender.registerRoute(app, 'GET', 'interactions/user/:username', [Permissions.acl.user], interactions.by_user);
    //app = DendroRecommender.registerRoute(app, 'POST', new RegExp('project\/([^\/]+)(\/data)?$'), [Permissions.acl.creator_or_contributor], interactions.register);

    /**
     * If the plugin has to serve its own static files (JS files, for example, register route).
     */
    app = self.registerStaticFilesRoute(app);

    return app;
};

/*
"Static" methods and fields
 */

/**
 * Need to overload the .config attribute in every plugin
 * @type {Object|*}
 */
DendroRecommender.config = require(path.join(__dirname, "integration", "config.json"));

DendroRecommender = Class.extend(DendroRecommender, Plugin);

module.exports.DendroRecommender = DendroRecommender;