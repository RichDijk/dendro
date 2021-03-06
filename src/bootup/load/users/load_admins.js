const async = require("async");
const fs = require("fs");

const rlequire = require("rlequire");
const isNull = rlequire("dendro", "src/utils/null.js").isNull;
const Config = rlequire("dendro", "src/models/meta/config.js").Config;
const Logger = rlequire("dendro", "src/utils/logger.js").Logger;
const Administrator = rlequire("dendro", "src/models/administrator.js").Administrator;

const loadAdmins = function (app, callback)
{
    if (Config.startup.load_databases && Config.startup.reload_administrators_on_startup)
    {
        Logger.log_boot_message("Loading default administrators.");
        async.series([
            function (callback)
            {
                Administrator.deleteAll(callback);
            },
            function (callback)
            {
                const createAdmin = function (newAdministrator, callback)
                {
                    const username = newAdministrator.username;
                    const password = newAdministrator.password;
                    const mbox = newAdministrator.mbox;
                    const firstname = newAdministrator.firstname;
                    const surname = newAdministrator.surname;
                    const affiliation = newAdministrator.affiliation;

                    Administrator.findByUsername(username, function (err, administrator)
                    {
                        if (isNull(err) && !isNull(administrator))
                        {
                            return callback(err, administrator);
                        }
                        Logger.log_boot_message("Non-existent administrator " + username + ". Creating new admin...");

                        Administrator.createAndInsertFromObject({
                            foaf: {
                                mbox: mbox,
                                firstName: firstname,
                                surname: surname,
                                affiliation: affiliation
                            },
                            ddr: {
                                username: username,
                                password: password
                            }
                        },
                        function (err, newUser)
                        {
                            if (isNull(err) && !isNull(newUser) && newUser instanceof Administrator)
                            {
                                return callback(err, newUser);
                            }

                            const msg = "Error creating new Administrator" + JSON.stringify(newUser);
                            Logger.log("error", msg);
                            return callback(err, msg);
                        });
                    });
                };

                async.mapSeries(Config.administrators, createAdmin, function (err)
                {
                    if (isNull(err))
                    {
                        Logger.log_boot_message("Admins successfully loaded.");
                    }
                    else
                    {
                        Logger.log("error", "[ERROR] Unable to load admins. Error : " + err);
                    }

                    return callback(err);
                });
            }
        ],
        function (err, results)
        {
            if (isNull(err))
            {
                return callback(null);
            }

            return callback("Error promoting default admins " + JSON.stringify(results));
        });
    }
    else
    {
        return callback(null);
    }
};

module.exports.loadAdmins = loadAdmins;
