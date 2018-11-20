# Autostub

## About / Purpose

It is a package designed to help out with **unit testing**. Instead of manually creating stub code for your unit test, this package automatically *creates* or *updates* stub files throughout the specified in/source folder. Each stub file will act as a mirror of the original file's "api-code" (e.g. variable declarations and class methods names are copied over). It is up to you to add return values to the stub file, and each time something is changed in the original file, (e.g. a class method name) the changes will be synced over to your stub file.

## Usage: 

**Recommendation:** It is recommended to backup your project *before* using autostub. This is a new package and although it creates a backup by default, an extra backup is nice to have in the sad event of a bug. 


#### 1. Install via npm:

```
npm install autostub -g
```

#### 2. Initialize autostub in a project folder (at project root)

```
cd path/to/my/project
autostub init
```

This will create a autostub.json file. (See [bottom](#autostub-json) for json details).

```json
{
  "sourceDirectory": "./src",
  "matchFilesRegex": ".ts$|.js$",
  "ignoreFilesRegex": "(^\\.)|(\\.spec\\.)|(\\.d\\.)|(\\.animations\\.)|(\\.module\\.)|(\\.expect\\.)|(\\.stub\\.)",
  "stubPrefix": "stub",
  "backupForSafety": {
    "backupFolderName": "autostub",
    "firstBackupBeforeAutostub": true,
    "latestBackup": true
  }
}
```

#### 3. Run Autostub

Run command at the same directory level of the autostub.json

```
autostub
```

Afterwards (with json settings above):

#### New Stub Files

###### Original File
Comments are added to keep stub file variable names in sync when changes are done to the original. 

**/src/app/app.component.ts**

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app'; /*title*/
  getTitle() {
    return this.title;
  } /*getTitle*/
} /*AppComponentStub*/
```

**Important Notes:** 

- Comments **MUST** be directly after the declaration name or method. If a /\*comment\*/ is deleted, autostub will be unable to match your declaration to a stub declaration name and will archive all unmatched stub declaration to the stub file's archive comment section. (stub archive section will continue to be explained below..)
- For declaring multiple variables in one let,var, or const declaration, the stub-comments must be **before** the comma

```
var pizza /*pizzaStub*/, 
soup /*soupStub*/;
```


###### Stub Mirror File
The stub file will be generated in the same path level as the original file.
It is broken into 4 parts:

- **Sync Imports** - A copy of imports used in the original file
- **Extra Code** - A place to write extra code in the stub file.
- **Sync Stub Declarations** - The mirror copy of the original file's declarations. All declarations return "undefined" as a default value.
- **Archive Stub Declarations** - An area that contains archived code of "sync stub declarations". As mentioned above, autostub will archive any stub file's code if it's declaration name cannot be matched with the comment names in the original file. (The intent is to safekeep existing return implementations on the stub file.)


**/src/app/app.component.stub.ts**

```typescript
// =====================================================================;
//                            Sync Imports                              
// =====================================================================
import { Component } from '@angular/core';
// =====================================================================
//                            Extra Code
// =====================================================================
// - Write Extra File Code Here (e.g. Import { fakeJsonToReturn } from './someplace' )
// ---------------------------------------------------------------------

// =====================================================================
//                      Sync Stub Declarations
// =====================================================================
// - Feel free to define values for any synced declaration logic. 
// - DO NOT RENAME ANY DECLARATION NAME BELOW inside here. The name itself
//   is synced with the original file's /*StubNameComments*/ and all unmatched 
//   declarations will be moved to the archive section. The console will warn 
//   you if anything has been archived.
// ---------------------------------------------------------------------;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponentStub {

  title = undefined;
  getTitle() {
    return undefined;
  }

};

```

**Important Node:** Comments in the stub file **MUST NOT** be touched!. Autostub's parsing is simple and uses these comments to separate the file's string of code to their own respective sections, each are parsed differently throughout the process.

#### Updating Stub Files

###### Stub File Update

Feel free to add any return implementation after the "=" sign of a declaration/class-property or within functions and class-methods with the return statement.

```typescript
export class AppComponentStub {

  title = 'myStubApp';
  getTitle() {
    const titleToReturn = 'myStubApp';
    return titleToReturn;
  }

};
```

###### Original File Update and Running Autostub
If a change is made, to the original file, such as..

- deleting a property..
- or changing the method name..

**/src/app/app.component.ts**

```typescript
export class AppComponent {
  // title property deleted!
  
  // method name changed!
  getTitleFromHttp() {
    return new Promise((resolve, reject) => {
        this.http.get(url).toPromise()
        .then(data => resolve(data))
        .catch(error => reject(error));
      }
    );
  } /*getTitle*/
} /*AppComponentStub*/
```

Running autostub will update the stub file and keep the stub class in sync.

```
autostub
...
Done!
```

Once completed you can expect the following changes:

- The "title" property will be sent to "Archive Stub Declarations" at the bottom of the stub file.
- The "getTitle" method name will be updated to "getTitleFromHttp"

```typescript
// ... top part of stub file omitted ...

export class AppComponentStub {

  getTitleFromHttp() {
    const titleToReturn = 'myStubApp';
    return titleToReturn;
  }

};

