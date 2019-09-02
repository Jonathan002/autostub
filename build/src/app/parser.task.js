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
var dir = require("node-dir");
var fs = require("fs-extra");
var path = require("path");
var Utils = require("../../lib/utility");
var app_state_service_1 = require("./services/app-state.service");
var stub_template_1 = require("../models/stub-template");
var esLintParser = require("../../lib/typescript-eslint-parser");
/* ---------------- Code ---------------------- */
var TaskParser = /** @class */ (function () {
    function TaskParser(esLintParser, stubTemplate, utils, appState) {
        this.esLintParser = esLintParser;
        this.stubTemplate = stubTemplate;
        this.utils = utils;
        this.appState = appState;
    }
    /* ===============================
        Basic helper module methods
    ================================== */
    TaskParser.prototype.declarationFilter = function (declaration) {
        // 'ExportNamedDeclaration' may have null declaration with this statement which interfeers with declaration.type logic below..
        // (declaration.declaration !== null) filters this out - "export { AppServerModule } from './app/app.server.module';" 
        return (declaration.type === 'ExportNamedDeclaration' && declaration.declaration !== null)
            || declaration.type === 'VariableDeclaration'
            || declaration.type === 'FunctionDeclaration'
            || declaration.type === 'ClassDeclaration'
            || declaration.type === 'TSEnumDeclaration'
            || declaration.type === 'TSInterfaceDeclaration';
    };
    // TODO: create a class tracer to handle error logging..
    TaskParser.prototype.tryToExtractName = function (declaration, contentStr, path) {
        var name;
        try {
            name = declaration.id ? declaration.id.name : declaration.key.name;
        }
        catch (e) {
            var declarationStr = contentStr.substring(declaration.range[0], declaration.range[1]);
            throw Error("Unable to give declration a name @" + declarationStr + " in file: " + path);
        }
        return name;
    };
    /* =====================================================
                        Main Methods
    ======================================================== */
    TaskParser.prototype.parseOriginalAndGenerateFileMetadata = function () {
        var _this = this;
        var once = false;
        return new Promise(function (resolve, reject) {
            var fileMetaArr = [];
            // TODO: make opinionated regex customizable
            dir.readFiles(_this.appState.userConfig.sourceDirectory, {
                match: _this.appState.userConfig.matchFilesRegex,
                exclude: _this.appState.userConfig.ignoreFilesRegex,
            }, function (err, content, filename, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var fileMeta, parsedPath, stubPath, _a, e_1;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (err)
                                throw err;
                            fileMeta = {};
                            parsedPath = path.parse(filename);
                            if (parsedPath.name.substring(parsedPath.name.length - 'stub'.length) === 'stub') {
                                throw Error("\".stub.\" Files are expected to be ignored in autostub.json.ignoreFilesRegex - Please add it to the autostub.json or copy the default autostub config values from the doucmentation in order to prevent the accidental creation of \".stub.'s\" own \".stub.stub.\" files");
                            }
                            else {
                                parsedPath.name = parsedPath.name + '.stub';
                                parsedPath.base = parsedPath.name + parsedPath.ext;
                                stubPath = path.format(parsedPath);
                            }
                            fileMeta.stubPath = stubPath;
                            // =============== Original ======================
                            fileMeta.fileExtension = parsedPath.ext;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            _a = fileMeta;
                            return [4 /*yield*/, this.esLintParser.parse(content)];
                        case 2:
                            _a.originalParsed = _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _b.sent();
                            throw Error("The file \"" + filename + "\" could not be parsed correctly. Please check to see if the code is formated correctly.");
                        case 4:
                            fileMeta.originalPath = filename;
                            // TODO: add updateMeta(esParsed)
                            fileMeta.originalContentStr = content;
                            // =============================================
                            fileMetaArr.push(fileMeta);
                            next();
                            return [2 /*return*/];
                    }
                });
            }); }, function (err, files) {
                if (err)
                    throw err;
                resolve(fileMetaArr);
            });
        });
    };
    TaskParser.prototype.sortImportsAndDeclarationsAndUpdateFileMetaArr = function (fileMetaArr) {
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
        var _this = this;
        fileMetaArr.map(function (fileMeta) {
            var parsedCodeBody = fileMeta.originalParsed.body;
            var importsDeclared = [];
            var declarations = [];
            parsedCodeBody.map(function (item) {
                if (item.type === 'ImportDeclaration') {
                    importsDeclared.push(item);
                }
                else if (_this.declarationFilter(item)) {
                    declarations.push(item);
                }
            });
            fileMeta.imports = importsDeclared;
            fileMeta.declarations = declarations;
        });
        return fileMetaArr;
    };
    TaskParser.prototype.ensureStubNameCommentsInOriginalContentStr = function (fileMetaArr) {
        var _this = this;
        fileMetaArr.map(function (fileMeta) {
            var originalContentStr = fileMeta.originalContentStr;
            var newContentStr = originalContentStr;
            var extraCharCount = 0;
            var addStubPrefix = false;
            fileMeta.declarations.map(function (declaration) {
                // find first two characters and it should be /*
                // will test if whitespacesExist in /*name*/ (up to end)
                // if false then register as sync stub name
                // if whitespace exist is a regular comment and will add a /*name*/
                var type = declaration.type;
                var declarationData;
                if (type === 'ExportNamedDeclaration') {
                    declarationData = declaration.declaration;
                }
                else {
                    declarationData = declaration;
                }
                var updateNewContentStr = function (oneDeclarationNameData) {
                    var endIndexBeforeStubComment = oneDeclarationNameData.range[1] + extraCharCount;
                    var strAfterDeclration = newContentStr.substring(endIndexBeforeStubComment);
                    // move strAfterDeclration up by one character if a ';' is detected
                    if (strAfterDeclration.trim().slice(0, 1) === ';') {
                        var semiColonIndex = strAfterDeclration.indexOf(';');
                        endIndexBeforeStubComment += (semiColonIndex + 1);
                        strAfterDeclration = newContentStr.substring(endIndexBeforeStubComment);
                    }
                    var trimedStr = strAfterDeclration.trim();
                    var hasStubCommentIndex = 0;
                    var stubCommentCharLength = 0;
                    var name;
                    try {
                        name = oneDeclarationNameData.id ? oneDeclarationNameData.id.name : oneDeclarationNameData.key.name;
                    }
                    catch (e) {
                        var declarationStr = originalContentStr.substring(oneDeclarationNameData.range[0], oneDeclarationNameData.range[1]);
                        throw Error("Unable to give declration a name @" + declarationStr + " in file: " + fileMeta.originalPath);
                    }
                    name = addStubPrefix ? (name + _this.appState.userConfig.stubPrefix) : name;
                    var stubCommentStrToAdd = " /*" + name + "*/";
                    // Detect if stubName comment exist..
                    // A stubName comment MUST be directly after declaration and MUST not have any spaces within the comment
                    // A stubName comment may or may not have one white space-like(/\s/) character before it. 
                    // Since the new stubCommentStrToAdd insertion ALWAYS INCLUDES ONE_SPACE the logic for a possible space needs to be done in order to prevent accidental space adding.
                    if (trimedStr.slice(0, 2) === '/*') {
                        var sample = trimedStr.split('*/').shift();
                        if (sample.search(/\s/) === -1) {
                            hasStubCommentIndex = strAfterDeclration.indexOf('/*');
                            if (strAfterDeclration.substring(hasStubCommentIndex - 1, hasStubCommentIndex).search(/\s/) !== -1) {
                                stubCommentCharLength += 1;
                                hasStubCommentIndex -= 1; // stub comment starts at one white space like character
                            }
                            var stubName = sample.slice(2);
                            stubCommentCharLength += (2 + stubName.length + 2);
                            oneDeclarationNameData.stubName = stubName;
                        }
                    }
                    // newContentStr = declaration_WithPossibleSemiColonAdded_Str; + /*stubCommentStrToAdd*/ + (-> skipping over -> hasStubCommentIndex:'(spaces)'.length + (' /*oldStubCommentName*/'.length || '/*oldStubCommentName*/'.length))
                    newContentStr = newContentStr.substring(0, endIndexBeforeStubComment) + stubCommentStrToAdd + newContentStr.substring(endIndexBeforeStubComment + hasStubCommentIndex + stubCommentCharLength);
                    extraCharCount -= (hasStubCommentIndex + stubCommentCharLength);
                    extraCharCount += stubCommentStrToAdd.length;
                };
                addStubPrefix = true;
                switch (declarationData.type) {
                    // names after a let,const,var (e.g. var -> cat, dog, turtle <-)
                    case 'VariableDeclaration':
                        var declarators = declarationData.declarations;
                        declarators.map(updateNewContentStr);
                        break;
                    case 'FunctionDeclaration':
                        updateNewContentStr(declarationData);
                        break;
                    case 'ClassDeclaration':
                        var classBody = declarationData.body.body;
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
    };
    TaskParser.prototype.ensureStubFileAndParseItForMetadata = function (fileMetaArr) {
        var _this = this;
        fileMetaArr.map(function (fileMeta) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var stubContent, checkArrParsing, updateRealDeclarationWithStubImplementationHelper_1, updateRealDeclarationWithStubImplementationAndReturnArchive_1, importSplit, strWithoutSyncImports, mainSplit, extraCodeStr, restOfTheCodeStr, archiveSplit, stubSyncDeclarationsStr, archiveStr, _a, e_2;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fs.ensureFileSync(fileMeta.stubPath);
                        stubContent = fs.readFileSync(fileMeta.stubPath, 'utf-8');
                        // const stubContent = fs.readFileSync('./full-code-stub-implementation.stub.ts', 'utf-8'); // for testing
                        fileMeta.stubContentStr = stubContent;
                        if (!(stubContent.length === 0)) return [3 /*break*/, 1];
                        fileMeta.stubFileIsNew = true;
                        return [3 /*break*/, 5];
                    case 1:
                        checkArrParsing = function (arr) {
                            if (arr.length === 1) {
                                throw Error("Stub Files Comments should not be changed! Could not parse stub file at " + fileMeta.stubPath);
                            }
                            else {
                                return arr;
                            }
                        };
                        updateRealDeclarationWithStubImplementationHelper_1 = function (stubDeclration, realDeclaration, stubSyncDeclarationsStr, classOrDeclarationParent) {
                            // VariableDeclaration type finding is already handled at updateRealDeclarationWithStubImplementationAndReturnArchive()
                            var declarationName;
                            try {
                                switch (stubDeclration.type) {
                                    case 'ClassDeclaration':
                                        declarationName = stubDeclration.id.name;
                                        var stubClassBody = stubDeclration.body.body;
                                        var realClassBody = realDeclaration.body.body;
                                        return updateRealDeclarationWithStubImplementationAndReturnArchive_1(stubClassBody, realClassBody, stubSyncDeclarationsStr, classOrDeclarationParent);
                                    case 'VariableDeclarator':
                                        declarationName = stubDeclration.id.name;
                                        // checks if arrowFunction so it won't include parameters in stub implementation
                                        if (stubDeclration.init && stubDeclration.init.type === 'ArrowFunctionExpression') {
                                            // gets both => "{ return 'abc' }" block statement and literal => "'abc'"
                                            realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.init.body.range[0], stubDeclration.init.body.range[1]);
                                            break;
                                        }
                                        realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.init.range[0], stubDeclration.init.range[1]);
                                        break;
                                    case 'FunctionDeclaration':
                                        declarationName = stubDeclration.id.name;
                                        realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.body.range[0], stubDeclration.body.range[1]);
                                        break;
                                    case 'MethodDefinition':
                                        declarationName = stubDeclration.key.name;
                                        realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.value.body.range[0], stubDeclration.value.body.range[1]);
                                        break;
                                    case 'ClassProperty':
                                        declarationName = stubDeclration.key.name;
                                        realDeclaration.stubImplementation = stubSyncDeclarationsStr.substring(stubDeclration.value.range[0], stubDeclration.value.range[1]);
                                        break;
                                    default:
                                        // Other Types such as Enums and Interface will just get copied over (without stub prefix) at Class StubStringGeneratorTask().createNewStubContentString()#declarationStringFactory()...
                                        break;
                                }
                            }
                            catch (e) {
                                throw Error("There was a problem parsing the declaration name or class key of \"" + declarationName + "\". Please note that all declarations in an existing stub file must always be initialized with a value even if the value itself is undefined. \n" + e);
                            }
                            return null;
                        };
                        updateRealDeclarationWithStubImplementationAndReturnArchive_1 = function (stubDeclrations, realDeclarations, stubSyncDeclarationsStr, classOrDeclarationParent) {
                            // Goal: if stubName exist, find it and add the stub implementation to the originalDeclarationsArr (so generating stubContentStr only needs to happen from that one array)
                            var archiveArr = [];
                            if (Array.isArray(stubDeclrations) && Array.isArray(realDeclarations)) {
                                for (var i = 0; i < stubDeclrations.length; i++) {
                                    var archiveChildren = void 0;
                                    var oneStubDec = stubDeclrations[i];
                                    var foundMatch = false;
                                    var stubDeclarationData = (oneStubDec.type === 'ExportNamedDeclaration') ? oneStubDec.declaration : oneStubDec;
                                    var typeToLookFor = stubDeclarationData.type;
                                    for (var _i = 0, realDeclarations_1 = realDeclarations; _i < realDeclarations_1.length; _i++) {
                                        var oneRealDec = realDeclarations_1[_i];
                                        var realDeclarationData = (oneRealDec.type === 'ExportNamedDeclaration') ? oneRealDec.declaration : oneRealDec;
                                        if (realDeclarationData.type === typeToLookFor && typeToLookFor === 'VariableDeclaration') {
                                            foundMatch = true;
                                            archiveChildren = updateRealDeclarationWithStubImplementationAndReturnArchive_1(stubDeclarationData.declarations, realDeclarationData.declarations, stubSyncDeclarationsStr, oneStubDec);
                                        }
                                        else if (typeToLookFor !== 'VariableDeclaration') {
                                            var stubDeclrationName = _this.tryToExtractName(stubDeclarationData, fileMeta.stubContentStr, fileMeta.stubPath);
                                            // determine match
                                            if (stubDeclrationName === realDeclarationData.stubName) {
                                                foundMatch = true;
                                                archiveChildren = updateRealDeclarationWithStubImplementationHelper_1(stubDeclarationData, realDeclarationData, stubSyncDeclarationsStr, oneStubDec);
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
                                        var deepCopy = _this.utils.newInstance(oneStubDec);
                                        var deepCopyDecData = (deepCopy.type === 'ExportNamedDeclaration') ? deepCopy.declaration : deepCopy;
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
                            }
                            else {
                                throw Error('Arguments Passed in are not Arrays! @ensureStubFileAndParseItForMetadata() - loopDeclarations()');
                            }
                            return archiveArr;
                        };
                        // TODO: handle parsing
                        fileMeta.stubFileIsNew = false;
                        importSplit = checkArrParsing(stubContent.split(this.stubTemplate.header_extraCode));
                        strWithoutSyncImports = importSplit.pop();
                        mainSplit = checkArrParsing(strWithoutSyncImports.split(this.stubTemplate.header_syncStubDeclarations));
                        extraCodeStr = mainSplit[0];
                        restOfTheCodeStr = mainSplit[1];
                        archiveSplit = restOfTheCodeStr.split(this.stubTemplate.header_archiveDeclarations);
                        stubSyncDeclarationsStr = archiveSplit[0];
                        archiveStr = archiveSplit[1] ? archiveSplit[1] : '';
                        fileMeta.stubArchiveCodeStr = archiveStr;
                        fileMeta.stubExtraCodeStr = extraCodeStr;
                        fileMeta.stubSyncDeclarationsStr = stubSyncDeclarationsStr;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        _a = fileMeta;
                        return [4 /*yield*/, this.esLintParser.parse(stubSyncDeclarationsStr)];
                    case 3:
                        _a.stubSyncDeclarationsParsed = _b.sent();
                        fileMeta.stubSyncDeclarationsParsed.content = stubSyncDeclarationsStr;
                        fileMeta.stubDeclarations = fileMeta.stubSyncDeclarationsParsed.body.filter(this.declarationFilter); // TODO: do test and try to find errors to handle - (e.g. import statement placed in the Sync Stub Declarations area..)
                        fileMeta.stubArchiveDeclarations = updateRealDeclarationWithStubImplementationAndReturnArchive_1(fileMeta.stubDeclarations, fileMeta.declarations, stubSyncDeclarationsStr);
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _b.sent();
                        throw Error("The file \"" + fileMeta.stubPath + "\" could not be parsed correctly. Please check to see if the code is formated correctly. \n" + e_2);
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        return fileMetaArr;
    };
    // /* ===============================
    //             Taskmaster
    // ================================== */
    // Note: createNewStubContentString() fileMeta.map method is marked as Async so the async function inside ensureStubFileAndParseItForMetadata can Error Log ahead and report bad parsing..
    TaskParser.prototype.tmStart = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var M_parseOriginalAndGenerateFileMetadata = _this.parseOriginalAndGenerateFileMetadata().then(function (MT_parseOriginalAndGenerateFileMetadata) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var MT_sortImportsAndDeclarationsAndUpdateFileMetaArr, MT_ensureStubSyncCommentsInOriginalContentStr, MT_ensureStubFileAndParseItForMetadata;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            MT_sortImportsAndDeclarationsAndUpdateFileMetaArr = this.sortImportsAndDeclarationsAndUpdateFileMetaArr(MT_parseOriginalAndGenerateFileMetadata);
                            MT_ensureStubSyncCommentsInOriginalContentStr = this.ensureStubNameCommentsInOriginalContentStr(MT_sortImportsAndDeclarationsAndUpdateFileMetaArr);
                            return [4 /*yield*/, this.ensureStubFileAndParseItForMetadata(MT_sortImportsAndDeclarationsAndUpdateFileMetaArr)];
                        case 1:
                            MT_ensureStubFileAndParseItForMetadata = _a.sent();
                            fs.writeJSONSync('./json-test.json', MT_ensureStubFileAndParseItForMetadata, { spaces: 2 });
                            resolve(MT_ensureStubFileAndParseItForMetadata);
                            return [2 /*return*/];
                    }
                });
            }); }).catch(function (error) {
                reject(error);
            });
        });
    };
    return TaskParser;
}());
exports.TaskParser = TaskParser;
// Allows To Create Additional instances with DI set already
exports.newTaskParser = function () {
    return new TaskParser(esLintParser, new stub_template_1.StubTemplate(), Utils, app_state_service_1.appState_i1);
};
// Exporting a const as a shared instance of class between the project..
exports.taskParser_i1 = new TaskParser(esLintParser, new stub_template_1.StubTemplate(), Utils, app_state_service_1.appState_i1);
