/* 
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
import * as dir from 'node-dir';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Utils from '../../lib/utility';
import { Program } from "estree";
import { appState_i1, AppState } from './services/app-state.service';
import { StubTemplate } from '../models/stub-template';
import * as esLintParser from '../../lib/typescript-eslint-parser';
import { FileStubSyncMeta } from '../types/file-meta';



// TODO: Organize later..
interface EsLintParser {
    parseForESLint(code: string, options?: any): { ast: Program | any };
    parse(code: string, options?: any): Program | any;
    Syntax: object
}

/* ---------------- Code ---------------------- */
export class TaskParser {

    constructor(
        private esLintParser: EsLintParser | any,
        private stubTemplate: StubTemplate,
        private utils: typeof Utils,
        private appState: AppState
    ) {}

    /* ===============================
        Basic helper module methods
    ================================== */
    declarationFilter(declaration) {
        // 'ExportNamedDeclaration' may have null declaration with this statement which interfeers with declaration.type logic below..
        // (declaration.declaration !== null) filters this out - "export { AppServerModule } from './app/app.server.module';" 
        return (declaration.type === 'ExportNamedDeclaration' && declaration.declaration !== null)
        || declaration.type === 'VariableDeclaration'
        || declaration.type === 'FunctionDeclaration'
        || declaration.type === 'ClassDeclaration'
        || declaration.type === 'TSEnumDeclaration'
        || declaration.type === 'TSInterfaceDeclaration'
    }

