"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs-extra");
var path = require("path");
var app_state_service_1 = require("./services/app-state.service");
var app_taskmaster_1 = require("./app.taskmaster");
var _case = require("case");
describe('AppTaskMaster - Integration Testing -', function () {
    describe('processOverview()', function () {
        var contentResult;
        var task;
        var jasminePath = './jasmine-tests/';
        beforeAll(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var testsPath;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testsPath = path.join(jasminePath, 'tests');
                        fs.removeSync(testsPath);
                        fs.ensureDirSync(testsPath);
                        fs.copySync(path.join(jasminePath, 'test-reset-copy'), testsPath);
                        // ----- setup AppState --------
                        app_state_service_1.appState_i1.program = {};
                        app_state_service_1.appState_i1.userConfig = {
                            "sourceDirectory": testsPath,
                            "matchFilesRegex": new RegExp(".ts$|.js$"),
                            "ignoreFilesRegex": new RegExp("(^\\.)|(\\.spec\\.)|(\\.d\\.)|(\\.animations\\.)|(\\.module\\.)|(\\.expect\\.)|(\\.stub\\.)"),
                            "stubPrefix": _case.pascal('stub')
                        };
                        // -------- start process ------------
                        return [4 /*yield*/, app_taskmaster_1.appTaskMaster_i1.processOverview()];
                    case 1:
                        // -------- start process ------------
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should be able to handle and copy all import statements from  new-imports.test.ts to new-imports.test.stub.ts", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expectation, result;
            return tslib_1.__generator(this, function (_a) {
                expectation = fs.readFileSync(jasminePath + 'expectations/new-imports.expect.ts', 'utf-8');
                result = fs.readFileSync(jasminePath + 'tests/new-imports.test.stub.ts', 'utf-8');
                expect(result).toEqual(expectation);
                return [2 /*return*/];
            });
        }); });
        it("should be able to stub a class from new-class.test.ts to new-class.test.stub.ts", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expectation, result;
            return tslib_1.__generator(this, function (_a) {
                expectation = fs.readFileSync(jasminePath + 'expectations/new-class.expect.ts', 'utf-8');
                result = fs.readFileSync(jasminePath + 'tests/new-class.test.stub.ts', 'utf-8');
                expect(result).toEqual(expectation);
                return [2 /*return*/];
            });
        }); });
        it("should be able to stub functions from new-functions.test.ts to new-functions.test.stub.ts", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expectation, result;
            return tslib_1.__generator(this, function (_a) {
                expectation = fs.readFileSync(jasminePath + 'expectations/new-functions.expect.ts', 'utf-8');
                result = fs.readFileSync(jasminePath + 'tests/new-functions.test.stub.ts', 'utf-8');
                expect(result).toEqual(expectation);
                return [2 /*return*/];
            });
        }); });
        it("should be able to stub variables from new-variables.test.ts to new-variables.test.stub.ts", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expectation, result;
            return tslib_1.__generator(this, function (_a) {
                expectation = fs.readFileSync(jasminePath + 'expectations/new-variables.expect.ts', 'utf-8');
                result = fs.readFileSync(jasminePath + 'tests/new-variables.test.stub.ts', 'utf-8');
                expect(result).toEqual(expectation);
                return [2 /*return*/];
            });
        }); });
        it("should be able to copy enum values from new-enum.test.ts to new-enum.test.stub.ts", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var expectation, result;
            return tslib_1.__generator(this, function (_a) {
                expectation = fs.readFileSync(jasminePath + 'expectations/new-enum.expect.ts', 'utf-8');
                result = fs.readFileSync(jasminePath + 'tests/new-enum.test.stub.ts', 'utf-8');
                expect(result).toEqual(expectation);
                return [2 /*return*/];
            });
        }); });
        // Can't test yet as stub-template time-stamp is dynamic..
        // it(`should be able to retain existing stub implementations and archive unsynced stubs`, async () => {
        //     const expectationOriginal = fs.readFileSync(path + 'expectations/full-file.expect.ts', 'utf-8');
        //     const resultOriginal = fs.readFileSync(path + 'tests/full-file.test.ts', 'utf-8');
        //     const expectationStub = fs.readFileSync(path + 'expectations/full-file.expect.stub.ts', 'utf-8');
        //     const resultStub = fs.readFileSync(path + 'tests/full-file.test.stub.ts', 'utf-8');
        //     expect(expectationOriginal).toEqual(resultOriginal);
        //     expect(expectationStub).toEqual(resultStub);
        // });
    });
});
