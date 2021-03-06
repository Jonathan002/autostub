import 'fs';
import * as Events from 'events';
import { APP_CONFIG } from '../../app-model/app-config';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';

interface TypicalObj {
  properties: boolean
} /*TypicalObj*/

var 
varDos = 12 /*varDosStub*/
, varTres = 14; /*varTresStub*/
export let number = 12; /*numberStub*/
export const addNumberButOutside = (withParam,withOptionalParam?):boolean => {
  let five = 5;
  return true;
}; /*addNumberButOutsideStub*/

// Typing and args updated
export const updateArrowFunArgs = (one: number, two?: number):any => {
  let five = 5;
  return {};
}; /*updateArrowFunArgsStub*/

export function hmm(thing: string, bur: number): number {
  return 
} /*hmmStub*/
export       function      test  (args: number, space: string) {
  return 'functionfunctionfunction';
}; /*testStub*/

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {  

  // Static
  @complicatedDecorator(' css classes passed in with space ')
  public        static       extraSpaces        =true; /*extraSpaces*/
  static classInfo() {
    console.log('This class helps manage the page-not found view');
  } /*classInfo*/
  protected static abc = 13; /*abc*/
  private static abcdefg = 13; /*abcdefg*/
  private static set lostUrl(thing) {
    if (thing) {
      console.log('etc');
    }
  } /*lostUrl*/
  private static get test(): string {
    return 'the getdocumentation() getter ....'
  } /*test*/
  arrowFuncWithStubImplementation = (value: string, ...args) => {
    return { implemented: true, realImplementation: true };
  } /*arrowFuncWithStubImplementation*/

  arrowFuncPropWithArgumentsUpdating = (one: number, two: number): number => {
    return one + two;
  } /*arrowFuncPropWithArgumentsUpdating*/
  arrowFuncWithoutBody = () => 42; /*arrowFuncWithoutBody*/

  // Instance
  public testPublic = 'test public'; /*testPublic*/
  @public('publicHmm')
  public publicHmm: publicHmm = { hmm: 12 }; /*publicHmm*/
  readonly readOnlyProperty = 42; /*readOnlyProperty*/
  private hmmm: string = 'why...'; /*hmmm*/

  constructor(
    nakedDependency: Router,
    @Inject(APP_CONFIG) 
    public appConfig: AppConfig,
    private router: Router
  ) {
    const varOne = 12;
    const addNumber = () => {
      return varOne + 44;
    };
    addNumber();
  } /*constructor*/
  
  // This should be stub Commented
  public leFourOFour(statusCode?: number): string {
    console.log('welcome to 404');
    return 'welcome to 404';
  } /*leFourOFour*/
  get bur(): number {
    return 5;
  } /*bur*/
  private methodTwo() {
    console.log('welcome to 404 private');
  } /*methodTwo*/

  // Type and arguments should update the stub implementation..
  argumentsShouldUpdate(one: number, two: number) {
    return one + two;
  } /*argumentsShouldUpdate*/
} /*PageNotFoundComponentStub*/