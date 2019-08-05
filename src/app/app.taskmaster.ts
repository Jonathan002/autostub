import { taskParser_i1 } from './parser.task';
import { taskStubStringGenerator_i1 } from './stub-string-generator.task';
import { taskFSWriter_i1 } from './fs-writer.task';
import * as fs from 'fs-extra';


export class AppTaskMaster {
	processOverview(): Promise<any> {
		return new Promise((resolve, reject) => {
			const M_taskParser = taskParser_i1.tmStart().then(MT_taskParser => {
				fs.writeJSON('./debug-json', MT_taskParser)
				const MT_taskStubStringGenerator = taskStubStringGenerator_i1.tmStart(MT_taskParser);
				const MT_taskFSWriter = taskFSWriter_i1.tmStart(MT_taskStubStringGenerator);
				console.log('Done!');
				resolve(MT_taskFSWriter);
			}).catch(e => reject(e));
		})
	}
}

// Allows To Create Additional instances with DI set already
export const newAppTaskMaster = () => {
    return new AppTaskMaster();
}

// Exporting a const as a shared instance of class between the project..
export const appTaskMaster_i1 = new AppTaskMaster();