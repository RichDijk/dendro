const path = require("path");
const rlequire = require("rlequire");
const Config = rlequire("dendro", "src/models/meta/config.js").Config;

const isNull = rlequire("dendro", "src/utils/null.js").isNull;

exports.index = function (req, res)
{
    res.render("index",
        {}
    );
};

exports.analytics_tracking_code = function (req, res)
{
    let acceptsHTML = req.accepts("html");
    const acceptsJSON = req.accepts("json");

    if (typeof Config.analytics_tracking_code !== "undefined")
    {
        // will be null if the client does not accept html
        if (acceptsJSON && !acceptsHTML)
        {
            res.json(
                Config.analytics_tracking_code
            );
        }
        else
        {
            res.sendStatus(405);
        }
    }
};
