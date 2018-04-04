const fs = require("fs");
const path = require("path");
const _ = require("underscore");

const Pathfinder = global.Pathfinder;
const Config = require(Pathfinder.absPathInSrcFolder("models/meta/config.js")).Config;
const isNull = require(Pathfinder.absPathInSrcFolder("/utils/null.js")).isNull;
const Logger = require(Pathfinder.absPathInSrcFolder("utils/logger.js")).Logger;

const childProcess = require("child_process");
const startContainersScript = Pathfinder.absPathInApp("/conf/scripts/docker/start_containers.sh");
const stopContainersScript = Pathfinder.absPathInApp("/conf/scripts/docker/stop_containers.sh");
const createCheckpointScript = Pathfinder.absPathInApp("/conf/scripts/docker/create_checkpoint.sh");
const restoreCheckpointScript = Pathfinder.absPathInApp("/conf/scripts/docker/restore_checkpoint.sh");
const restartContainersScript = Pathfinder.absPathInApp("/conf/scripts/docker/restart_containers.sh");
const nukeAndRebuildScript = Pathfinder.absPathInApp("/conf/scripts/docker/nuke_and_rebuild.sh");
const dataFolder = Pathfinder.absPathInApp("/data");

const DockerCheckpointManager = function ()
{
};

DockerCheckpointManager._availableCheckpoints = {};

if (Config.docker.reuse_checkpoints && Config.docker.active)
{
    const mkdirp = require("mkdirp");
    mkdirp.sync(dataFolder);
    Logger.log("Checking out all Docker containers to see which can be reused...");
    const checkpointFolders = fs.readdirSync(dataFolder).filter(function (file)
    {
        return fs.statSync(path.join(dataFolder, file)).isDirectory();
    });

    _.map(checkpointFolders, function (folderName)
    {
        DockerCheckpointManager._availableCheckpoints[folderName] = true;
    });
}

DockerCheckpointManager.stopAllContainers = function ()
{
    if (Config.docker && Config.docker.active)
    {
        Logger.log("Stopping all Docker containers.");
        childProcess.execSync(`/bin/bash -c "${stopContainersScript}"`, {
            cwd: Pathfinder.appDir,
            stdio: [0, 1, 2]
        });

        Logger.log("Stopped all containers");
    }
};

DockerCheckpointManager.startAllContainers = function ()
{
    if (Config.docker && Config.docker.active)
    {
        Logger.log("Starting all Docker containers.");
        childProcess.execSync(`/bin/bash -c "${startContainersScript}"`, {
            cwd: Pathfinder.appDir,
            stdio: [0, 1, 2]
        });

        Logger.log("Started all containers");
    }
};

DockerCheckpointManager.checkpointExists = function (checkpointName)
{
    if (Config.docker && Config.docker.active)
    {
        return DockerCheckpointManager._availableCheckpoints[checkpointName];
    }
};

DockerCheckpointManager.createCheckpoint = function (checkpointName)
{
    if (Config.docker && Config.docker.active)
    {
        Logger.log("Creating Docker checkpoint " + checkpointName);
        if (isNull(DockerCheckpointManager._availableCheckpoints[checkpointName]))
        {
            childProcess.execSync(`/bin/bash -c "${createCheckpointScript} ${checkpointName}"`, {
                cwd: Pathfinder.appDir,
                stdio: [0, 1, 2]
            });

            Logger.log("Saved checkpoint with name " + checkpointName);
            DockerCheckpointManager._availableCheckpoints[checkpointName] = true;
        }
    }
};

DockerCheckpointManager.restoreCheckpoint = function (checkpointName)
{
    if (Config.docker && Config.docker.active)
    {
        Logger.log("Restoring Docker checkpoint " + checkpointName);
        if (DockerCheckpointManager._availableCheckpoints[checkpointName])
        {
            childProcess.execSync(`/bin/bash -c "${restoreCheckpointScript} ${checkpointName}"`, {
                cwd: Pathfinder.appDir,
                stdio: [0, 1, 2]
            });

            Logger.log("Restored Docker checkpoint with name " + checkpointName + " of Docker containers.");
            return true;
        }

        return false;
    }
};

DockerCheckpointManager.deleteAll = function (onlyOnce, evenCurrentState)
{
    if (Config.docker && Config.docker.active)
    {
        const performOperation = function ()
        {
            Logger.log("Deleting all Docker containers.");
            const del = require("del");
            if (evenCurrentState)
            {
                del.sync([dataFolder + "/*"], {force: true});
            }
            else
            {
                del.sync([dataFolder + "/*", "!" + dataFolder + "/current"], {force: true});
            }
            Logger.log("Deleted all containers.");
        };

        if (onlyOnce)
        {
            if (!DockerCheckpointManager._deletedOnce)
            {
                performOperation();
                DockerCheckpointManager._deletedOnce = true;
            }
        }
        else
        {
            performOperation();
        }
    }
};

DockerCheckpointManager.nukeAndRebuild = function (onlyOnce)
{
    if (Config.docker && Config.docker.active)
    {
        const performOperation = function ()
        {
            Logger.log("Rebuilding all Docker containers.");
            childProcess.execSync(`/bin/bash -c "${nukeAndRebuildScript}"`, {
                cwd: Pathfinder.appDir,
                stdio: [0, 1, 2]
            });

            Logger.log("Nuked and rebuilt all containers.");
        };

        if (onlyOnce)
        {
            if (!DockerCheckpointManager._nukedOnce)
            {
                performOperation();
                DockerCheckpointManager._nukedOnce = true;
            }
        }
        else
        {
            performOperation();
        }
    }
};

DockerCheckpointManager.restartVM = function (onlyOnce)
{
    Logger.log("Restarting all Docker containers.");
    if (Config.docker && Config.docker.active)
    {
        const performOperation = function ()
        {
            childProcess.execSync(`/bin/bash -c "${restartContainersScript}"`, {
                cwd: Pathfinder.appDir,
                stdio: [0, 1, 2]
            });

            Logger.log("Restarted all containers");
        };

        if (onlyOnce)
        {
            if (!DockerCheckpointManager._restartedOnce)
            {
                performOperation();
                DockerCheckpointManager._restartedOnce = true;
            }
        }
        else
        {
            performOperation();
        }
        Logger.log("Restarted all containers.");
    }
};

module.exports.DockerCheckpointManager = DockerCheckpointManager;
