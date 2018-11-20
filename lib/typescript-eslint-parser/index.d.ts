import { Program } from "typescript";

declare module 'typescript-eslint-parser' {
    export function parseForESLint(code: string, options?: any): { ast: Program | any  };
    export function parse(code: string, options?: any): Program | any;
    export var Syntax: object;
}