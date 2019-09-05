"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StubTemplate = /** @class */ (function () {
    function StubTemplate() {
        // Note: Keep to each end to prevent space on output... 
        this.header_syncImports = "// =====================================================================;\n//                            Sync Imports                              \n// =====================================================================";
        this.header_extraCode = "// =====================================================================\n//                            Extra Code\n// =====================================================================\n// - Write Extra File Code Here (e.g. Import { fakeJsonToReturn } from './someplace' )\n// ---------------------------------------------------------------------";
        this.header_syncStubDeclarations = "// =====================================================================\n//                      Sync Stub Declarations\n// =====================================================================\n// - Feel free to define values for any synced declaration logic. \n// - DO NOT RENAME ANY DECLARATION NAME BELOW inside here. The name itself\n//   is synced with the original file's /*StubNameComments*/ and all unmatched \n//   declarations will be moved to the archive section. The console will warn \n//   you if anything has been archived.\n// ---------------------------------------------------------------------;";
        this.header_archiveDeclarations = "// ====================================================================='\n//                     Archive Stub Declarations\n// =====================================================================\n// - The code below is archived.\n// - Use the --cleanStubTrash to remove all archive code from your stub\n//   files.\n// ---------------------------------------------------------------------";
        this.extraCode = '';
        this.syncImports = '';
        this.syncDeclarations = '';
        this.archiveImports = '';
        this.archiveDeclarations = '';
        this.variableDefaultImplementation = 'undefined';
    }
    StubTemplate.prototype.createTimestamp = function () {
        return "---------------------- " + new Date().toISOString() + " ----------------------";
    };
    StubTemplate.prototype.createArchiveStr = function (archiveStr, newArchiveContent) {
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
    };
    StubTemplate.prototype.clearArchiveStr = function () {
        this.archiveDeclarations = '';
    };
    StubTemplate.prototype.functionDefaultImplementation = function (outerTabSpace) {
        outerTabSpace = outerTabSpace ? outerTabSpace : '';
        var innterTabSpace = outerTabSpace ? outerTabSpace + outerTabSpace : '	';
        return "{\n" + innterTabSpace + "return undefined;\n" + outerTabSpace + "}";
    };
    StubTemplate.prototype.addHeaderIfContentExist = function (header, str) {
        var trim = str.trim();
        return trim ? (header + '\n' + trim + '\n') : '';
    };
    Object.defineProperty(StubTemplate.prototype, "fullTemplate", {
        get: function () {
            var template = '';
            template += this.header_syncImports + '\n' + this.syncImports;
            // extra code header is always present
            template += this.header_extraCode;
            template += this.extraCode.trim() ? ('\n' + this.extraCode.trim() + '\n\n') : '\n\n';
            template += this.header_syncStubDeclarations + '\n' + this.syncDeclarations + '\n';
            template += this.addHeaderIfContentExist(this.header_archiveDeclarations, this.archiveDeclarations);
            template = template.trim() + '\n'; // angular-tslinte defaults to ending with newline..	
            return template;
        },
        enumerable: true,
        configurable: true
    });
    return StubTemplate;
}());
exports.StubTemplate = StubTemplate;
