/* Utility */
/* =============================
    type()
============================= */
export const type = (function(global) {
    // An iffy to catch the global object (window / global)
    var cache = {};
    return function(obj) { // This function is what takes in the argument -> type(argument)
        var key;
        return obj === null ? 'null' // null
            : obj === global ? 'global' // window in browser or global in nodejs
            : (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
            : obj.nodeType ? 'object' // DOM element
            // the first statement assigns key var something that is [object something] - object lookup is undefined so the || will pass
            : cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
            // Then this will use the newly assiged key var and slice it, and add that value to the {}. It will then be returned as the function value
            || (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
    };
}(this));

/* =============================
    replaceAt()
============================= */
export const replaceAt = function(str, index, replacement) {
    return str.substr(0, index) + replacement+ str.substr(index + replacement.length);
}

/* =============================
    objectDepth()
============================= */

export const objectDepth = function(object){
  let _, value, this$ = this;
  switch (false) {
  case typeof object === 'object':
    return 0;
  }
  return (function(it){
    return it + 1;
  })(
  function(it){
    return Math.max.apply(Math, [0].concat([].slice.call(it)));
  }(
  function(it){
    return it.map(objectDepth);
  }(
  (function(){
    let ref$, own$ = {}.hasOwnProperty, results$ = [];
    for (_ in ref$ = object) if (own$.call(ref$, _)) {
      value = ref$[_];
      results$.push(value);
    }
    return results$;
  }()))));
};

/* =============================
    strInsert()
============================= */

export function strInsert(string, index, stringToAdd) {
  if (index > 0)
    return string.substring(0, index) + stringToAdd + string.substring(index, string.length);
  else
    return stringToAdd + string;
};

/* =============================
    objLength()
============================= */

export function objLength(obj) {
    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            size++;
        }
    }
    return size;
}

/* =============================
    promiseTimeout()
============================= */
/* Taken from https://italonascimento.github.io/applying-a-timeout-to-your-promises/ */
export const promiseTimeout = function(ms, promise){
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
        clearTimeout(id);
        // console.log("timeout finished at " + ms + "ms but promise won't reject");
        reject('Timed out in '+ ms + 'ms. - Reject Message')
        }, ms)
    })

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ])
}

/* =============================
    flatten()
============================= */
export const flatten = arr => arr.reduce(
  (acc, val) => acc.concat(
    Array.isArray(val) ? flatten(val) : val
  ),
  []
);


export const isValidJson = (json) => {
    json = JSON.stringify(json);
    try {
        JSON.parse(json);
        return true;
    } catch (e) {
        return false;
    }
}

/* =============================
    makeid()
============================= */

export function makeid(strLength) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < strLength; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/* =============================
    SubscribedIterator class
============================= */

export class SubscribedIterator {
    array
    constructor(array) {
        this.array = array;
    }
    private indexState = 0;

    next() {
        return this.indexState < this.array.length ?
                {value: this.array[this.indexState++], start: false, done: false} :
                    {done: true};
    }
    back() {
        return this.indexState != 0 ? {value: this.array[--this.indexState], start: false, done: false} : {start: true};
    }

    length() {
        return this.array.length;
    }
    nextIndex() {
        return this.indexState < this.array.length ? this.indexState : {done: true};
    }
    nextValue() {
        return this.indexState < this.array.length ? this.array[this.indexState] : {done: true};
    }
    reset() {
        this.indexState = 0;
    }
    start() {
        return this.indexState === 0 ? true : false;
    }
    done() {
        return this.indexState < this.array.length ? false : true;
    }
}

/* =============================
    newInstance()
    keyword: deepCopy
============================= */

export function newInstance(objectpassed) { /*  */
    if (objectpassed === null || typeof objectpassed !== 'object') {
        return objectpassed;
    }
    // give temporary-storage the original obj's constructor
    var temporary_storage = objectpassed.constructor(); 
    for (let key in objectpassed) {
        temporary_storage[key] = newInstance(objectpassed[key]);
    }
    return temporary_storage;
}

/* =============================
    Diff()
    - uses type()
============================= */

