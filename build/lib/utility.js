"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Utility */
/* =============================
    type()
============================= */
exports.type = (function (global) {
    // An iffy to catch the global object (window / global)
    var cache = {};
    return function (obj) {
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
exports.replaceAt = function (str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
};
/* =============================
    objectDepth()
============================= */
exports.objectDepth = function (object) {
    var _, value, this$ = this;
    switch (false) {
        case typeof object === 'object':
            return 0;
    }
    return (function (it) {
        return it + 1;
    })(function (it) {
        return Math.max.apply(Math, [0].concat([].slice.call(it)));
    }(function (it) {
        return it.map(exports.objectDepth);
    }((function () {
        var ref$, own$ = {}.hasOwnProperty, results$ = [];
        for (_ in ref$ = object)
            if (own$.call(ref$, _)) {
                value = ref$[_];
                results$.push(value);
            }
        return results$;
    }()))));
};
/* =============================
    strInsert()
============================= */
function strInsert(string, index, stringToAdd) {
    if (index > 0)
        return string.substring(0, index) + stringToAdd + string.substring(index, string.length);
    else
        return stringToAdd + string;
}
exports.strInsert = strInsert;
;
/* =============================
    objLength()
============================= */
function objLength(obj) {
    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            size++;
        }
    }
    return size;
}
exports.objLength = objLength;
/* =============================
    promiseTimeout()
============================= */
/* Taken from https://italonascimento.github.io/applying-a-timeout-to-your-promises/ */
exports.promiseTimeout = function (ms, promise) {
    // Create a promise that rejects in <ms> milliseconds
    var timeout = new Promise(function (resolve, reject) {
        var id = setTimeout(function () {
            clearTimeout(id);
            // console.log("timeout finished at " + ms + "ms but promise won't reject");
            reject('Timed out in ' + ms + 'ms. - Reject Message');
        }, ms);
    });
    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ]);
};
/* =============================
    flatten()
============================= */
exports.flatten = function (arr) { return arr.reduce(function (acc, val) { return acc.concat(Array.isArray(val) ? exports.flatten(val) : val); }, []); };
exports.isValidJson = function (json) {
    json = JSON.stringify(json);
    try {
        JSON.parse(json);
        return true;
    }
    catch (e) {
        return false;
    }
};
/* =============================
    makeid()
============================= */
function makeid(strLength) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < strLength; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
exports.makeid = makeid;
/* =============================
    SubscribedIterator class
============================= */
var SubscribedIterator = /** @class */ (function () {
    function SubscribedIterator(array) {
        this.indexState = 0;
        this.array = array;
    }
    SubscribedIterator.prototype.next = function () {
        return this.indexState < this.array.length ?
            { value: this.array[this.indexState++], start: false, done: false } :
            { done: true };
    };
    SubscribedIterator.prototype.back = function () {
        return this.indexState != 0 ? { value: this.array[--this.indexState], start: false, done: false } : { start: true };
    };
    SubscribedIterator.prototype.length = function () {
        return this.array.length;
    };
    SubscribedIterator.prototype.nextIndex = function () {
        return this.indexState < this.array.length ? this.indexState : { done: true };
    };
    SubscribedIterator.prototype.nextValue = function () {
        return this.indexState < this.array.length ? this.array[this.indexState] : { done: true };
    };
    SubscribedIterator.prototype.reset = function () {
        this.indexState = 0;
    };
    SubscribedIterator.prototype.start = function () {
        return this.indexState === 0 ? true : false;
    };
    SubscribedIterator.prototype.done = function () {
        return this.indexState < this.array.length ? false : true;
    };
    return SubscribedIterator;
}());
exports.SubscribedIterator = SubscribedIterator;
/* =============================
    newInstance()
    keyword: deepCopy
============================= */
function newInstance(objectpassed) {
    if (objectpassed === null || typeof objectpassed !== 'object') {
        return objectpassed;
    }
    // give temporary-storage the original obj's constructor
    var temporary_storage = objectpassed.constructor();
    for (var key in objectpassed) {
        temporary_storage[key] = newInstance(objectpassed[key]);
    }
    return temporary_storage;
}
exports.newInstance = newInstance;
/* =============================
    Diff()
    - uses type()
============================= */
function objLoopReseter(c, d) {
    if (objLength(c) != 0 && objLength(d) != 0) {
        for (var pc in c) {
            for (var pd in d) {
                if (exports.type(c[pc]) != 'array' && exports.type(c[pc]) != 'object' && exports.type(d[pd]) != 'array' && exports.type(d[pd]) != 'object') {
                    if (pc === pd && c[pc] === d[pd]) {
                        delete c[pc];
                        delete d[pd];
                        var deleteStuff = objLoopReseter(c, d);
                        if (deleteStuff[2] != false) {
                            return deleteStuff;
                        }
                    }
                }
                else {
                    if (pc === pd) {
                        var deleteStuff = dig(c[pc], d[pd]);
                        switch (deleteStuff[2]) {
                            case 'removeAll':
                                delete c[pc];
                                delete d[pd];
                                var deleteStuff = objLoopReseter(c, d);
                                if (deleteStuff[2] != false) {
                                    return deleteStuff;
                                }
                                break;
                            case 'removeC':
                                delete c[pc];
                                var deleteStuff = objLoopReseter(c, d);
                                if (deleteStuff[2] != false) {
                                    return deleteStuff;
                                }
                                break;
                            case 'removeD':
                                delete d[pd];
                                var deleteStuff = objLoopReseter(c, d);
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
    }
    else if (objLength(c) === 0 && objLength(d) === 0) {
        return [c, d, 'removeAll'];
    }
    else if (objLength(c) === 0) {
        return [c, d, 'removeC'];
    }
    else if (objLength(d) === 0) {
        return [c, d, 'removeD'];
    }
    return [c, d, false];
}
function dig(c, d) {
    if (exports.type(c) === exports.type(d) && exports.type(c) === 'array') {
        for (var ic = 0; ic < c.length; ic++) {
            for (var id = 0; id < d.length; id++) {
                if (exports.type(c[ic]) != 'array' && exports.type(c[ic]) != 'object' && exports.type(d[id]) != 'array' && exports.type(d[id]) != 'object') {
                    if (c[ic] === d[id]) {
                        c.splice(ic, 1);
                        d.splice(id, 1);
                        ic = -1;
                        id = -1;
                    }
                }
                else {
                    var deleteStuff = dig(c[ic], d[id]);
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
        }
        else if (c.length === 0) {
            return [c, d, 'removeC'];
        }
        else if (d.length === 0) {
            return [c, d, 'removeD'];
        }
    }
    else if (exports.type(c) === exports.type(d) && exports.type(c) === 'object') {
        var deleteStuff = objLoopReseter(c, d);
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
    return [c, d, false];
}
// Note: Not guaranteed to always retain the original object structure (especially for really simliar objects) but will return difference of all single values.
function diff(a, b) {
    var c = newInstance(a);
    var d = newInstance(b);
    var result = dig(c, d);
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
exports.diff = diff;
/* =============================
    searchJson() - by value
    - uses type()
============================= */
function searchDig(jsonObj, valueToFind, stringPath, pathArr) {
    if (exports.type(jsonObj) === 'array') {
        if (jsonObj.length != 0) {
            for (var i in jsonObj) {
                if (typeof jsonObj[i] != 'object') {
                    if (jsonObj[i] === valueToFind) {
                        stringPath += '[' + i + ']';
                        pathArr.push(stringPath);
                        var lengthToSlice = (i.toString().length + 2);
                        stringPath = stringPath.slice(0, -lengthToSlice);
                    }
                }
                else {
                    stringPath += '[' + i + ']';
                    searchDig(jsonObj[i], valueToFind, stringPath, pathArr);
                    stringPath = stringPath.slice(0, -3);
                }
            }
        }
    }
    else if (exports.type(jsonObj) === 'object') {
        for (var key in jsonObj) {
            if (typeof jsonObj[key] != 'object') {
                if (jsonObj[key] === valueToFind) {
                    stringPath += '[' + key + ']';
                    pathArr.push(stringPath);
                    var lengthToSlice = (key.length + 2);
                    stringPath = stringPath.slice(0, -lengthToSlice);
                }
            }
            else {
                stringPath += '[' + key + ']';
                searchDig(jsonObj[key], valueToFind, stringPath, pathArr);
                var lengthToSlice = (key.length + 2);
                stringPath = stringPath.slice(0, -lengthToSlice);
            }
        }
    }
}
function stringReplaceValue(jsonObj, valueToFind) {
    var jsonString = JSON.stringify(jsonObj);
    var valueToFindString = JSON.stringify(valueToFind);
    var regExpValueToFind;
    var bookmark;
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
    }
    else {
        var uniqueStrLength = 144;
        var uniqueStr = '"' + makeid(uniqueStrLength) + '"';
        var attempts = 0;
        while (jsonString.search(uniqueStr) != -1 || attempts != 10) {
            uniqueStrLength + 144;
            uniqueStr = '"' + makeid(uniqueStrLength) + '"';
            attempts++;
        }
        if (jsonString.search(uniqueStr) === -1) {
            jsonString = jsonString.replace(regExpValueToFind, uniqueStr);
            bookmark = uniqueStr;
        }
        else {
            console.log('Attempt to find value failed - could not create unique str');
            return false;
        }
    }
    return [JSON.parse(jsonString), bookmark];
}
function searchJson(jsonObj, valueToFind) {
    var stringPath = '';
    var pathArr = [];
    if (typeof valueToFind === 'object') {
        var strSearchResults = stringReplaceValue(jsonObj, valueToFind);
        if (strSearchResults === false)
            return 'failed';
        jsonObj = strSearchResults[0];
        valueToFind = strSearchResults[1].slice(1).slice(0, -1); //slice removes ""
    }
    searchDig(jsonObj, valueToFind, stringPath, pathArr);
    if (pathArr.length != 0) {
        return pathArr;
    }
    else {
        return false;
    }
}
exports.searchJson = searchJson;
/* =============================
    searchJsonPath()
    - uses type()
    - uses diff()
    - uses newInstance()
    - uses SubscribedIterator class
============================= */
function parseKnownPath(knownPath) {
    var pathTypelist = ['string', 'number', 'boolean', 'array', 'object', 'undefined', 'null']; // might add array/object so generation of path done by type is easier
    var lengthToSlice;
    var specifiedType;
    var knownPathArr;
    if (exports.type(knownPath) != 'array' && exports.type(knownPath) != 'string') {
        return 'failed';
    }
    else if (exports.type(knownPath) === 'string') {
        // Check if knownPath has type at end of string
        knownPath = knownPath.replace(/[\"\']/g, "'");
        if (knownPath.substring(knownPath.length - 1) === ']' && knownPath.substring(knownPath.length - 2) != "']" && knownPath.substring(knownPath.length - 2) != "[]") {
            var split = knownPath.split('[');
            var pop = split.pop();
            if (pop.substring(0, 1) === ']') {
                specifiedType = '[' + split.pop() + '[' + pop;
            }
            else {
                specifiedType = '[' + pop;
            }
            lengthToSlice = specifiedType.length;
            specifiedType = specifiedType.replace(/\s/g, '');
            specifiedType = specifiedType.slice(1, -1);
            specifiedType = specifiedType.replace(/\[]/g, 'array');
            specifiedType = specifiedType.replace(/\{}/g, 'object');
            specifiedType = specifiedType.split(',');
            //Verify type as array
            var typeDiff = diff(specifiedType, pathTypelist);
            if (typeDiff[0] != -1) {
                return 'failed';
            }
            knownPath = knownPath.slice(0, -lengthToSlice);
            if (knownPath.substring(knownPath.length - 1) === '!') {
                specifiedType = typeDiff[1];
                knownPath = knownPath.slice(0, -1);
            }
        }
        else if (knownPath.substring(knownPath.length - 'number'.length) === 'number') {
            specifiedType = ['number'];
            knownPath = knownPath.slice(0, -'number'.length);
        }
        else if (knownPath.substring(knownPath.length - 'string'.length) === 'string') {
            specifiedType = ['string'];
            knownPath = knownPath.slice(0, -'string'.length);
        }
        else if (knownPath.substring(knownPath.length - 'boolean'.length) === 'boolean') {
            specifiedType = ['boolean'];
            knownPath = knownPath.slice(0, -'boolean'.length);
        }
        else if (knownPath.substring(knownPath.length - 'array'.length) === 'array') {
            specifiedType = ['array'];
            knownPath = knownPath.slice(0, -'array'.length);
        }
        else if (knownPath.substring(knownPath.length - 'object'.length) === 'object') {
            specifiedType = ['object'];
            knownPath = knownPath.slice(0, -'object'.length);
        }
        else if (knownPath.substring(knownPath.length - 'undefined'.length) === 'undefined') {
            specifiedType = ['undefined'];
            knownPath = knownPath.slice(0, -'undefined'.length);
        }
        else if (knownPath.substring(knownPath.length - 'null'.length) === 'null') {
            specifiedType = ['null'];
            knownPath = knownPath.slice(0, -'null'.length);
        }
        else if (knownPath.substring(knownPath.length - '[]'.length) === '[]') {
            specifiedType = ['array'];
            knownPath = knownPath.slice(0, -'[]'.length);
        }
        else if (knownPath.substring(knownPath.length - '{}'.length) === '{}') {
            specifiedType = ['object'];
            knownPath = knownPath.slice(0, -'{}'.length);
        }
        else if (knownPath.substring(knownPath.length - '*'.length) === '*') {
            specifiedType = true;
            knownPath = knownPath.slice(0, -'*'.length);
        }
        // Parsing knownPath - type is already sliced out
        knownPath = knownPath.replace(/\*/g, '@*'); //pending on $&
        // console.log(knownPath);
        knownPathArr = knownPath.split(/[\[\{@]/g);
        knownPathArr.shift();
        // console.log(knownPathArr);
        knownPathArr = knownPathArr.map(function (x) {
            if (x === '}') {
                return x = '{' + x;
            }
            else if (x.substring(0, 1) === ']'
                || x.substring(0, 1) === "'") {
                return x = '[' + x;
            }
            else {
                return x;
            }
        });
    }
    else { // knownPath is passed as array
        knownPathArr = knownPath;
        var typeTest = knownPathArr[knownPathArr.length - 1];
        if (exports.type(typeTest) === 'array') {
            specifiedType = knownPathArr.pop();
            if (diff(specifiedType, pathTypelist)[0] != -1) {
                return 'failed';
            }
        }
        else if (typeTest === true) {
            specifiedType = knownPathArr.pop();
        }
        try {
            knownPathArr = knownPathArr.map(function (x) { return x.replace(/[\"\']/g, "'"); });
        }
        catch (e) {
            return 'failed';
        }
        // In order to preserve the original knownPath array if ever the user will use it for something else (to help him/her catch bugs).
        // knownPathArr does not point to knownPath anymore since a map() return was assigned to it.
        knownPath.push(specifiedType);
    }
    // Verify knownPathArr
    for (var _i = 0, knownPathArr_1 = knownPathArr; _i < knownPathArr_1.length; _i++) {
        var item = knownPathArr_1[_i];
        if (item === '{}'
            || item === '[]'
            || item === '*'
            || item.substring(0, 2) === '[]' && isNaN(Number(item.substring(2))) === false
            || item.substring(0, 2) === "['" && item.substring(item.length - 2) === "']") {
        }
        else {
            return 'failed';
        }
    }
    if (specifiedType != undefined) { //specifiedType can either be [] or true
        knownPathArr.push(specifiedType);
    }
    else {
        knownPathArr.push(true);
    }
    return knownPathArr;
}
function pushFoundValue(jsonObj, stringPath, deepCopyValue, result) {
    var foundObj = {};
    foundObj['foundAt'] = stringPath;
    if (deepCopyValue === true) {
        foundObj['value'] = newInstance(jsonObj);
    }
    else {
        foundObj['value'] = jsonObj;
    }
    result.push(foundObj);
}
function determineTypeAndPushValue(jsonObj, pathIterator, stringPath, deepCopyValue, result) {
    var specifiedTypes = pathIterator.nextValue();
    if (exports.type(pathIterator.nextValue()) === 'array') {
        if (exports.type(jsonObj) === 'number' && specifiedTypes.includes('number')) { // if (type(jsonObj) === 'number' && specifiedTypes['number'] != undefined)
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result);
        }
        else if (exports.type(jsonObj) === 'string' && specifiedTypes.includes('string')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result);
        }
        else if (exports.type(jsonObj) === 'boolean' && specifiedTypes.includes('boolean')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result);
        }
        else if (exports.type(jsonObj) === 'array' && specifiedTypes.includes('array')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result);
        }
        else if (exports.type(jsonObj) === 'object' && specifiedTypes.includes('object')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result);
        }
        else if (exports.type(jsonObj) === 'undefined' && specifiedTypes.includes('undefined')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result);
        }
        else if (exports.type(jsonObj) === 'null' && specifiedTypes.includes('null')) {
            pushFoundValue(jsonObj, stringPath, deepCopyValue, result);
        }
    }
    else if (pathIterator.nextValue() === true) {
        pushFoundValue(jsonObj, stringPath, deepCopyValue, result);
    }
}
function pathDig(jsonObj, pathIterator, stringPath, deepCopyValue, result) {
    if (exports.type(jsonObj) === 'array') {
        if (pathIterator.nextValue() === '[]' || pathIterator.nextValue() === '*') { //Seach Whole Array
            pathIterator.next();
            //Return all values in array since this is last path
            if (exports.type(pathIterator.nextValue()) === 'array'
                || pathIterator.nextValue() === true) {
                for (var i in jsonObj) {
                    stringPath += '[' + i + ']';
                    determineTypeAndPushValue(jsonObj[i], pathIterator, stringPath, deepCopyValue, result);
                    var lengthToSlice = (i.toString().length + 2);
                    stringPath = stringPath.slice(0, -lengthToSlice);
                }
            }
            else { //Continue Diging
                for (var i in jsonObj) {
                    if (typeof jsonObj[i] === 'object') {
                        stringPath += '[' + i + ']';
                        pathDig(jsonObj[i], pathIterator, stringPath, deepCopyValue, result);
                        var lengthToSlice = (i.toString().length + 2);
                        stringPath = stringPath.slice(0, -lengthToSlice);
                    }
                }
            }
            pathIterator.back();
        }
        else if (pathIterator.nextValue().substring(0, 2) === '[]') { //Defined Array Path
            var index = pathIterator.nextValue().substring(2);
            if (jsonObj[index] != undefined) {
                pathIterator.next();
                //Return value since this is last path
                if (exports.type(pathIterator.nextValue()) === 'array'
                    || pathIterator.nextValue() === true) {
                    stringPath += '[' + index + ']';
                    determineTypeAndPushValue(jsonObj[index], pathIterator, stringPath, deepCopyValue, result);
                    var lengthToSlice = (index.toString().length + 2);
                    stringPath = stringPath.slice(0, -lengthToSlice);
                }
                else { //Continue Diging
                    stringPath += '[' + index + ']';
                    pathDig(jsonObj[index], pathIterator, stringPath, deepCopyValue, result);
                    var lengthToSlice = (index.toString().length + 2);
                    stringPath.slice(0, -lengthToSlice);
                }
                pathIterator.back();
            }
        }
    }
    else if (exports.type(jsonObj) === 'object') {
        if (pathIterator.nextValue() === '{}' || pathIterator.nextValue() === '*') { //Seach Whole Object
            pathIterator.next();
            //Return all values in object since this is last path
            if (exports.type(pathIterator.nextValue()) === 'array'
                || pathIterator.nextValue() === true) {
                for (var key in jsonObj) {
                    stringPath += "['" + key + "']";
                    determineTypeAndPushValue(jsonObj[key], pathIterator, stringPath, deepCopyValue, result);
                    var lengthToSlice = (key.toString().length + 2);
                    stringPath.slice(0, -lengthToSlice);
                }
            }
            else { //Continue Diging
                for (var key in jsonObj) {
                    if (typeof jsonObj[key] === 'object') {
                        stringPath += "['" + key + "']";
                        pathDig(jsonObj[key], pathIterator, stringPath, deepCopyValue, result);
                        var lengthToSlice = (key.toString().length + 2);
                        stringPath.slice(0, -lengthToSlice);
                    }
                }
            }
            pathIterator.back();
        }
        else if (pathIterator.nextValue().substring(0, 2) === "['") { //Defined Object Path
            var key = pathIterator.nextValue();
            key = key.slice(2, -2);
            if (jsonObj[key] != undefined) {
                pathIterator.next();
                //Return value since this is last path
                if (exports.type(pathIterator.nextValue()) === 'array'
                    || pathIterator.nextValue() === true) {
                    stringPath += "['" + key + "']";
                    determineTypeAndPushValue(jsonObj[key], pathIterator, stringPath, deepCopyValue, result);
                    var lengthToSlice = (key.toString().length + 2);
                    stringPath = stringPath.slice(0, -lengthToSlice);
                }
                else { //Continue Diging
                    stringPath += "['" + key + "']";
                    pathDig(jsonObj[key], pathIterator, stringPath, deepCopyValue, result);
                    var lengthToSlice = (key.toString().length + 2);
                    stringPath.slice(0, -lengthToSlice);
                }
                pathIterator.back();
            }
        }
    }
}
function searchJsonPath(jsonObj, knownPath, deepCopyValue) {
    var failedMsg = 'bad path';
    var pathIterator;
    var stringPath = '';
    if (deepCopyValue === undefined)
        deepCopyValue = false;
    var result = [];
    knownPath = parseKnownPath(knownPath); // [ 'path', [type]/true]
    if (knownPath === 'failed') {
        console.log(failedMsg);
        return 'failed';
    }
    pathIterator = new SubscribedIterator(knownPath);
    if (knownPath.length === 1) {
        console.log(failedMsg + ' - path depth must be greater than 0');
        return 'failed';
    }
    else {
        pathDig(jsonObj, pathIterator, stringPath, deepCopyValue, result);
    }
    if (result.length === 0) {
        return false;
    }
    else {
        return result;
    }
}
exports.searchJsonPath = searchJsonPath;
//--------------------------------------------------------
// console.log('=== Utility Playground ===');
