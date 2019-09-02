"use strict";
/*
    Module-Template: Taskmaster

    ================================== Readme ======================================
    - This class is a template of Taskmaster.
    Please review extra properties and methods declared below that begin with
    prefix of "tm" in case you wish to use a namespace begining with tm.
    - This class needs to emit if fs.watch 'rename' or a 'change' specifically to autofont.scss event happens for watcher (see app.ts)
     Use the find tool and search: "@Emitter" to find methods related to EventEmitter.
*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* ===============================
        Dependencies
================================== */
var app_state_service_1 = require("./services/app-state.service");
var stub_template_1 = require("../models/stub-template");
/* ---------------- Code ---------------------- */
var TaskStubStringGenerator = /** @class */ (function () {
    function TaskStubStringGenerator(stubTemplate, appState) {
        this.stubTemplate = stubTemplate;
        this.appState = appState;
    }
    /* =====================================================
                        Main Methods
    ======================================================== */
    TaskStubStringGenerator.prototype.createNewStubContentString = function (fileMetaArr) {
        var _this = this;
        var checkAndExtractDecoratorsStr = function (declarationData, originalContentStr) {
            var result = '';
            if (declarationData.decorators) {
                declarationData.decorators.map(function (decorator) {
                    var decoratorStr = originalContentStr.substring(decorator.range[0], decorator.range[1]);
                    result += decoratorStr + '\n';
                });
            }
            return result;
        };
        var checkAndExtractTyping = function (declarationData, originalContentStr) {
            var result = '';
            if (declarationData.typeAnnotation) {
                result += originalContentStr.substring(declarationData.typeAnnotation.range[0], declarationData.typeAnnotation.range[1]);
            }
            return result;
        };
        var checkAndExtractReturnType = function (declarationData, originalContentStr) {
            var result = '';
            if (declarationData.returnType) {
                result += originalContentStr.substring(declarationData.returnType.range[0], declarationData.returnType.range[1]);
            }
            return result;
        };
        var createParamsString = function (paramArray, originalContentStr, tabSpaceForNewLine) {
            var singleTabWithNewLineChecker = tabSpaceForNewLine ? ('\n' + tabSpaceForNewLine) : '';
            var doubleTabWithNewlineChecker = tabSpaceForNewLine ? ('\n' + tabSpaceForNewLine + tabSpaceForNewLine) : '';
            var spaceChecker = tabSpaceForNewLine ? '' : ' ';
            var result = '(';
            paramArray.map(function (param, index) {
                var paramStr = originalContentStr.substring(param.range[0], param.range[1]);
                if (index + 1 === paramArray.length) {
                    result += doubleTabWithNewlineChecker + paramStr;
                }
                else {
                    result += doubleTabWithNewlineChecker + paramStr + ',' + spaceChecker;
                }
            });
            result += singleTabWithNewLineChecker + ')';
            return result;
        };
        // const handleArrowFunction = (paramArray, originalContentStr: string, tabSpaceForNewLine?: string) => {
        //     decNamesAndValues += createParamsString(oneDeclarationNameData.init.params, contentStr);
        //     decNamesAndValues += ' => ';
        // }
        var variableStringFactory = function (declarationData, contentStr, archiveMode) {
            var result;
            var decNamesAndValues = '';
            var declarationType = declarationData.kind + ' ';
            declarationData.declarations.map(function (oneDeclarationNameData) {
                if (archiveMode) {
                    decNamesAndValues += contentStr.substring(oneDeclarationNameData.range[0], oneDeclarationNameData.range[1]);
                    decNamesAndValues += ',\n';
                    return;
                }
                var name = archiveMode ? oneDeclarationNameData.id.name : (oneDeclarationNameData.id.name + _this.appState.userConfig.stubPrefix);
                var typing = checkAndExtractTyping(oneDeclarationNameData, contentStr);
                var stubImplementation = oneDeclarationNameData.stubImplementation;
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
                    stubImplementation = stubImplementation ? stubImplementation : _this.stubTemplate.functionDefaultImplementation();
                }
                else {
                    stubImplementation = stubImplementation ? stubImplementation : _this.stubTemplate.variableDefaultImplementation;
                }
                decNamesAndValues += stubImplementation + ',\n';
            });
            // remove a ',\n' and replace it with ';'
            decNamesAndValues = decNamesAndValues.slice(0, -2) + ';';
            result = declarationType + decNamesAndValues;
            return result;
        };
        var functionStringFactory = function (declarationData, contentStr, archiveMode) {
            var result = '';
            var stubImplementation = declarationData.stubImplementation ? declarationData.stubImplementation : _this.stubTemplate.functionDefaultImplementation();
            var name = archiveMode ? declarationData.id.name : (declarationData.id.name + _this.appState.userConfig.stubPrefix);
            if (archiveMode) {
                result += contentStr.substring(declarationData.range[0], declarationData.range[1]);
            }
            else {
                result += 'function ';
                result += name;
                result += createParamsString(declarationData.params, contentStr);
                result += checkAndExtractReturnType(declarationData, contentStr);
                result += ' ' + stubImplementation;
            }
            result += ';';
            return result;
        };
        var classStringFactory = function (declarationData, contentStr, archiveMode) {
            var result = '';
            var implementsChecker = '';
            var name = archiveMode ? declarationData.id.name : (declarationData.id.name + _this.appState.userConfig.stubPrefix);
            result += 'class ';
            result += name + ' ';
            // Add Implements Str if exist
            if (declarationData.implements) {
                implementsChecker = 'implements ';
                var implementsStrArr = declarationData.implements.map(function (implementsData) {
                    return contentStr.substring(implementsData.range[0], implementsData.range[1]);
                });
                result += implementsChecker + implementsStrArr.join(', ') + ' ';
            }
            result += '{\n';
            // Loop through class body - TODO: double check with test..
            var classBody = declarationData.body.body;
            classBody.map(function (classItem) {
                result += '\n';
                var tabSpace = '  ';
                var decoratorsStr = checkAndExtractDecoratorsStr(classItem, contentStr);
                var modifyerChecker = classItem.accessibility ? classItem.accessibility + ' ' : '';
                var staticChecker = classItem.static ? 'static ' : '';
                var readonlyChecker = classItem.readonly ? 'readonly ' : '';
                var getterSetterChecker = (classItem.kind === 'set' || classItem.kind === 'get') ? classItem.kind + " " : '';
                var name = classItem.key.name;
                var stubImplementation = classItem.stubImplementation;
                if (archiveMode) {
                    result += tabSpace + contentStr.substring(classItem.range[0], classItem.range[1]);
                    return;
                }
                result += decoratorsStr ? tabSpace + decoratorsStr : '';
                result += tabSpace + modifyerChecker + staticChecker + getterSetterChecker + readonlyChecker + name;
                switch (classItem.type) {
                    case 'ClassProperty':
                        // TODO: make arrow functions in properties update arguments and return typing.. 
                        // (property is considered implemented if there is an = sign present)
                        var typing = checkAndExtractTyping(classItem, contentStr);
                        if (classItem.value && classItem.value.type === 'ArrowFunctionExpression') {
                            var arrowArguments = createParamsString(classItem.value.params, contentStr) + " => ";
                            stubImplementation = stubImplementation ? (arrowArguments + stubImplementation) : (arrowArguments + _this.stubTemplate.functionDefaultImplementation(tabSpace));
                        }
                        else {
                            stubImplementation = stubImplementation ? stubImplementation : _this.stubTemplate.variableDefaultImplementation;
                        }
                        result += typing + ' = ' + stubImplementation;
                        result += ';';
                        break;
                    case 'MethodDefinition':
                        var returnType = checkAndExtractReturnType(classItem.value, contentStr);
                        var params = void 0;
                        if (classItem.kind === 'constructor') {
                            params = createParamsString(classItem.value.params, contentStr, tabSpace);
                            result += params + '{}';
                        }
                        else {
                            params = createParamsString(classItem.value.params, contentStr);
                            stubImplementation = stubImplementation ? stubImplementation : _this.stubTemplate.functionDefaultImplementation(tabSpace);
                            result += params + returnType + ' ' + stubImplementation;
                        }
                        result += '\n';
                        break;
                    default:
                        break;
                }
            });
            result += '\n};';
            // MethodDefinition
            // ClassProperty
            return result;
        };
        var enumStringFactory = function (enumDeclaration, contentStr, archiveMode) {
            var result = '';
            var declarationData;
            if (enumDeclaration.type === 'ExportNamedDeclaration') {
                declarationData = enumDeclaration.declaration;
            }
            else {
                declarationData = enumDeclaration;
            }
            var enumName = declarationData.id.name;
            var stubPrefixChecker = archiveMode ? '' : _this.appState.userConfig.stubPrefix;
            var enumStr = contentStr.substring(enumDeclaration.range[0], enumDeclaration.range[1]);
            var split = enumStr.split(enumName);
            var enumBegining = split.shift();
            var restOfStr = split.join(enumName); // in the rare event the name is within the enum..
            enumBegining = enumBegining + enumName + stubPrefixChecker;
            result = enumBegining + restOfStr;
            return result;
        };
        var declarationStringFactory = function (declarationArr, contentStr, archiveMode) {
            var result = '';
            declarationArr.map(function (declaration) {
                var type = declaration.type;
                var declarationStr = '';
                var declarationData;
                var exportChecker = '';
                var decoratorChecker;
                // Check if Exported
                if (type === 'ExportNamedDeclaration') {
                    exportChecker = 'export ';
                    declarationData = declaration.declaration;
                }
                else {
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
        };
        fileMetaArr.map(function (fileMeta) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var syncImports, imports, declarations, originalContentStr, stubContentDeclarationsStr, archiveDeclarations, stubArchiveCodeStr, newArchiveStr;
            return tslib_1.__generator(this, function (_a) {
                syncImports = '';
                imports = fileMeta.imports;
                declarations = fileMeta.declarations;
                originalContentStr = fileMeta.originalContentStr;
                stubContentDeclarationsStr = fileMeta.stubSyncDeclarationsStr;
                archiveDeclarations = fileMeta.stubArchiveDeclarations;
                stubArchiveCodeStr = fileMeta.stubArchiveCodeStr ? fileMeta.stubArchiveCodeStr : '';
                // Generate Import Strings
                imports.map(function (importStatement) {
                    var importStr = fileMeta.originalContentStr.substring(importStatement.range[0], importStatement.range[1]);
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
                }
                else {
                    newArchiveStr = '';
                    if (archiveDeclarations) {
                        newArchiveStr = declarationStringFactory(archiveDeclarations, stubContentDeclarationsStr, true);
                    }
                    this.stubTemplate.createArchiveStr(stubArchiveCodeStr, newArchiveStr);
                }
                fileMeta.stubContentStrAfterUpdate = this.stubTemplate.fullTemplate;
                return [2 /*return*/];
            });
        }); });
        return fileMetaArr;
    };
    // /* ===============================
    //             Taskmaster
    // ================================== */
    TaskStubStringGenerator.prototype.tmStart = function (fileMetaArr) {
        var M_createNewStubContentString = this.createNewStubContentString(fileMetaArr);
        return M_createNewStubContentString;
    };
    return TaskStubStringGenerator;
}());
exports.TaskStubStringGenerator = TaskStubStringGenerator;
// Allows To Create Additional instances with DI set already
exports.newTaskStubStringGenerator = function () {
    return new TaskStubStringGenerator(new stub_template_1.StubTemplate(), app_state_service_1.appState_i1);
};
// Exporting a const as a shared instance of class between the project..
exports.taskStubStringGenerator_i1 = new TaskStubStringGenerator(new stub_template_1.StubTemplate(), app_state_service_1.appState_i1);