function objLoopReseter(c, d) { // deleteObjA, deleteObjB, deleteAll, false
    if (objLength(c) != 0 && objLength(d) != 0) {
        for (var pc in c) {
            for (var pd in d) {
                if (type(c[pc]) != 'array' && type(c[pc]) != 'object' && type(d[pd]) != 'array' && type(d[pd]) != 'object') {
                    if (pc === pd && c[pc] === d[pd]) {
                        delete c[pc];
                        delete d[pd];
                        var deleteStuff: any = objLoopReseter(c, d);
                        if (deleteStuff[2] != false) {
                            return deleteStuff;
                        }
                    }                
                } else { 
                    if (pc === pd) {
                        var deleteStuff: any = dig(c[pc], d[pd]);
                        switch (deleteStuff[2]) {
                            case 'removeAll':
                                delete c[pc];
                                delete d[pd];
                                var deleteStuff: any = objLoopReseter(c, d);
                                if (deleteStuff[2] != false) {
                                    return deleteStuff;
                                }
                                break;
                            case 'removeC':
                                delete c[pc];
                                var deleteStuff: any = objLoopReseter(c, d);
                                if (deleteStuff[2] != false) {
                                    return deleteStuff;
                                }
                                break;
                            case 'removeD':
                                delete d[pd];
                                var deleteStuff: any = objLoopReseter(c, d);
                                if (deleteStuff[2] != false) {
                                    return deleteStuff;
                                }
                                break;
                            default:
                                break;
                        }


                    }
                }
            }
        }
    } else if (objLength(c) === 0 && objLength(d) === 0) {
        return [c, d, 'removeAll']
    } else if (objLength(c) === 0) {
        return [c, d, 'removeC']
    } else if (objLength(d) === 0) {
        return [c, d, 'removeD']
    }

    
    return [c, d, false]
}


