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

/* ===============================
     	Dependencies
================================== */
import { Program } from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';
import { FileStubSyncMeta } from 'src/types/file-meta';
import { AppState, appState_i1 } from './services/app-state.service';
import { BackupOptions } from 'src/types/user-config';

// TODO: Organize later..
interface EsLintParser {
    parseForESLint(code: string, options?: any): { ast: Program | any };
    parse(code: string, options?: any): Program | any;
    Syntax: object
}

/* ---------------- Code ---------------------- */
export class TaskFSWriter {

    constructor(
        private appState: AppState,
    ) {}

    backupEntryFolder() {
        let backupOptions: any | BackupOptions = {}
        if (this.appState.userConfig.backupForSafety) {
            backupOptions = this.appState.userConfig.backupForSafety;
        }

        const autoStubFolderName = backupOptions.backupFolderName ? backupOptions.backupFolderName : 'autostub';
        const firstBackupPath = path.join(process.cwd(), autoStubFolderName, 'first-backup-before-autostub');
        const backupFolderPath = path.join(process.cwd(), autoStubFolderName, 'lastest-backup');
        if (backupOptions.firstBackupBeforeAutostub && !fs.pathExistsSync(firstBackupPath)) {
            fs.ensureDirSync(firstBackupPath);
            fs.copySync(this.appState.userConfig.sourceDirectory, firstBackupPath);
        } else if (backupOptions.latestBackup) {
            fs.emptyDirSync(backupFolderPath);
            fs.copySync(this.appState.userConfig.sourceDirectory, backupFolderPath);
        }
    }

    fsWriteToFiles(fileMetaArr: FileStubSyncMeta[]) {
        fileMetaArr.map(fileMeta => {
            fs.writeFileSync(fileMeta.originalPath, fileMeta.originalContentStrAfterUpdate, 'utf-8');
            fs.writeFileSync(fileMeta.stubPath, fileMeta.stubContentStrAfterUpdate, 'utf-8');
        });
    }

    // /* ===============================
    //             Taskmaster
    // ================================== */
    tmStart(fileMetaArr: FileStubSyncMeta[]) {
        const M_backupEntryFolder = this.backupEntryFolder();
        const M_fsWriteToFiles = this.fsWriteToFiles(fileMetaArr);

        console.log('fs writing??');
        fs.writeJSONSync('./test-autostub.json', fileMetaArr, {spaces:2});
        return M_fsWriteToFiles;
    }
}


// Allows To Create Additional instances with DI set already
export const newTaskFSWriter = () => {
    return new TaskFSWriter(
        appState_i1
    );
}

// Exporting a const as a shared instance of class between the project..
export const taskFSWriter_i1 = new TaskFSWriter(
    appState_i1
);