// ====================================================================='
//                     Archive Stub Declarations
// =====================================================================
// - The code below is archived.
// - Use the --cleanStubTrash to remove all archive code from your stub
//   files.
// ---------------------------------------------------------------------
/*
---------------------- 2018-11-18T13:15:41.332Z ----------------------
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponentStub {

  title = 'myStubApp';
};
*/
```

#### Clear Archive Comments
You may use the `-c` or `--cleanStubTrash` to remove all archive stub comments in your stub files.

```
autostub -c
```

**Important Note**: Running this process will also cause stub files to be updated and synced with the latest original changes. Keep in mind that this may cause the **newest/latest archived stub code (if any) to be cleaned accidentally**. Make sure you expect no changes (e.g. newly added archive code) to occure when considering to use `--cleanStubTrash`.


### Autostub JSON
Required if Option name has asterisk (*).

Option name       | Type     | Description     |
------------------|----------|-----------------------|
sourceDirectory*  | string   | A Path to a directory folder to autostub.
matchFilesRegex*  | string   | A regex string to match files, (keep in mind to **double escape** backslashes since it is still in string form).   |
ignoreFilesRegex* | string   | A regex string to ignore files.       |
stubPrefix*       | string \| boolean  | A prefix that gets added to all declarations in the generated stub file. It will automatically be capitalized. (e.g. 'stub' -> AppComponent**Stub**) Set to false if you do not want a stub prefix added.   |
backupForSafety   | Object   | Optional setting that allows you to backup the project once before running autostub and also retains the very last autostub backup. Backups are allowed by default.   |
backupForSafety.backupFolderName   | string   | A path with the backup folder name (technical: resolved using process.cwd()) |
backupForSafety.firstBackupBeforeAutostub   | boolean   | If set to true, creates a backup with the "firstBackupBeforeAutostub" if the folder does not exist. |
backupForSafety.latestBackup   | boolean   | If set to true, replaces the "latestBackup" folder with the latest in/source-dir-backup  |

**Important Note:** Backups are verified using just the folder paths if they exist or not. Changing the in/source folder while a "firstBackupBeforeAutostub" folder already exist will not result in an extra backup for the new in/source folder specified. This is just a lightweight precaution because I like being extra careful since this is a new package. As recommended above, please backup your project once before tying out Autostub. : )


### Optional Usage: 
It is also possible to just use Autostub out on the fly by specifying an in/source folder with the `-i` flag.

```
autostub -i /path/to/my/folder
```

The default autostub.json from `autostub init` will be the settings used on the in/source folder specified. It is recommended though to be inside the project root directory so that the  default [backupForSafety](#autostub-json) files will be created there. 

If an autostub.json does exist and the `-i` flag is used, the found autostub.json settings will instead be used as the default (with the new specified `-i` folder temporarily replacing the "sourceDirectory" throughout the process run).


### Example Usage with Angular:

It is advised to just mirror the modules around the project and register all the stub files like below. (Currently Autostub does not yet support creating stub modules for Angular)

**app.module.unit.ts**

```typescript
export const TEST_APP_WIDE_PROVIDERS: Provider[] = [
    // Pretend AppComponent uses MyHttpService through Dependency Injection
    { provide: MyHttpService, useClass: MyHttpServiceStub },
]

// We can just concat the real AppComponent to Stub Declarations Array later in spec file
export const TEST_APP_MODULE: any = {
    declarations: [
        AppComponentStub,
    ]
};

// Create StubModule
@NgModule(TEST_APP_MODULE)
export class AppUnitTestModule {}
```

This way you can just use a stub version of the angular app and replace one component or service at a time for unit testing.

**app.component.spec.ts**

```typescript
// Add in the real AppComponent and test it.. 
describe('AppComponent - Unit Testing', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule(Object.assign(TEST_APP_MODULE, {
            providers: TEST_APP_WIDE_PROVIDERS,
            declaration: TEST_APP_MODULE.declarations.concat(AppComponent)
        })).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement;
    el = de.nativeElement;
    injector = fixture.debugElement.injector;
  }));

  describe('AppComponent Class', () => {
    it('should create the app', async(() => {
      expect(comp).toBeTruthy();
    }));
  });
});
```

[Working demo](https://github.com/Jonathan002/autostub-angular) of autostub being used with angular.

**Important Note:**
Add  `"**/*.stub.ts"` and `"**/*.unit.ts"` to your Angular project's tsconfig.app.json so that stub files and unit-test modules are ignored when running `ng build --prod`.

```json
  "exclude": [
    "src/test.ts",
    "**/*.spec.ts",
    "**/*.stub.ts"
    "**/*.unit.ts"
  ]
```


### Other Notes:
- There is no support yet for React's jsx or Vue.js as the files are simply parsed through eslint. It will throw an error if you attempt to have eslint parse those files.
- I'm hoping to get feedback on what you guys think about this project. If you have any suggestions, feel free to post them on the github repo and let me know if this package was helpful. If so, will continue to maintain it and add more support.

---

### Support Autostub

If you appreciate this package and feel like being extra kind, you can donate on [Buy Me A Coffee](https://www.buymeacoffee.com/jonathandev). The support helps me maintain projects like this.

---

### Contact
Email: developer@jonathan.work

---


## License (MIT)

Copyright 2018 Jonathan Woolbright Fernandez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 

