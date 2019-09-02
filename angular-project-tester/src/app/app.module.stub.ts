import { AUTH_MODULE_STUB_META, AUTH_MODULE_STUB_PROVIDERS } from './auth/auth.module.stub';
import * as Case from 'case';
import { TEST_PROVIDERS_ANGULAR, AngularUnitTestModule } from 'src/testing/angular.unit-test-module';

import { appNav } from './_models/app-nav.model';
import { CaseToken } from './_models/node-lib-injector-tokens';
import { SharedModuleStub } from './_shared/shared.module.stub';
import { LayoutConfig, LayoutMasterModule } from 'angular-layout-master';
import { Provider, NgModule } from '@angular/core';
import { AppStateService } from './_services/app-state.service';
import { AuthService } from './_services/auth.service';
import { UserService } from './_services/user.service';
import { AdminGuard } from './_guards/admin.guard';
import { AuthGuard } from './_guards/auth.guard';
import { AppStateServiceStub } from './_services/app-state.service.stub';
import { AuthServiceStub } from './_services/auth.service.stub';
import { AdminGuardStub } from './_guards/admin.guard.stub';
import { UserServiceStub } from './_services/user.service.stub';
import { AuthGuardStub } from './_guards/auth.guard.stub';
import { AppComponentStub } from './app.component.stub';
import { CoreModuleStub, CORE_MODULE_STUB_META, CORE_MODULE_STUB_PROVIDERS } from './_core/core.module.stub';
import { HomeComponentStub } from './_core/home/home.component.stub';
import { PROFILE_MODULE_STUB_META, PROFILE_MODULE_STUB_PROVIDERS } from './profile/profile.module.stub';




const routeMasterConfig = {
  outlets: {
    // 's1': true,
    // 's2': true,
    // 's3': true,
    // 's4': true,
  },
};


const layoutConfig: LayoutConfig = {
  minSupportedWidth: 319,
  breakpointWidths: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
  autoNav: appNav,
  routeMasterClasses: {
    modal: 'bg-appPrimary-700',
    'secondary-modal': 'bg-appPrimary-100 r-border',
    'tertiary-modal': 'bg-appPrimary-200',
  },
  sizes: {
    sm: 32,
    md: 64,
    lg: 80,
  },
  tb: {
    default: 'sm',
    s0Size: 'md',
    s0Class: 'bg-appPrimary-400',
    s1Class: 'bg-appPrimary-300',
  },
  rm: routeMasterConfig,
};

const PROVIDERS = [
  { provide: CaseToken, useValue: Case },
]

export const APP_MODULE_STUB_PROVIDERS: Provider[] = [
  { provide: AppStateService, useClass: AppStateServiceStub },
  { provide: AuthService, useClass: AuthServiceStub },
  { provide: UserService, useClass: UserServiceStub },
  { provide: AdminGuard, useClass: AdminGuardStub },
  { provide: AuthGuard, useClass: AuthGuardStub },
  { provide: CaseToken, useValue: Case },
];

export const ROOT_STUB_PROVIDERS = [
  ...TEST_PROVIDERS_ANGULAR,
  ...APP_MODULE_STUB_PROVIDERS,
  ...CORE_MODULE_STUB_PROVIDERS,
  ...PROFILE_MODULE_STUB_PROVIDERS,
  ...AUTH_MODULE_STUB_PROVIDERS,

  // Dependency Providers
  ...LayoutMasterModule.forRoot(layoutConfig).providers
]

export const APP_MODULE_STUB_META = {
  declarations: [
    AppComponentStub,
  ],
  imports: [
    AngularUnitTestModule,
    CoreModuleStub,
    SharedModuleStub,
    // RouteMasterModule.forRoot(routeMasterConfig),
    LayoutMasterModule.forRoot(layoutConfig),
  ],
  providers: [
    ...PROVIDERS
  ],
  entryComponents: [
    HomeComponentStub,
  ]
};

@NgModule(APP_MODULE_STUB_META)
export class AppModuleStub { }


// TODO: try to treeshake unused css with purify.css plugin for webpack
// Extend underlying webpack in Angular: https://dev.to/meltedspark/customizing-angular-cli-6-buildan-alternative-to-ng-eject-1oc4
// Article about purify css: https://survivejs.com/webpack/styling/eliminating-unused-css/

// TODO: 
// - stop user interaction on route-master animations