    // TODO: create a class tracer to handle error logging..
    tryToExtractName(declaration, contentStr: string, path: string) {
        let name;
        try {
            name = declaration.id ? declaration.id.name : declaration.key.name;
        } catch (e) {
            const declarationStr = contentStr.substring(declaration.range[0], declaration.range[1]);
            throw Error(`Unable to give declration a name @${declarationStr} in file: ${path}`)
        }
        return name;
    }
    /* =====================================================
     	                Main Methods
    ======================================================== */
    parseOriginalAndGenerateFileMetadata(): Promise<FileStubSyncMeta[]> {
        let once = false;
        return new Promise((resolve, reject) => {
            const fileMetaArr = [];

            // TODO: make opinionated regex customizable
            dir.readFiles(this.appState.userConfig.sourceDirectory, {
                match: this.appState.userConfig.matchFilesRegex,
                exclude: this.appState.userConfig.ignoreFilesRegex,
            }, async (err, content, filename, next) => {
                if (err) throw err;
                const fileMeta: FileStubSyncMeta | any = {}
                const parsedPath = path.parse(filename);
                // filename: 'angular-project/src/app/app-services/toast/toast.service.ts'
                // parsedPath: { root: '',
                //   dir: 'angular-project/src/app/app-services/toast',
                //   base: 'toast.service.ts',
                //   ext: '.ts',
                //   name: 'toast.service' }
                // =============== Stub ======================
                // Add a stubPath and ensure a file is there @this.ensureStubFileAndParseItForMetadata()
                let stubPath;
                if (parsedPath.name.substring(parsedPath.name.length - 'stub'.length) === 'stub') {
                    throw Error(`".stub." Files are expected to be ignored in autostub.json.ignoreFilesRegex - Please add it to the autostub.json or copy the default autostub config values from the doucmentation in order to prevent the accidental creation of ".stub.'s" own ".stub.stub." files`);
                } else {
                    parsedPath.name = parsedPath.name + '.stub';
                    parsedPath.base = parsedPath.name + parsedPath.ext;
                    stubPath = path.format(parsedPath);
                }
                fileMeta.stubPath = stubPath;
                // =============== Original ======================
                fileMeta.fileExtension = parsedPath.ext;
                try {
                    fileMeta.originalParsed = await this.esLintParser.parse(content);
                } catch (e) {
                    throw Error(`The file "${filename}" could not be parsed correctly. Please check to see if the code is formated correctly.`)
                }
                fileMeta.originalPath = filename;
                // TODO: add updateMeta(esParsed)
                fileMeta.originalContentStr = content;
                // =============================================

                fileMetaArr.push(fileMeta);
                next();
            }, (err, files) => {
                if (err) throw err;
                resolve(fileMetaArr);
            });
        });
    }
    sortImportsAndDeclarationsAndUpdateFileMetaArr(fileMetaArr: FileStubSyncMeta[]) {
        // - type: ImportDeclaration -> imports []
        // - type: ExportNamedDeclaration // may wrap VariableDeclaration or other things if 'export' is present (if so declaration is under "declaration" key)
        // - type: VariableDeclaration - let varExportOne =  12;
        // - kind: 'let', 'const', 'var'
        // - but declarations are still in "declarations":[] for let bur, thing etc.. 
        // - init.type: ArrowFunctionExpression
        // - init.type: Literal 12 (number) or 'text' (string)
        // - init.raw: "value" (value in quotes) e.g. "12"
        // - init.value: (value itself e.g. 12 will be a number)
        // - type: FunctionDeclaration - function
        // - type: ClassDeclaration
        // - .body: { type: "ClassBody" }
        // - .body.body = classItems[]
        // - type: ClassProperty
        // - type: MethodDefinition
        // - static: boolean
        // - decorators: []
        // - accessibility: ['public', 'private', 'etc']
        // - type: TSInterfaceDeclaration
        
        fileMetaArr.map(fileMeta => {
            const parsedCodeBody = fileMeta.originalParsed.body;
            const importsDeclared = [];
            const declarations = [];
            parsedCodeBody.map(item => {
                if (item.type === 'ImportDeclaration') {
                    importsDeclared.push(item);
                } else if (this.declarationFilter(item)) {
                    declarations.push(item);
                }
            });

            fileMeta.imports = importsDeclared;
            fileMeta.declarations = declarations;
        });

        return fileMetaArr;
    }
    ensureStubNameCommentsInOriginalContentStr(fileMetaArr: FileStubSyncMeta[]) {
        fileMetaArr.map(fileMeta => {
            const originalContentStr = fileMeta.originalContentStr;
            let newContentStr = originalContentStr;
            let extraCharCount = 0;
            let addStubPrefix = false;

            fileMeta.declarations.map(declaration => {
                // find first two characters and it should be /*
                // will test if whitespacesExist in /*name*/ (up to end)
                // if false then register as sync stub name
                // if whitespace exist is a regular comment and will add a /*name*/
                const type = declaration.type;
                let declarationData;
                if (type === 'ExportNamedDeclaration') {
                    declarationData = declaration.declaration;
                } else {
                    declarationData = declaration;
                }
                const updateNewContentStr = (oneDeclarationNameData) => {
                    let endIndexBeforeStubComment = oneDeclarationNameData.range[1] + extraCharCount;
                    let strAfterDeclration = newContentStr.substring(endIndexBeforeStubComment);

                    // move strAfterDeclration up by one character if a ';' is detected
                    if (strAfterDeclration.trim().slice(0, 1) === ';') {
                        const semiColonIndex = strAfterDeclration.indexOf(';');
                        endIndexBeforeStubComment += (semiColonIndex + 1);
                        strAfterDeclration = newContentStr.substring(endIndexBeforeStubComment);
                    }

                    const trimedStr = strAfterDeclration.trim();
                    let hasStubCommentIndex = 0;
                    let stubCommentCharLength = 0;
                    let name;
                    try {
                        name = oneDeclarationNameData.id ? oneDeclarationNameData.id.name : oneDeclarationNameData.key.name;
                    } catch (e) {
                        const declarationStr = originalContentStr.substring(oneDeclarationNameData.range[0], oneDeclarationNameData.range[1]);
                        throw Error(`Unable to give declration a name @${declarationStr} in file: ${fileMeta.originalPath}`)
                    }

                    name = addStubPrefix ? (name + this.appState.userConfig.stubPrefix) : name;
                    const stubCommentStrToAdd = ` /*${name}*/`;

                    // Detect if stubName comment exist..
                    // A stubName comment MUST be directly after declaration and MUST not have any spaces within the comment
                    // A stubName comment may or may not have one white space-like(/\s/) character before it. 
                    // Since the new stubCommentStrToAdd insertion ALWAYS INCLUDES ONE_SPACE the logic for a possible space needs to be done in order to prevent accidental space adding.
                    if (trimedStr.slice(0, 2) === '/*') {
                        let sample = trimedStr.split('*/').shift();
                        if (sample.search(/\s/) === -1) {
                            hasStubCommentIndex = strAfterDeclration.indexOf('/*');
                            if (strAfterDeclration.substring(hasStubCommentIndex - 1, hasStubCommentIndex).search(/\s/) !== -1) {
                                stubCommentCharLength += 1;
                                hasStubCommentIndex -= 1; // stub comment starts at one white space like character
                            }
                            const stubName = sample.slice(2);
                            stubCommentCharLength += (2 + stubName.length + 2);
                            oneDeclarationNameData.stubName = stubName;
                        }
                    }

                    // newContentStr = declaration_WithPossibleSemiColonAdded_Str; + /*stubCommentStrToAdd*/ + (-> skipping over -> hasStubCommentIndex:'(spaces)'.length + (' /*oldStubCommentName*/'.length || '/*oldStubCommentName*/'.length))
                    newContentStr = newContentStr.substring(0, endIndexBeforeStubComment) + stubCommentStrToAdd + newContentStr.substring(endIndexBeforeStubComment + hasStubCommentIndex + stubCommentCharLength);
                    extraCharCount -= (hasStubCommentIndex + stubCommentCharLength);
                    extraCharCount += stubCommentStrToAdd.length;
                }

                addStubPrefix = true;
                switch (declarationData.type) {
                    // names after a let,const,var (e.g. var -> cat, dog, turtle <-)
                    case 'VariableDeclaration':
                        const declarators = declarationData.declarations;
                        declarators.map(updateNewContentStr);
                        break;
                    case 'FunctionDeclaration':
                        updateNewContentStr(declarationData);
                        break;
                    case 'ClassDeclaration':
                        const classBody = declarationData.body.body;
                        // Update Class Members with stub comments - Note: Class Members do not get a stub prefix
                        addStubPrefix = false;
                        classBody.map(updateNewContentStr);
                        // Add a stub Comment to the Class itself
                        addStubPrefix = true;
                        updateNewContentStr(declarationData);
                        break;
                    default:
                        // No Stub Prefixes for Enums and Interfaces (so typescipt typings copy correctly)
                        addStubPrefix = false;
                        updateNewContentStr(declarationData);
                        break;
                }
            });

            fileMeta.originalContentStrAfterUpdate = newContentStr;
        });

        return fileMetaArr;
    }
    ensureStubFileAndParseItForMetadata(fileMetaArr: FileStubSyncMeta[]) {
        fileMetaArr.map(async (fileMeta) => {
            fs.ensureFileSync(fileMeta.stubPath);
            const stubContent = fs.readFileSync(fileMeta.stubPath, 'utf-8');
            // const stubContent = fs.readFileSync('./full-code-stub-implementation.stub.ts', 'utf-8'); // for testing
            fileMeta.stubContentStr = stubContent;
            if (stubContent.length === 0) {
                fileMeta.stubFileIsNew = true;
            } else {
                const checkArrParsing = (arr) => {
                    if (arr.length === 1) {
                        throw Error(`Stub Files Comments should not be changed! Could not parse stub file at ${fileMeta.stubPath}`)
                    } else {
                        return arr;
                    }
                }
                const updateRealDeclarationWithStubImplementationHelper = (stubDeclration, realDeclaration, stubSyncDeclarationsStr, classOrDeclarationParent?) => {
                    // VariableDeclaration type finding is already handled at updateRealDeclarationWithStubImplementationAndReturnArchive()
                    switch (stubDeclration.type) {
                        case 'ClassDeclaration':
                            const stubClassBody = stubDeclration.body.body;
                            const realClassBody = realDeclaration.body.body;
                            return updateRealDeclarationWithStubImplementationAndReturnArchive(stubClassBody, realClassBody, stubSyncDeclarationsStr, classOrDeclarationParent);
                        case 'VariableDeclarator':
                            // checks if arrowFunction so it won't include parameters in stub implementation
                            if (stubDeclration.init && stubDeclration.init.type === 'ArrowFunctionExpression') {
                                // gets both => "{ return 'abc' }" block statement and literal => "'abc'"
                                realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.init.body.range[0], stubDeclration.init.body.range[1]);
                                break;
                            }
                            realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.init.range[0], stubDeclration.init.range[1]);
                            break;
                        case 'FunctionDeclaration':
                            realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.body.range[0], stubDeclration.body.range[1]);
                            break;
                        case 'MethodDefinition':
                            realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.value.body.range[0], stubDeclration.value.body.range[1]);
                            break;
                        case 'ClassProperty':
                            realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.value.range[0], stubDeclration.value.range[1]);
                            break;
                        default:
                            // Other Types such as Enums and Interface will just get copied over (without stub prefix) at Class StubStringGeneratorTask().createNewStubContentString()#declarationStringFactory()...
                            break;
                    }

