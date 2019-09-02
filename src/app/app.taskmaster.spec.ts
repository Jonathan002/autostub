import * as fs from 'fs-extra';
import * as path from 'path';
import { appState_i1 } from './services/app-state.service';
import { appTaskMaster_i1 } from './app.taskmaster';
import * as _case from 'case';

describe('AppTaskMaster - Integration Testing -', () => {

    describe('processOverview()', () => {
        let contentResult;
        let task;
        const jasminePath = './jasmine-tests/';
        beforeAll(async () => {
            // ----- reset files --------
            const testsPath = path.join(jasminePath, 'tests');
            fs.removeSync(testsPath);
            fs.ensureDirSync(testsPath);
            fs.copySync(path.join(jasminePath, 'test-reset-copy'), testsPath);

            // ----- setup AppState --------
            appState_i1.program = {};
            appState_i1.userConfig = {
                "sourceDirectory": testsPath,
                "matchFilesRegex": new RegExp(".ts$|.js$"),
                "ignoreFilesRegex": new RegExp("(^\\.)|(\\.spec\\.)|(\\.d\\.)|(\\.animations\\.)|(\\.module\\.)|(\\.expect\\.)|(\\.stub\\.)"),
                "stubPrefix": _case.pascal('stub')
            }
            // -------- start process ------------
            await appTaskMaster_i1.processOverview();
        });

        it(`should be able to handle and copy all import statements from  new-imports.test.ts to new-imports.test.stub.ts`, async () => {
            const expectation = fs.readFileSync(jasminePath + 'expectations/imports.expect.stub.ts', 'utf-8');
            const result = fs.readFileSync(jasminePath + 'tests/imports.test.stub.ts', 'utf-8');
            expect(result).toEqual(expectation);
        });

        it(`should be able to stub a class from new-class.test.ts to new-class.test.stub.ts`, async () => {
            const expectation = fs.readFileSync(jasminePath + 'expectations/class.expect.stub.ts', 'utf-8');
            const result = fs.readFileSync(jasminePath + 'tests/class.test.stub.ts', 'utf-8');
            expect(result).toEqual(expectation);
        });

        it(`should be able to stub functions from new-functions.test.ts to new-functions.test.stub.ts`, async () => {
            const expectation = fs.readFileSync(jasminePath + 'expectations/functions.expect.stub.ts', 'utf-8');
            const result = fs.readFileSync(jasminePath + 'tests/functions.test.stub.ts', 'utf-8');
            expect(result).toEqual(expectation);
        });

        it(`should be able to stub variables from new-variables.test.ts to new-variables.test.stub.ts`, async () => {
            const expectation = fs.readFileSync(jasminePath + 'expectations/variables.expect.stub.ts', 'utf-8');
            const result = fs.readFileSync(jasminePath + 'tests/variables.test.stub.ts', 'utf-8');
            expect(result).toEqual(expectation);
        });

        // Failing.. Enum does not get a Stub prefix at the end..
        it(`should be able to copy enum values from new-enum.test.ts to new-enum.test.stub.ts`, async () => {
            const expectation = fs.readFileSync(jasminePath + 'expectations/enum.expect.stub.ts', 'utf-8');
            const result = fs.readFileSync(jasminePath + 'tests/enum.test.stub.ts', 'utf-8');
            expect(result).toEqual(expectation);
        });

        // Failing.. Can't test yet as stub-template time-stamp is dynamic..
        it(`should be able to retain existing stub implementations and archive unsynced stubs`, async () => {

            const splitter = `Archive Stub Declarations`;
            const expectationOriginal = fs.readFileSync(jasminePath + 'expectations/retain-state.expect.ts', 'utf-8');
            const resultOriginal = fs.readFileSync(jasminePath + 'tests/retain-state.test.ts', 'utf-8');
            const expectationStub = fs.readFileSync(jasminePath + 'expectations/retain-state.expect.stub.ts', 'utf-8');
            const resultStub = fs.readFileSync(jasminePath + 'tests/retain-state.test.stub.ts', 'utf-8');

            // Stub Archive str at bottom of file is dynamic since a new Data() timestap is added.
            const expectationStubCut = expectationStub.split(splitter).shift();
            const resultStubCut = resultStub.split(splitter).shift();
            expect(expectationOriginal).toEqual(resultOriginal);
            // fs.writeFileSync('./exect-str.ts', expectationStubCut);
            // fs.writeFileSync('./result-str.ts', resultStubCut);
            // if (expectationStubCut === resultStubCut) {
            //     console.log('yes!!!');
            // }
            expect(expectationStubCut).toEqual(resultStubCut);
        });
    });

});