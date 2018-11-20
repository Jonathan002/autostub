#!/usr/bin/env node

import { 
	prepareCommanderProgramAndGetInput, 
	validateInput, 
	setupAppState, 
	reportToUserOnOptionsUsed, 
	runAppProcess
} from './bootstrap';


/* ===============================
     Execution Overview
================================== */
prepareCommanderProgramAndGetInput();
validateInput();
reportToUserOnOptionsUsed();
setupAppState();
runAppProcess();


// TODO: optimize looping..
// fileMetaArr.map(taskMaster({ funcOne, funcTwo}, {config: 'etc'});
// taskMaster(options, taskOne, taskTwo) {
//     return (oneFileMeta) => {
//         taskOne(oneFileMeta)
//         taskTwo(taskOneResult)
//     }
// }