function dig(c, d) { //overwrite a & b?
    if (type(c) === type(d) && type(c) === 'array') {
        for (var ic = 0; ic < c.length; ic++) {
            for (var id = 0; id < d.length; id++) {
                if (type(c[ic]) != 'array' && type(c[ic]) != 'object' && type(d[id]) != 'array' && type(d[id]) != 'object') {
                    if (c[ic] === d[id]) {
                        c.splice(ic, 1);
                        d.splice(id, 1);
                        ic = -1;
                        id = -1;
                    }                    
                } else {         
                    var deleteStuff: any = dig(c[ic], d[id]);
                    switch (deleteStuff[2]) {
                        case 'removeAll':
                            c.splice(ic, 1);
                            d.splice(id, 1);
                            ic = -1;
                            id = -1;
                            break;
                        case 'removeC':
                            c.splice(ic, 1);
                            ic = -1;
                            id = -1;
                            break;
                        case 'removeD':
                            d.splice(id, 1);
                            ic = -1;
                            id = -1;
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        if (c.length === 0 && d.length === 0) {
            return [c, d, 'removeAll'];
        } else if (c.length === 0) {
            return [c, d, 'removeC'];
        } else if (d.length === 0) {
            return [c, d, 'removeD'];
        }
    } else if (type(c) === type(d) && type(c) === 'object') {
        var deleteStuff: any = objLoopReseter(c, d);
        switch (deleteStuff[2]) {
            case 'removeAll':
                return [c, d, 'removeAll'];
            case 'removeC':
                return [c, d, 'removeC'];
            case 'removeD':
                return [c, d, 'removeD'];
            default:
                break;
        }
    }
    
    return [c, d, false]
}

// Note: Not guaranteed to always retain the original object structure (especially for really simliar objects) but will return difference of all single values.
export function diff(a, b) {
    let c = newInstance(a);
    let d = newInstance(b);
    let result = dig(c, d);
    switch (result[2]) {
        case 'removeAll':
            return [-1, -1, 'equal'];
        case 'removeC':
            return [-1, result[1], 'diffB'];
        case 'removeD':
            return [result[0], -1, 'diffA'];
        default:
            return [result[0], result[1], 'diffAll'];
    }
}

/* =============================
    searchJson() - by value
    - uses type()
============================= */

function searchDig(jsonObj, valueToFind, stringPath, pathArr) {
    if (type(jsonObj) === 'array') {
        if (jsonObj.length != 0) {
            for (let i in jsonObj) {
                if (typeof jsonObj[i] != 'object') {
                    if (jsonObj[i] === valueToFind) {
                        stringPath += '[' + i + ']';
                        pathArr.push(stringPath);
                        let lengthToSlice = (i.toString().length + 2)
                        stringPath = stringPath.slice(0, -lengthToSlice);
                    }
                } else {
                    stringPath += '[' + i + ']';
                    searchDig(jsonObj[i], valueToFind, stringPath, pathArr);
                    stringPath = stringPath.slice(0, -3);
                }
            }
        }
    } else if (type(jsonObj) === 'object') {
        for (let key in jsonObj) {
            if (typeof jsonObj[key] != 'object') {
                if (jsonObj[key] === valueToFind) {
                    stringPath += '[' + key + ']';
                    pathArr.push(stringPath);
                    let lengthToSlice = (key.length + 2);
                    stringPath = stringPath.slice(0, -lengthToSlice);
                }
            } else {
                stringPath += '[' + key + ']';
                searchDig(jsonObj[key], valueToFind, stringPath, pathArr);
                let lengthToSlice = (key.length + 2);
                stringPath = stringPath.slice(0, -lengthToSlice);
            }
        }
    }
}


function stringReplaceValue(jsonObj, valueToFind) {
    let jsonString = JSON.stringify(jsonObj);
    let valueToFindString = JSON.stringify(valueToFind);
    let regExpValueToFind;
    let bookmark: string;

    //Getting rid of single quotes
    jsonString = jsonString.replace(/'/g, '\\"');
    valueToFindString = valueToFindString.replace(/'/g, '\\"');

    // Might replace with $& (see RegExp.escape pending) later but waiting for standard/self-testing - focusing on reliability rather than speed for now...
    valueToFindString = valueToFindString.replace(/\\/g, '\\\\'); //needs to be at top of the list.
    valueToFindString = valueToFindString.replace(/\-/g, '\\-');
    valueToFindString = valueToFindString.replace(/\{/g, '\\{');
    valueToFindString = valueToFindString.replace(/\[/g, '\\[');
    valueToFindString = valueToFindString.replace(/\^/g, '\\^');
    valueToFindString = valueToFindString.replace(/\$/g, '\\$');
    valueToFindString = valueToFindString.replace(/\./g, '\\.');
    valueToFindString = valueToFindString.replace(/\|/g, '\\|');
    valueToFindString = valueToFindString.replace(/\?/g, '\\?');
    valueToFindString = valueToFindString.replace(/\*/g, '\\*');
    valueToFindString = valueToFindString.replace(/\+/g, '\\+');
    valueToFindString = valueToFindString.replace(/\(/g, '\\(');
    valueToFindString = valueToFindString.replace(/\)/g, '\\)');
    valueToFindString = valueToFindString.replace(/\//g, '\\/');
    
    regExpValueToFind = new RegExp(valueToFindString);

    
    bookmark = '"RhZzgqAtcqt7DPjVjwdLfZAxRhZzgqAtcqt7DPjVjwdLfZAxyjvkQfcaAJzUDTM9LGsvdDwRRhZzgqAtcqt7DPjVjwdLfZAxRhZzgqAtcqt7DPjVjwdLfZAxyjvkQfcaAJzUDTM9LGsvdDwR"';
    if (jsonString.search(bookmark) === -1) {
        jsonString = jsonString.replace(regExpValueToFind, bookmark);
    } else {
        let uniqueStrLength = 144;
        let uniqueStr = '"' + makeid(uniqueStrLength) + '"';
        let attempts = 0;
        while(jsonString.search(uniqueStr) != -1 || attempts != 10) {
            uniqueStrLength + 144;
            uniqueStr = '"' + makeid(uniqueStrLength) + '"';
            attempts++;
        }
        if (jsonString.search(uniqueStr) === -1) {
            jsonString = jsonString.replace(regExpValueToFind, uniqueStr);
            bookmark = uniqueStr;
        } else {
            console.log('Attempt to find value failed - could not create unique str');
            return false;
        }
    }

    return [JSON.parse(jsonString), bookmark];
}

export function searchJson(jsonObj, valueToFind) {
    let stringPath: string = '';
    let pathArr: string[] = [];
    
    if (typeof valueToFind === 'object') {
        let strSearchResults = stringReplaceValue(jsonObj, valueToFind);
        if (strSearchResults === false) return 'failed';
        
        jsonObj = strSearchResults[0];
        valueToFind = strSearchResults[1].slice(1).slice(0, -1); //slice removes ""
    }
    
    searchDig(jsonObj, valueToFind, stringPath, pathArr);
    if (pathArr.length != 0) {
        return pathArr;
    } else {
        return false;
    }
}


/* =============================
    searchJsonPath()
    - uses type()
    - uses diff()
    - uses newInstance()
    - uses SubscribedIterator class
============================= */

function parseKnownPath(knownPath) {
    let pathTypelist = ['string','number','boolean','array','object','undefined','null'] // might add array/object so generation of path done by type is easier
    let lengthToSlice;
    let specifiedType;
    let knownPathArr;

    if (type(knownPath) != 'array' && type(knownPath) != 'string') {
        return 'failed';
    } else if (type(knownPath) === 'string') {
        // Check if knownPath has type at end of string
        knownPath = knownPath.replace(/[\"\']/g, "'");

        if (knownPath.substring(knownPath.length - 1) === ']' && knownPath.substring(knownPath.length - 2) != "']" && knownPath.substring(knownPath.length - 2) != "[]") {
            let split = knownPath.split('[');
            let pop = split.pop();
            if (pop.substring(0, 1) === ']') {
                specifiedType = '[' + split.pop() + '[' + pop;
            } else {
                specifiedType = '[' + pop;
            }
            
            lengthToSlice = specifiedType.length;
            specifiedType = specifiedType.replace(/\s/g,'');
            specifiedType = specifiedType.slice(1,-1);
            specifiedType = specifiedType.replace(/\[]/g, 'array');
            specifiedType = specifiedType.replace(/\{}/g, 'object');
            specifiedType = specifiedType.split(',');

            //Verify type as array
            let typeDiff = diff(specifiedType, pathTypelist)
            if (typeDiff[0] != -1) {
                return 'failed'
            }


            knownPath = knownPath.slice(0, -lengthToSlice)
            if (knownPath.substring(knownPath.length - 1) === '!') {
                specifiedType = typeDiff[1];
                knownPath = knownPath.slice(0, -1);
            }
        } else if (knownPath.substring(knownPath.length - 'number'.length) === 'number') {
            specifiedType = ['number'];
            knownPath = knownPath.slice(0, -'number'.length);
        } else if (knownPath.substring(knownPath.length - 'string'.length) === 'string') {
            specifiedType = ['string'];
            knownPath = knownPath.slice(0, -'string'.length);
        } else if (knownPath.substring(knownPath.length - 'boolean'.length) === 'boolean') {
            specifiedType = ['boolean'];
            knownPath = knownPath.slice(0, -'boolean'.length);
        } else if (knownPath.substring(knownPath.length - 'array'.length) === 'array') {
            specifiedType = ['array'];
            knownPath = knownPath.slice(0, -'array'.length);
        } else if (knownPath.substring(knownPath.length - 'object'.length) === 'object') {
            specifiedType = ['object'];
            knownPath = knownPath.slice(0, -'object'.length);
        } else if (knownPath.substring(knownPath.length - 'undefined'.length) === 'undefined') {
            specifiedType = ['undefined'];
            knownPath = knownPath.slice(0, -'undefined'.length);
        } else if (knownPath.substring(knownPath.length - 'null'.length) === 'null') {
            specifiedType = ['null'];
            knownPath = knownPath.slice(0, -'null'.length);
        } else if (knownPath.substring(knownPath.length - '[]'.length) === '[]') {
            specifiedType = ['array'];
            knownPath = knownPath.slice(0, -'[]'.length);
        } else if (knownPath.substring(knownPath.length - '{}'.length) === '{}') {
            specifiedType = ['object'];
            knownPath = knownPath.slice(0, -'{}'.length);
        } else if (knownPath.substring(knownPath.length - '*'.length) === '*') {
            specifiedType = true;
            knownPath = knownPath.slice(0, -'*'.length);
        }

        // Parsing knownPath - type is already sliced out
        knownPath = knownPath.replace(/\*/g, '@*'); //pending on $&
        // console.log(knownPath);
        knownPathArr = knownPath.split(/[\[\{@]/g);
        knownPathArr.shift();
        // console.log(knownPathArr);
        knownPathArr = knownPathArr.map(x => {
            if (x === '}') {
                return x = '{' + x;
            } else if (x.substring(0, 1) === ']' 
            || x.substring(0, 1) === "'") {
                return x = '[' + x;
            } else {
                return x;
            }
        });
    } else { // knownPath is passed as array
        knownPathArr = knownPath;
        let typeTest = knownPathArr[knownPathArr.length - 1];
        if (type(typeTest) === 'array') {
            specifiedType = knownPathArr.pop();
            if (diff(specifiedType, pathTypelist)[0] != -1) {
                return 'failed'
            }
        } else if (typeTest === true) {
            specifiedType = knownPathArr.pop();
        }

        try {
            knownPathArr = knownPathArr.map(x => x.replace(/[\"\']/g, "'"));
        } catch (e) {
            return 'failed'
        }
        // In order to preserve the original knownPath array if ever the user will use it for something else (to help him/her catch bugs).
        // knownPathArr does not point to knownPath anymore since a map() return was assigned to it.
        knownPath.push(specifiedType)
    }

    // Verify knownPathArr
    for (let item of knownPathArr) {
        if (item === '{}'
            || item === '[]'
            || item === '*'
            || item.substring(0, 2) === '[]' && isNaN(Number(item.substring(2))) === false
            || item.substring(0, 2) === "['" && item.substring(item.length - 2) === "']"
        ) {
        } else {
            return 'failed'
        }
    }

    if (specifiedType != undefined) { //specifiedType can either be [] or true
        knownPathArr.push(specifiedType);
    } else {
        knownPathArr.push(true);
    }

    return knownPathArr;
}

function pushFoundValue(jsonObj,stringPath, deepCopyValue, result) {
    let foundObj = {};
    foundObj['foundAt'] = stringPath;
    if (deepCopyValue === true) {
        foundObj['value'] = newInstance(jsonObj)
    } else {
        foundObj['value'] = jsonObj
    }
    result.push(foundObj);
}

function determineTypeAndPushValue(jsonObj, pathIterator, stringPath, deepCopyValue, result) {
    let specifiedTypes = pathIterator.nextValue();
    if (type(pathIterator.nextValue()) === 'array') {
        if (type(jsonObj) === 'number' && specifiedTypes.includes('number')) {// if (type(jsonObj) === 'number' && specifiedTypes['number'] != undefined)
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result);

        } else if (type(jsonObj) === 'string' && specifiedTypes.includes('string')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result)

        } else if (type(jsonObj) === 'boolean' && specifiedTypes.includes('boolean')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result)

        } else if (type(jsonObj) === 'array' && specifiedTypes.includes('array')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result)

        } else if (type(jsonObj) === 'object' && specifiedTypes.includes('object')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result)

        } else if (type(jsonObj) === 'undefined' && specifiedTypes.includes('undefined')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result)

        } else if (type(jsonObj) === 'null' && specifiedTypes.includes('null')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result)
        }
    } else if (pathIterator.nextValue() === true) {
        pushFoundValue(jsonObj, stringPath, deepCopyValue, result)
    }
}

function pathDig(jsonObj, pathIterator, stringPath, deepCopyValue, result) {
    if (type(jsonObj) === 'array') {
        if (pathIterator.nextValue() === '[]' || pathIterator.nextValue() === '*') { //Seach Whole Array
            pathIterator.next()
            
            //Return all values in array since this is last path
            if (type(pathIterator.nextValue()) === 'array' 
                || pathIterator.nextValue() === true) {
                for (let i in jsonObj) {
                    stringPath += '[' + i + ']'
                    determineTypeAndPushValue(jsonObj[i], pathIterator, stringPath, deepCopyValue, result)
                    let lengthToSlice = (i.toString().length + 2)
                    stringPath = stringPath.slice(0, -lengthToSlice);
                }
            } else { //Continue Diging
                for (let i in jsonObj) {
                    if (typeof jsonObj[i] === 'object') {
                        stringPath += '[' + i + ']'
                        pathDig(jsonObj[i], pathIterator, stringPath, deepCopyValue, result)
                        let lengthToSlice = (i.toString().length + 2)
                        stringPath = stringPath.slice(0, -lengthToSlice);
                    }
                }
            }

            pathIterator.back();
        } else if (pathIterator.nextValue().substring(0, 2) === '[]') { //Defined Array Path
            let index = pathIterator.nextValue().substring(2);
            if (jsonObj[index] != undefined) {
                pathIterator.next();

                //Return value since this is last path
                if (type(pathIterator.nextValue()) === 'array' 
                || pathIterator.nextValue() === true) {
                    stringPath += '[' + index + ']'
                    determineTypeAndPushValue(jsonObj[index], pathIterator, stringPath, deepCopyValue, result)
                    let lengthToSlice = (index.toString().length + 2)
                    stringPath = stringPath.slice(0, -lengthToSlice);
                } else { //Continue Diging
                    stringPath += '[' + index + ']';
                    pathDig(jsonObj[index], pathIterator, stringPath, deepCopyValue, result)
                    let lengthToSlice = (index.toString().length + 2)
                    stringPath.slice(0, -lengthToSlice);
                }

                pathIterator.back();
            }
        }
    } else if (type(jsonObj) === 'object') {
        if (pathIterator.nextValue() === '{}' || pathIterator.nextValue() === '*') { //Seach Whole Object
            pathIterator.next();

            //Return all values in object since this is last path
            if (type(pathIterator.nextValue()) === 'array'
                || pathIterator.nextValue() === true) {
                for (let key in jsonObj) {
                    stringPath += "['" + key + "']"
                    determineTypeAndPushValue(jsonObj[key], pathIterator, stringPath, deepCopyValue, result)
                    let lengthToSlice = (key.toString().length + 2)
                    stringPath.slice(0, -lengthToSlice);
                }
            } else { //Continue Diging
                for (let key in jsonObj) {
                    if (typeof jsonObj[key] === 'object') {
                        stringPath += "['" + key + "']"
                        pathDig(jsonObj[key], pathIterator, stringPath, deepCopyValue, result)
                        let lengthToSlice = (key.toString().length + 2)
                        stringPath.slice(0, -lengthToSlice);
                    }
                }
            }

            pathIterator.back();
        } else if (pathIterator.nextValue().substring(0, 2) === "['") { //Defined Object Path
            let key = pathIterator.nextValue();
            key = key.slice(2,-2);
            if (jsonObj[key] != undefined) {
                pathIterator.next()

                //Return value since this is last path
                if (type(pathIterator.nextValue()) === 'array' 
                || pathIterator.nextValue() === true) {
                    stringPath += "['" + key + "']";
                    determineTypeAndPushValue(jsonObj[key], pathIterator, stringPath, deepCopyValue, result)
                    let lengthToSlice = (key.toString().length + 2)
                    stringPath = stringPath.slice(0, -lengthToSlice);
                } else { //Continue Diging
                    stringPath += "['" + key + "']";
                    pathDig(jsonObj[key], pathIterator, stringPath, deepCopyValue, result)
                    let lengthToSlice = (key.toString().length + 2)
                    stringPath.slice(0, -lengthToSlice);
                }
                
                pathIterator.back();
            }
        }
    }
}

export function searchJsonPath(jsonObj, knownPath, deepCopyValue?) {
    let failedMsg = 'bad path';
    let pathIterator;
    let stringPath: string = '';
    if (deepCopyValue === undefined) deepCopyValue = false;
    let result = [];

    knownPath = parseKnownPath(knownPath) // [ 'path', [type]/true]
    
    if (knownPath === 'failed') {
        console.log(failedMsg);
        return 'failed'
    }

    pathIterator = new SubscribedIterator(knownPath);
    if (knownPath.length === 1) {
        console.log(failedMsg + ' - path depth must be greater than 0');
        return 'failed';
    } else {
        pathDig(jsonObj, pathIterator, stringPath, deepCopyValue, result);
    }
    

    if (result.length === 0) {
        return false;
    } else {
        return result;
    }
}

//--------------------------------------------------------

// console.log('=== Utility Playground ===');