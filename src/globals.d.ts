// import { Program } from "estree";

// importing something breaks the globalness of globals.d.ts
// import { ScriptKind } from "../node_modules/typescript";

declare module 'typescript-eslint-parser' {
    export function parseForESLint(code: string, options?: any): { ast: any  };
    export function parse(code: string, options?: any): any;
    export var Syntax: object;
}

// allows json imports..
declare module "*.json" {
    const value: any;
    export default value;
}