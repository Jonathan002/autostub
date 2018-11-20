"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var fs = require("fs-extra");
var _case = require("case");
var app_state_service_1 = require("./app/services/app-state.service");
var app_taskmaster_1 = require("./app/app.taskmaster");
var program_template_1 = require("./models/program-template");
// ---- Global Declarations ---
var programTemplate = new program_template_1.ProgramTemplate();
var welcomeMessage = programTemplate.welcomeMessage;
var source;
var watch;
var defaultConfigJson = {
    sourceDirectory: './src',
    matchFilesRegex: '.ts$|.js$',
    ignoreFilesRegex: '(^\\.)|(\\.spec\\.)|(\\.d\\.)|(\\.animations\\.)|(\\.module\\.)|(\\.expect\\.)|(\\.stub\\.)',
    stubPrefix: 'stub',
    backupForSafety: {
        backupFolderName: 'autostub',
        firstBackupBeforeAutostub: true,
        latestBackup: true
    }
};
var configPath = process.cwd() + "/autostub.json";
var configJson;
// ---- Impure Functions for documented execution ----
exports.prepareCommanderProgramAndGetInput = function () {
    program
        .version(require('./../../package.json').version, '-v, --version')
        .usage('autostub init - creates am autostub.json at current working directory')
        .usage('autostub [options] - run autostub process')
        .option('-i, --in <path>', 'source directory - required if no autostub.json is used')
        .option('-c, --cleanStubTrash', 'remove all archive comments in all ".stub" files')
        .on('--help', function () {
        console.log(welcomeMessage);
    });
    program.command('init').action(function () {
        var configPath = process.cwd() + "/autostub.json";
        if (fs.existsSync(configPath)) {
            throw Error("autostub.json already exist! Please remove it to initialize a new autostub.json at " + configPath + "\n\n");
        }
        try {
            fs.writeJSONSync(configPath, defaultConfigJson, { spaces: 2 });
        }
        catch (e) {
            throw Error("Unable to create autostub.json at: " + configPath);
        }
        console.log("Created autostub.json at " + configPath);
        process.exit();
    });
    program.parse(process.argv);
    try {
        configJson = fs.readJSONSync(configPath);
    }
    catch (e) {
        console.log("No autostub.json found at " + configPath + ", will now use default settings for autostub. See documentation for default settings\n\n");
    }
};
exports.validateInput = function () {
    // TODO: add to AppUtility Class
    var fixdir = function (d) {
        if (d && typeof d === "string" && d.substring(d.length - 1) !== "/") {
            d += "/";
            console.log("FixDir - Added a \"/\" at the end of specified string path. Path Input is now " + d + "\n\n");
        }
        return d;
    };
    source = fixdir(program.in);
    watch = program.watch || false;
    if (source && configJson) {
        console.log("-i argument was provided autostub.json sourceDirectory of... \nPath: " + configJson.sourceDirectory + "\n will be ignored and... \nPath: " + source + "\n will be used instead.\n\n");
        configJson.sourceDirectory = source;
    }
    else if (source) {
        console.log("Preparing to autostub " + source);
        configJson = defaultConfigJson;
        configJson.sourceDirectory = process.cwd() + '/' + source;
    }
    if (!configJson || typeof configJson.sourceDirectory !== 'string') {
        throw Error('No input argument provided or invalid sourceDirectory provided in autostub.json!');
    }
};
exports.reportToUserOnOptionsUsed = function () {
    if (program.cleanStubTrash) {
        console.log('CleanStubTrash flag Used. Autostub will now clear all ".stub" archive comments');
    }
};
exports.setupAppState = function () {
    var createUserConfig = function (configJson) {
        // Change String to Regex
        try {
            configJson.matchFilesRegex = new RegExp(configJson.matchFilesRegex);
            configJson.ignoreFilesRegex = new RegExp(configJson.ignoreFilesRegex);
        }
        catch (e) {
            throw Error('Error trying to create RegExp from autostub.json' + e);
        }
        // Pascal case stub Prefix: Used in TaskStubStringGenerator (declarationName + StubPrefix)
        if (configJson.stubPrefix === false) {
            configJson.stubPrefix = '';
        }
        else if (typeof configJson.stubPrefix === 'string') {
            configJson.stubPrefix = _case.pascal(configJson.stubPrefix);
        }
        else {
            throw Error('Error "stubPrefix" in Autostub.json is not a valid string!');
        }
        return configJson;
    };
    app_state_service_1.appState_i1.program = program;
    app_state_service_1.appState_i1.userConfig = createUserConfig(configJson);
};
exports.runAppProcess = function () {
    if (configJson) {
        console.log(welcomeMessage);
        app_taskmaster_1.appTaskMaster_i1.processOverview();
    }
    else {
        program.help();
    }
};