                    return null;
                }
                const updateRealDeclarationWithStubImplementationAndReturnArchive = (stubDeclrations, realDeclarations, stubSyncDeclarationsStr, classOrDeclarationParent?) => {
                    // Goal: if stubName exist, find it and add the stub implementation to the originalDeclarationsArr (so generating stubContentStr only needs to happen from that one array)
                    const archiveArr = [];
                    if (Array.isArray(stubDeclrations) && Array.isArray(realDeclarations)) {
                        for (let i = 0; i < stubDeclrations.length; i++) {
                            let archiveChildren;
                            const oneStubDec = stubDeclrations[i];
                            let foundMatch = false;
                            let stubDeclarationData = (oneStubDec.type === 'ExportNamedDeclaration') ? oneStubDec.declaration : oneStubDec;
                            let typeToLookFor = stubDeclarationData.type;

                            for (const oneRealDec of realDeclarations) {
                                const realDeclarationData = (oneRealDec.type === 'ExportNamedDeclaration') ? oneRealDec.declaration : oneRealDec;
                                if (realDeclarationData.type === typeToLookFor && typeToLookFor === 'VariableDeclaration') {
                                    foundMatch = true;
                                    archiveChildren = updateRealDeclarationWithStubImplementationAndReturnArchive(stubDeclarationData.declarations, realDeclarationData.declarations, stubSyncDeclarationsStr, oneStubDec);
                                } else if (typeToLookFor !== 'VariableDeclaration') {
                                    const stubDeclrationName = this.tryToExtractName(stubDeclarationData, fileMeta.stubContentStr, fileMeta.stubPath);
                                    // determine match
                                    if (stubDeclrationName === realDeclarationData.stubName) {
                                        foundMatch = true;
                                        archiveChildren = updateRealDeclarationWithStubImplementationHelper(stubDeclarationData, realDeclarationData, stubSyncDeclarationsStr, oneStubDec);
                                        if (classOrDeclarationParent) {
                                            // We are looping over declarators or classItems
                                            // We remove an item so that looping through the next declaration[] above after will not result in an extra NotFoundMatch Archive
                                            stubDeclrations.splice(i, 1);
                                            --i;
                                        }
                                        break;
                                    }
                                }

                            }
                            
                            if (!foundMatch) {
                                archiveArr.push(oneStubDec);
                            }

                            if (archiveChildren) {
                                // deep copy oneStubDec
                                const deepCopy = this.utils.newInstance(oneStubDec);
                                const deepCopyDecData = (deepCopy.type === 'ExportNamedDeclaration') ? deepCopy.declaration : deepCopy;
                                switch (deepCopyDecData.type) {
                                    case 'ClassDeclaration':
                                        deepCopyDecData.body.body = archiveChildren;
                                    case 'VariableDeclaration':
                                        deepCopyDecData.declarations = archiveChildren;
                                    default:
                                        break;
                                }

                                if (archiveChildren.length > 0) {
                                    archiveArr.push(deepCopy);
                                }
                            }
                         }
                    } else {
                        throw Error('Arguments Passed in are not Arrays! @ensureStubFileAndParseItForMetadata() - loopDeclarations()')
                    }

                    return archiveArr;
                }

                // TODO: handle parsing
                fileMeta.stubFileIsNew = false;
                const importSplit: string[] = checkArrParsing(stubContent.split(this.stubTemplate.header_extraCode));
                const strWithoutSyncImports: string = importSplit.pop();
                const mainSplit: string[] = checkArrParsing(strWithoutSyncImports.split(this.stubTemplate.header_syncStubDeclarations));
                const extraCodeStr: string = mainSplit[0];
                const restOfTheCodeStr: string = mainSplit[1];
                // checkArrParsing not needed as archive split may or may not exist and is checked below..
                const archiveSplit: string[] = restOfTheCodeStr.split(this.stubTemplate.header_archiveDeclarations);
                const stubSyncDeclarationsStr: string = archiveSplit[0];
                const archiveStr: string = archiveSplit[1] ? archiveSplit[1] : '';           
                fileMeta.stubArchiveCodeStr = archiveStr;
                fileMeta.stubExtraCodeStr = extraCodeStr;
                fileMeta.stubSyncDeclarationsStr = stubSyncDeclarationsStr;
                try {
                    fileMeta.stubSyncDeclarationsParsed = await this.esLintParser.parse(stubSyncDeclarationsStr);
                    fileMeta.stubSyncDeclarationsParsed.content = stubSyncDeclarationsStr;
                    fileMeta.stubDeclarations = fileMeta.stubSyncDeclarationsParsed.body.filter(this.declarationFilter); // TODO: do test and try to find errors to handle - (e.g. import statement placed in the Sync Stub Declarations area..)
                    fileMeta.stubArchiveDeclarations = updateRealDeclarationWithStubImplementationAndReturnArchive(fileMeta.stubDeclarations, fileMeta.declarations, stubSyncDeclarationsStr);
                } catch (e) {
                    throw Error(`The file "${fileMeta.stubPath}" could not be parsed correctly. Please check to see if the code is formated correctly. \nError: ${e}`);
                }
            }
        });
        
        return fileMetaArr;
    }

    // /* ===============================
    //             Taskmaster
    // ================================== */
    // Note: createNewStubContentString() fileMeta.map method is marked as Async so the async function inside ensureStubFileAndParseItForMetadata can Error Log ahead and report bad parsing..
    tmStart(): Promise<FileStubSyncMeta[]> {
        return new Promise((resolve, reject) => {
            const M_parseOriginalAndGenerateFileMetadata = this.parseOriginalAndGenerateFileMetadata().then(async (MT_parseOriginalAndGenerateFileMetadata) => {
                const MT_sortImportsAndDeclarationsAndUpdateFileMetaArr = this.sortImportsAndDeclarationsAndUpdateFileMetaArr(MT_parseOriginalAndGenerateFileMetadata);
                const MT_ensureStubSyncCommentsInOriginalContentStr = this.ensureStubNameCommentsInOriginalContentStr(MT_sortImportsAndDeclarationsAndUpdateFileMetaArr);
                const MT_ensureStubFileAndParseItForMetadata = await this.ensureStubFileAndParseItForMetadata(MT_sortImportsAndDeclarationsAndUpdateFileMetaArr);
                fs.writeJSONSync('./json-test.json', MT_ensureStubFileAndParseItForMetadata, {spaces: 2});
                resolve(MT_ensureStubFileAndParseItForMetadata);
            }).catch(error => {
                reject(error);
            })
        });
    }
}

// Allows To Create Additional instances with DI set already
export const newTaskParser = () => {
    return new TaskParser(
        esLintParser,
        new StubTemplate(),
        Utils,
        appState_i1
    );
}

// Exporting a const as a shared instance of class between the project..
export const taskParser_i1 = new TaskParser(
    esLintParser,
    new StubTemplate(),
    Utils,
    appState_i1
);