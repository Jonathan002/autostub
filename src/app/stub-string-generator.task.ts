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
import { appState_i1, AppState } from './services/app-state.service';
import { StubTemplate } from '../models/stub-template';
import { FileStubSyncMeta } from '../types/file-meta';

/* ---------------- Code ---------------------- */
export class TaskStubStringGenerator {

    constructor(
        private stubTemplate: StubTemplate,
        private appState: AppState,
    ) { }
    /* =====================================================
     	                Main Methods
    ======================================================== */
    createNewStubContentString(fileMetaArr: FileStubSyncMeta[]) {
        const checkAndExtractDecoratorsStr = (declarationData, originalContentStr: string) => {
            let result = '';
            if (declarationData.decorators) {
                declarationData.decorators.map(decorator => {
                    const decoratorStr = originalContentStr.substring(decorator.range[0], decorator.range[1]);
                    result += decoratorStr + '\n';
                });
            }
            return result;
        }
        const checkAndExtractTyping = (declarationData, originalContentStr: string) => {
            let result = '';
            if (declarationData.typeAnnotation) {
                result += originalContentStr.substring(declarationData.typeAnnotation.range[0], declarationData.typeAnnotation.range[1]);
            }
            return result;
        }
        const checkAndExtractReturnType = (declarationData, originalContentStr: string) => {
            let result = '';
            if (declarationData.returnType) {
                result += originalContentStr.substring(declarationData.returnType.range[0], declarationData.returnType.range[1]);
            }
            return result;
        }
        const createParamsString = (paramArray, originalContentStr: string, tabSpaceForNewLine?: string) => {
            const singleTabWithNewLineChecker = tabSpaceForNewLine ? ('\n' + tabSpaceForNewLine) : '';
            const doubleTabWithNewlineChecker = tabSpaceForNewLine ? ('\n' + tabSpaceForNewLine + tabSpaceForNewLine) : ''
            const spaceChecker = tabSpaceForNewLine ? '' : ' ';
            let result = '(';
            paramArray.map((param, index) => {
                const paramStr = originalContentStr.substring(param.range[0], param.range[1]);
                if (index + 1 === paramArray.length) {
                    result += doubleTabWithNewlineChecker + paramStr
                } else {
                    result += doubleTabWithNewlineChecker + paramStr + ',' + spaceChecker;
                }
            });
            result += singleTabWithNewLineChecker + ')';
            return result;
        }
        const variableStringFactory = (declarationData, contentStr, archiveMode?: boolean) => {
            let result;
            let decNamesAndValues = '';
            const declarationType = declarationData.kind + ' ';

            declarationData.declarations.map(oneDeclarationNameData => {
                if (archiveMode) {
                    decNamesAndValues += contentStr.substring(oneDeclarationNameData.range[0], oneDeclarationNameData.range[1]);
                    decNamesAndValues += ',\n';
                    return;
                }

                const name = archiveMode ? oneDeclarationNameData.id.name : (oneDeclarationNameData.id.name + this.appState.userConfig.stubPrefix);
                const typing = checkAndExtractTyping(oneDeclarationNameData, contentStr);
                let stubImplementation = oneDeclarationNameData.stubImplementation;
                decNamesAndValues += name;
                decNamesAndValues += typing;
                if (oneDeclarationNameData.typeAnnotation) {
                    decNamesAndValues += contentStr.substring(oneDeclarationNameData.typeAnnotation.range[0], oneDeclarationNameData.typeAnnotation.range[1]);
                }
                decNamesAndValues += ' = ';
                // Determine if Arrow Function or handle normally
                if (oneDeclarationNameData.init && oneDeclarationNameData.init.type === 'ArrowFunctionExpression') {
                    decNamesAndValues += createParamsString(oneDeclarationNameData.init.params, contentStr);
                    decNamesAndValues += ' => ';
                    stubImplementation = stubImplementation ? stubImplementation : this.stubTemplate.functionDefaultImplementation();
                } else {
                    stubImplementation = stubImplementation ? stubImplementation : this.stubTemplate.variableDefaultImplementation;
                }

                decNamesAndValues += stubImplementation + ',\n';
            });

            // remove a ',\n' and replace it with ';'
            decNamesAndValues = decNamesAndValues.slice(0, -2) + ';';
            result = declarationType + decNamesAndValues;
            return result;
        }
        const functionStringFactory = (declarationData, contentStr, archiveMode?: boolean) => {
            let result = '';
            const stubImplementation = declarationData.stubImplementation ? declarationData.stubImplementation : this.stubTemplate.functionDefaultImplementation();
            const name = archiveMode ? declarationData.id.name : (declarationData.id.name + this.appState.userConfig.stubPrefix);
            if (archiveMode) {
                result += contentStr.substring(declarationData.range[0], declarationData.range[1]);
            } else {
                result += 'function ';
                result += name;
                result += createParamsString(declarationData.params, contentStr);
                result += checkAndExtractReturnType(declarationData, contentStr);
                result += ' ' + stubImplementation;
            }

            result += ';';
            return result;
        }
        const classStringFactory = (declarationData, contentStr, archiveMode?: boolean) => {
            let result = '';
            let implementsChecker = '';
            const name = archiveMode ? declarationData.id.name : (declarationData.id.name + this.appState.userConfig.stubPrefix);
            result += 'class ';
            result += name + ' ';

            // Add Implements Str if exist
            if (declarationData.implements) {
                implementsChecker = 'implements ';
                const implementsStrArr = declarationData.implements.map(implementsData => {
                    return contentStr.substring(implementsData.range[0], implementsData.range[1]);
                });
                result += implementsChecker + implementsStrArr.join(', ') + ' ';
            }

            result += '{\n'
            // Loop through class body - TODO: double check with test..
            const classBody = declarationData.body.body;
            classBody.map(classItem => {
                result += '\n'
                const tabSpace = '  ';
                const decoratorsStr = checkAndExtractDecoratorsStr(classItem, contentStr);
                const modifyerChecker = classItem.accessibility ? classItem.accessibility + ' ' : '';
                const staticChecker = classItem.static ? 'static ' : '';
                const readonlyChecker = classItem.readonly ? 'readonly ' : '';
                const getterSetterChecker = (classItem.kind === 'set' || classItem.kind === 'get') ? `${classItem.kind} ` : '';
                const name = classItem.key.name;
                let stubImplementation = classItem.stubImplementation;

                if (archiveMode) {
                    result += tabSpace + contentStr.substring(classItem.range[0], classItem.range[1]);
                    return;
                }

                result += decoratorsStr ? tabSpace + decoratorsStr : '';
                result += tabSpace + modifyerChecker + staticChecker + getterSetterChecker + readonlyChecker + name;
                // console.log('log name..', name);
                switch (classItem.type) {
                    case 'ClassProperty':
                        // TODO: add arrow function support later.. 
                        const typing = checkAndExtractTyping(classItem, contentStr);
                        stubImplementation = stubImplementation ? stubImplementation : this.stubTemplate.variableDefaultImplementation;
                        result += typing + ' = ' + stubImplementation;
                        result += ';';
                        break;
                    case 'MethodDefinition':
                        const returnType = checkAndExtractReturnType(classItem.value, contentStr);
                        let params;
                        if (classItem.kind === 'constructor') {
                            params = createParamsString(classItem.value.params, contentStr, tabSpace);
                            result += params + '{}';
                        } else {
                            params = createParamsString(classItem.value.params, contentStr);
                            stubImplementation = stubImplementation ? stubImplementation : this.stubTemplate.functionDefaultImplementation(tabSpace);
                            result += params + returnType + ' ' + stubImplementation;
                        }
                        result += '\n';
                        break;
                    default:
                        break;
                }
            });
            result += '\n};'

            // MethodDefinition
            // ClassProperty
            return result;
        }

        const enumStringFactory = (enumDeclaration, contentStr, archiveMode?: boolean) => {
            let result = '';
            let declarationData;
            if (enumDeclaration.type === 'ExportNamedDeclaration') {
                declarationData = enumDeclaration.declaration;
            } else {
                declarationData = enumDeclaration;
            }

            const enumName = declarationData.id.name;
            const stubPrefixChecker = archiveMode ? '' : this.appState.userConfig.stubPrefix;
            const enumStr = contentStr.substring(enumDeclaration.range[0], enumDeclaration.range[1]);
            const split = enumStr.split(enumName);
            let enumBegining = split.shift();
            const restOfStr = split.join(enumName); // in the rare event the name is within the enum..
            enumBegining = enumBegining + enumName + stubPrefixChecker;
            result = enumBegining + restOfStr;
            return result;
        }

        const declarationStringFactory = (declarationArr, contentStr: string, archiveMode?: boolean) => {
            let result = '';

            declarationArr.map(declaration => {
                const type = declaration.type;
                let declarationStr = '';
                let declarationData;
                let exportChecker = '';
                let decoratorChecker;

                // Check if Exported
                if (type === 'ExportNamedDeclaration') {
                    exportChecker = 'export ';
                    declarationData = declaration.declaration;
                } else {
                    declarationData = declaration;
                }

                // Add @decorator str if it exist
                decoratorChecker = checkAndExtractDecoratorsStr(declarationData, contentStr);

                // Add Declaration Type Str ['var', 'let', 'const', 'etc']
                switch (declarationData.type) {
                    case 'VariableDeclaration':
                        declarationStr = variableStringFactory(declarationData, contentStr, archiveMode);
                        break;
                    case 'FunctionDeclaration':
                        declarationStr = functionStringFactory(declarationData, contentStr, archiveMode);
                        break;
                    case 'ClassDeclaration':
                        declarationStr = classStringFactory(declarationData, contentStr, archiveMode);
                        break;
                    default:
                        // Just copy over other types such as enum's and interfaces over
                        declarationStr = contentStr.substring(declarationData.range[0], declarationData.range[1]);
                        break;
                }

                declarationStr = decoratorChecker + exportChecker + declarationStr;
                result += declarationStr + '\n';
            });

            return result;
        }

        fileMetaArr.map(async fileMeta => {
            let syncImports = '';
            const imports = fileMeta.imports;
            const declarations = fileMeta.declarations;
            const originalContentStr = fileMeta.originalContentStr;
            const stubContentDeclarationsStr = fileMeta.stubSyncDeclarationsStr;
            const archiveDeclarations = fileMeta.stubArchiveDeclarations;
            const stubArchiveCodeStr = fileMeta.stubArchiveCodeStr ? fileMeta.stubArchiveCodeStr : '';

            // Generate Import Strings
            imports.map(importStatement => {
                const importStr = fileMeta.originalContentStr.substring(importStatement.range[0], importStatement.range[1]);
                syncImports += importStr + '\n';
            });
            this.stubTemplate.syncImports = syncImports;

            // Add Extra Code to Stub Template
            this.stubTemplate.extraCode = fileMeta.stubExtraCodeStr ? fileMeta.stubExtraCodeStr : '';

            // Generate Declaration Strings - Declarations will already be provided a .stubImplementation if it exist from this.ensureStubFileAndParseItForMetadata() so no need to loop over the stub-file's declarations
            this.stubTemplate.syncDeclarations = declarationStringFactory(declarations, originalContentStr);

            // Generate Archive String or Clear it if --cleanStubTrash
            if (this.appState.program.cleanStubTrash) {
                this.stubTemplate.clearArchiveStr();
            } else {
                let newArchiveStr = '';
                if (archiveDeclarations) {
                    newArchiveStr = declarationStringFactory(archiveDeclarations, stubContentDeclarationsStr, true);
                }
                this.stubTemplate.createArchiveStr(stubArchiveCodeStr, newArchiveStr);
            }

            fileMeta.stubContentStrAfterUpdate = this.stubTemplate.fullTemplate;
        });

        return fileMetaArr;
    }

    // /* ===============================
    //             Taskmaster
    // ================================== */
    tmStart(fileMetaArr: FileStubSyncMeta[]) {
        const M_createNewStubContentString = this.createNewStubContentString(fileMetaArr);
        return M_createNewStubContentString;
    }
}


// Allows To Create Additional instances with DI set already
export const newTaskStubStringGenerator = () => {
    return new TaskStubStringGenerator(
        new StubTemplate(),
        appState_i1,
    );
}

// Exporting a const as a shared instance of class between the project..
export const taskStubStringGenerator_i1 = new TaskStubStringGenerator(
    new StubTemplate(),
    appState_i1
);