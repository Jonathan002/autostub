import * as program from 'commander';
import * as fs from 'fs-extra';
import * as _case from 'case';
import { appState_i1 } from './app/services/app-state.service';
import { appTaskMaster_i1 } from './app/app.taskmaster';
import { ProgramTemplate } from './models/program-template';

// ---- Global Declarations ---
const programTemplate = new ProgramTemplate();
let welcomeMessage = programTemplate.welcomeMessage;
let source;
let watch;
const defaultConfigJson = {
    sourceDirectory: './src',
    matchFilesRegex: '.ts$|.js$',
    ignoreFilesRegex: '(^\\.)|(\\.spec\\.)|(\\.d\\.)|(\\.animations\\.)|(\\.module\\.)|(\\.expect\\.)|(\\.stub\\.)',
    stubPrefix: 'stub', // gets capitalized later..
    backupForSafety: {
        backupFolderName: 'autostub',
        firstBackupBeforeAutostub: true,
        latestBackup: true
    }
};
const configPath = `${process.cwd()}/autostub.json`;
let configJson;

// ---- Impure Functions for documented execution ----
export const prepareCommanderProgramAndGetInput = () => {
    program
        .version(require('./../../package.json').version, '-v, --version')
        .usage('autostub init - creates am autostub.json at current working directory')
        .usage('autostub [options] - run autostub process')
        .option('-i, --in <path>', 'source directory - required if no autostub.json is used')
        .option('-c, --cleanStubTrash', 'remove all archive comments in all ".stub" files')
        .on('--help', function () {
            console.log(welcomeMessage);
        });

    program.command('init').action(() => {
        const configPath = `${process.cwd()}/autostub.json`;
        if (fs.existsSync(configPath)) {
            throw Error(`autostub.json already exist! Please remove it to initialize a new autostub.json at ${configPath}\n\n`);
        }

        try {
            fs.writeJSONSync(configPath, defaultConfigJson, { spaces: 2 });
        } catch (e) {
            throw Error(`Unable to create autostub.json at: ${configPath}`);
        }
        console.log(`Created autostub.json at ${configPath}`);
        process.exit();
    });

    program.parse(process.argv);

    try {
        configJson = fs.readJSONSync(configPath);
    } catch (e) {
        console.log(`No autostub.json found at ${configPath}, will now use default settings for autostub. See documentation for default settings\n\n`);
    }
}

export const validateInput = () => {
    // TODO: add to AppUtility Class
    const fixdir = (d) => {
        if (d && typeof d === "string" && d.substring(d.length - 1) !== "/") {
            d += "/";
            console.log(`FixDir - Added a "/" at the end of specified string path. Path Input is now ${d}\n\n`);
        }
        return d;
    }

    source = fixdir(program.in);
    watch = program.watch || false;

    if (source && configJson) {
        console.log(`-i argument was provided autostub.json sourceDirectory of... \nPath: ${configJson.sourceDirectory}\n will be ignored and... \nPath: ${source}\n will be used instead.\n\n`);
        configJson.sourceDirectory = source;
    } else if (source) {
        console.log(`Preparing to autostub ${source}`);
        configJson = defaultConfigJson;
        configJson.sourceDirectory = process.cwd() + '/' + source;
    }

    if (!configJson || typeof configJson.sourceDirectory !== 'string') {
        throw Error('No input argument provided or invalid sourceDirectory provided in autostub.json!');
    }
}

export const reportToUserOnOptionsUsed = () => {
    if (program.cleanStubTrash) {
        console.log('CleanStubTrash flag Used. Autostub will now clear all ".stub" archive comments');
    }
}

export const setupAppState = () => {
    const createUserConfig = (configJson) => {
        // Change String to Regex
        try {
            configJson.matchFilesRegex = new RegExp(configJson.matchFilesRegex);
            configJson.ignoreFilesRegex = new RegExp(configJson.ignoreFilesRegex);
        } catch (e) {
            throw Error('Error trying to create RegExp from autostub.json' + e);
        }

        // Pascal case stub Prefix: Used in TaskStubStringGenerator (declarationName + StubPrefix)
        if (configJson.stubPrefix === false) {
            configJson.stubPrefix = '';
        } else if (typeof configJson.stubPrefix === 'string') {
            configJson.stubPrefix = _case.pascal(configJson.stubPrefix);
        } else {
            throw Error('Error "stubPrefix" in Autostub.json is not a valid string!')
        }
        return configJson;
    }

    appState_i1.program = program;
    appState_i1.userConfig = createUserConfig(configJson);
}

export const runAppProcess = () => {
    if (configJson) {
        console.log(welcomeMessage);
        appTaskMaster_i1.processOverview();
    } else {
        program.help();
    }
}