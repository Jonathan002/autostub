interface BackupOptions {
    backupFolderName?: string,
    firstBackupBeforeAutostub?: boolean,
    latestBackup?: boolean
}

export interface UserConfig {
    sourceDirectory: string,
    matchFilesRegex: RegExp,
    ignoreFilesRegex: RegExp,
    stubPrefix: string,
    backupForSafety?: BackupOptions
}
