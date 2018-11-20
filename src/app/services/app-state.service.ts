import { UserConfig } from './../../types/user-config.d';
export class AppState {
    program: any;
    userConfig: UserConfig;
}

// Allows To Create Additional instances with DI set already
export const newAppState = () => {
    return new AppState();
}

// Exporting a const as a shared instance of class between the project..
export const appState_i1 = new AppState();