import { Program, Statement, BaseDeclaration } from 'estree';
import { Declaration } from 'typescript';
export interface CtorParameters {
    name: string,
    type: string,
    start: number,
    end: number
}

export interface ConstructorDeclaration {
    name: string,
    start: number,
    end: number,
    parameters: CtorParameters[]
}

export interface StubSyncObj {
    stubName: string;
    originalName: string;
}

export interface ClassItem {
    name: string;
    
    /* Visibility (from pacakge)
        private - visibility 0
        protected - visibility 1
        public (declared) - visibility 2
        public (not declared)- no visibility prop
        readonly - no visibility prop : (
    */
    visibility: number;
    publicModifyerOmitted: boolean;

    isOptional: boolean;
    isStatic: boolean;
    start: number;
    startWithoutStubMeta: number;
    end: number;
    classItemType: string;
    declaredInConstructor?: boolean;
    stubImplementation: string;
    // if_accessor
    accessorValue?: string;
    setterParam?: string;
    setterParamTyping?: string;
}


// class - has properties
// function - has parameters
// variable (var, let, const - even arrow functions can be here (but does not display paramerters)) - has isConst
export interface AutoStubDeclration extends BaseDeclaration {
    stubImplementation: string;
    stubName: string;
    [x: string]: any;
}

export interface FileStubSyncMeta {
    filePrefix: string;
    fileExtension: string;
    rootPath: string;
    anotherProp: any;

    stubFileIsNew: boolean;

    originalPath: string;
    stubPath: string;
    originalContentStr: string;
    originalContentStrAfterUpdate: string;

    stubContentStr: string;
    stubContentStrAfterUpdate: string;

    stubSyncDeclarationsStr: string;

    originalParsed: Program | any;
    stubSyncDeclarationsParsed: Program | any;
    stubExtraCodeStr: string;
    stubArchiveCodeStr: string;

    stubArchiveDeclarations: any[];

    imports: any[];
    declarations: AutoStubDeclration[];
    stubDeclarations: AutoStubDeclration[];

    // stubSyncImports: any[];
    // stubSyncExports: any[];
    // stubSyncDeclarations?: Declaration[];
    // stubSyncUsages: any[];
    // stubSyncResources: any[];
    // stubSyncContentStr: string;

    // stubExtraImports: any[];
    // stubExtraExports: any[];
    // stubExtraDeclarations: Declaration[];
    // stubExtraUsages: any[];
    // stubExtraResources: any[];
    // stubExtraContentStr: string;

    // stubArchiveImports: any[];
    // stubArchiveExports: any[];
    // stubArchiveDeclarations: Declaration[];
    // stubArchiveUsages: any[];
    // stubArchiveResources: any[];
    // stubArchiveContentStr: string;
}
