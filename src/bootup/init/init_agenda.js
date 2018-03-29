const Agenda = require("agenda");
const Pathfinder = global.Pathfinder;
const path = require("path");
const Config = require(Pathfinder.absPathInSrcFolder(path.join("models", "meta", "config.js"))).Config;
const isNull = require(Pathfinder.absPathInSrcFolder("/utils/null.js")).isNull;
const Job = require(Pathfinder.absPathInSrcFolder("/jobs/models/job.js")).Job;

const init = function (app, callback) {
    /*
    let agenda = new Agenda({mongo: Config.jobsStorageClient});
    Config.jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(',') : [];
    Config.jobTypes.forEach(function(type) {
        //TODO change this para um for para tudo o que está dentro DA PASTA
        require(Pathfinder.absPathInSrcFolder("/jobs/jobsStartup/" + type))(agenda);
    });
    Config.agenda = agenda;
    require(Pathfinder.absPathInSrcFolder("/jobs/jobsEvents/mainHandler.js"));
    callback(null);
    */

    Job._types = {};
    Job._agenda = null;
    Job._jobsStorageClient = null;
    Job.initDependencies(function (err) {
        Job._agenda.on("ready", function() {
            Job._agenda.start();
            //AGENDA is now properly initiated and all jobs are defined and have its handlers registered
            //So only now can any job still in mongoDB be fetched and restarted again
            Config.jobTypes.forEach(function(type) {
                let JobType = require(Pathfinder.absPathInSrcFolder("/jobs/models/" + type))[type];
                JobType.fetchJobsStillInMongoAndRestartThem();
            });
            callback(err);
        });
    });
};
module.exports.init = init;