// =====================================================================;
//                            Sync Imports                              
// =====================================================================
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
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponentStub implements OnInit {

  @complicatedDecorator(' css classes passed in with space ')
  public static extraSpaces = undefined;
  static classInfo() {
    return undefined;
  }

  protected static abc = undefined;
  private static abcdefg = undefined;
  private static lostUrl(thing) {
    return undefined;
  }

  private static test(): string {
    return undefined;
  }

  public testPublic = undefined;
  @public('publicHmm')
  public publicHmm: publicHmm = undefined;
  readonly readOnlyProperty = undefined;
  private hmmm = undefined;
  constructor(
    nakedDependency: Router,
    @Inject(APP_CONFIG) 
    public appConfig: AppConfig,
    private router: Router
  ){}

  ngOnInit() {
    return undefined;
  }

  ngOnDestroy() {
    return undefined;
  }

  public leFourOFour(statusCode?: number): string {
    return undefined;
  }

  bur(): number {
    return undefined;
  }

  private methodTwo() {
    return undefined;
  }

};
