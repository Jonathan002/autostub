export class StubTemplate {
// Note: Keep to each end to prevent space on output... 
		public header_syncImports: string = `// =====================================================================;
//                            Sync Imports                              
// =====================================================================`;
		public header_extraCode: string = `// =====================================================================
//                            Extra Code
// =====================================================================
// - Write Extra File Code Here (e.g. Import { fakeJsonToReturn } from './someplace' )
// ---------------------------------------------------------------------`;
		public header_syncStubDeclarations: string = `// =====================================================================
//                      Sync Stub Declarations
// =====================================================================
// - Feel free to define values for any synced declaration logic. 
// - DO NOT RENAME ANY DECLARATION NAME BELOW inside here. The name itself
//   is synced with the original file's /*StubNameComments*/ and all unmatched 
//   declarations will be moved to the archive section. The console will warn 
//   you if anything has been archived.
// ---------------------------------------------------------------------;`;
		public header_archiveDeclarations: string = `// ====================================================================='
//                     Archive Stub Declarations
// =====================================================================
// - The code below is archived.
// - Use the --cleanStubTrash to remove all archive code from your stub
//   files.
// ---------------------------------------------------------------------`;

		createTimestamp() {
			return `---------------------- ${new Date().toISOString()} ----------------------`;
		}

		createArchiveStr(archiveStr, newArchiveContent) {
			// Remove /* from left side and */ from right side
			archiveStr = archiveStr.trim();
			archiveStr = archiveStr.slice(2);
			archiveStr = archiveStr.slice(0, -2);

			if (newArchiveContent) {
				newArchiveContent = this.createTimestamp() + '\n' + newArchiveContent.trim();
				archiveStr = newArchiveContent + '\n' + archiveStr;
			}

			// Declarations already have a '\n' added after
			this.archiveDeclarations = archiveStr ? '/*\n' + archiveStr.trim() + '\n*/' : '';
		}

		clearArchiveStr() {
			this.archiveDeclarations = '';
		}

		extraCode: string = '';
		syncImports: string = '';
		syncDeclarations: string = '';
		archiveImports: string = '';
		archiveDeclarations: string = '';

		functionDefaultImplementation(outerTabSpace?): string {
			outerTabSpace = outerTabSpace ? outerTabSpace : '';
			let innterTabSpace = outerTabSpace ? outerTabSpace+outerTabSpace : '	';
			return `{\n${innterTabSpace}return undefined;\n${outerTabSpace}}`;
		}
		variableDefaultImplementation: string = 'undefined';

		addHeaderIfContentExist(header, str) {
			const trim = str.trim();
			return trim ? (header + '\n' + trim + '\n') : '';
		}
	
		get fullTemplate() {
			let template = '';
			template += this.header_syncImports + '\n' + this.syncImports;
			// extra code header is always present
			template += this.header_extraCode;
			template += this.extraCode.trim() ? ('\n' + this.extraCode.trim() + '\n\n') : '\n\n';
			template += this.header_syncStubDeclarations + '\n' + this.syncDeclarations + '\n';
			template += this.addHeaderIfContentExist(this.header_archiveDeclarations, this.archiveDeclarations);
			template = template.trim() + '\n'; // angular-tslinte defaults to ending with newline..	
			return template;
		}
	}