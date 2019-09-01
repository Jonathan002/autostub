"use strict";
/*
import { Program } from 'estree';
import * as fs from 'fs-extra';

import { FileStubSyncMeta } from './types/file-meta';

    Module-Template: Taskmaster

    ================================== Readme ======================================
    - This class is a template of Taskmaster.
    Please review extra properties and methods declared below that begin with
    prefix of "tm" in case you wish to use a namespace begining with tm.
    - This class needs to emit if fs.watch 'rename' or a 'change' specifically to autofont.scss event happens for watcher (see app.ts)
     Use the find tool and search: "@Emitter" to find methods related to EventEmitter.
*/
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
var app_state_service_1 = require("./services/app-state.service");
/* ---------------- Code ---------------------- */
var TaskFSWriter = /** @class */ (function () {
    function TaskFSWriter(appState) {
        this.appState = appState;
    }
    TaskFSWriter.prototype.backupEntryFolder = function () {
        var backupOptions = {};
        if (this.appState.userConfig.backupForSafety) {
            backupOptions = this.appState.userConfig.backupForSafety;
        }
        var autoStubFolderName = backupOptions.backupFolderName ? backupOptions.backupFolderName : 'autostub';
        var firstBackupPath = path.join(process.cwd(), autoStubFolderName, 'first-backup-before-autostub');
        var backupFolderPath = path.join(process.cwd(), autoStubFolderName, 'lastest-backup');
        if (backupOptions.firstBackupBeforeAutostub && !fs.pathExistsSync(firstBackupPath)) {
            fs.ensureDirSync(firstBackupPath);
            fs.copySync(this.appState.userConfig.sourceDirectory, firstBackupPath);
        }
        else if (backupOptions.latestBackup) {
            fs.emptyDirSync(backupFolderPath);
            fs.copySync(this.appState.userConfig.sourceDirectory, backupFolderPath);
        }
    };
    TaskFSWriter.prototype.fsWriteToFiles = function (fileMetaArr) {
        fileMetaArr.map(function (fileMeta) {
            fs.writeFileSync(fileMeta.originalPath, fileMeta.originalContentStrAfterUpdate, 'utf-8');
            fs.writeFileSync(fileMeta.stubPath, fileMeta.stubContentStrAfterUpdate, 'utf-8');
        });
    };
    // /* ===============================
    //             Taskmaster
    // ================================== */
    TaskFSWriter.prototype.tmStart = function (fileMetaArr) {
        var M_backupEntryFolder = this.backupEntryFolder();
        var M_fsWriteToFiles = this.fsWriteToFiles(fileMetaArr);
        console.log('fs writing??');
        fs.writeJSONSync('./test-autostub.json', fileMetaArr, { spaces: 2 });
        return M_fsWriteToFiles;
    };
    return TaskFSWriter;
}());
exports.TaskFSWriter = TaskFSWriter;
// Allows To Create Additional instances with DI set already
exports.newTaskFSWriter = function () {
    return new TaskFSWriter(app_state_service_1.appState_i1);
};
// Exporting a const as a shared instance of class between the project..
exports.taskFSWriter_i1 = new TaskFSWriter(app_state_service_1.appState_i1);
