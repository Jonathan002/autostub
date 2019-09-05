"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AppState = /** @class */ (function () {
    function AppState() {
    }
    return AppState;
}());
exports.AppState = AppState;
// Allows To Create Additional instances with DI set already
exports.newAppState = function () {
    return new AppState();
};
// Exporting a const as a shared instance of class between the project..
exports.appState_i1 = new AppState();
