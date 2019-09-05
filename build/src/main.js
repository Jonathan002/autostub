#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bootstrap_1 = require("./bootstrap");
/* ===============================
     Execution Overview
================================== */
bootstrap_1.prepareCommanderProgramAndGetInput();
bootstrap_1.validateInput();
bootstrap_1.reportToUserOnOptionsUsed();
bootstrap_1.setupAppState();
bootstrap_1.runAppProcess();
// TODO: optimize looping..
// fileMetaArr.map(taskMaster({ funcOne, funcTwo}, {config: 'etc'});
// taskMaster(options, taskOne, taskTwo) {
//     return (oneFileMeta) => {
//         taskOne(oneFileMeta)
//         taskTwo(taskOneResult)
//     }
// }
