"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_task_1 = require("./parser.task");
var stub_string_generator_task_1 = require("./stub-string-generator.task");
var fs_writer_task_1 = require("./fs-writer.task");
var fs = require("fs-extra");
var AppTaskMaster = /** @class */ (function () {
    function AppTaskMaster() {
    }
    AppTaskMaster.prototype.processOverview = function () {
        return new Promise(function (resolve, reject) {
            var M_taskParser = parser_task_1.taskParser_i1.tmStart().then(function (MT_taskParser) {
                fs.writeJSON('./debug-json', MT_taskParser);
                var MT_taskStubStringGenerator = stub_string_generator_task_1.taskStubStringGenerator_i1.tmStart(MT_taskParser);
                var MT_taskFSWriter = fs_writer_task_1.taskFSWriter_i1.tmStart(MT_taskStubStringGenerator);
                console.log('Done!');
                resolve(MT_taskFSWriter);
            }).catch(function (e) { return reject(e); });
        });
    };
    return AppTaskMaster;
}());
exports.AppTaskMaster = AppTaskMaster;
// Allows To Create Additional instances with DI set already
exports.newAppTaskMaster = function () {
    return new AppTaskMaster();
};
// Exporting a const as a shared instance of class between the project..
exports.appTaskMaster_i1 = new AppTaskMaster();
