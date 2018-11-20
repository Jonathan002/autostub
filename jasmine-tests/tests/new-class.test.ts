// --------- Test that decorated classes and decoredted properties/methods are synced correctly ------
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

  // Instance
  public testPublic = 'test public'; /*testPublic*/
  @public('publicHmm')
  public publicHmm: publicHmm = { hmm: 12 }; /*publicHmm*/
  readonly readOnlyProperty = 42; /*readOnlyProperty*/
  private hmmm = 'why...'; /*hmmm*/

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

  ngOnInit() {
    console.log('hello');
  } /*ngOnInit*/
  ngOnDestroy() {
    console.log('destroy');
  } /*ngOnDestroy*/
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
} /*PageNotFoundComponentStub*/