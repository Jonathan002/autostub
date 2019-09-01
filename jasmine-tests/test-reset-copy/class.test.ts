// --------- Test that decorated classes and decoredted properties/methods are synced correctly ------
@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {  

  // Static
  @complicatedDecorator(' css classes passed in with space ')
  public        static       extraSpaces        =true;
  static classInfo() {
    console.log('This class helps manage the page-not found view');
  }

  leArrowFunc = (arg1: boolean, arg2: string = 'string', ...args): string => {
    return '=>';
  }

  public static leStaticArrowFunc = (value) => {
    return 'static =>';
  }

  arrowFuncWithStubImplementation = (value) => {
    return { implemented: true };
  }

  protected static abc = 13;
  private static abcdefg = 13;
  private static set lostUrl(thing) {
    if (thing) {
      console.log('etc');
    }
  }
  private static get test(): string {
    return 'the getdocumentation() getter ....'
  }

  // Instance
  public testPublic = 'test public';
  @public('publicHmm')
  public publicHmm: publicHmm = { hmm: 12 };
  readonly readOnlyProperty = 42;
  private hmmm = 'why...';

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
  }

  ngOnInit() {
    console.log('hello');
  }
  ngOnDestroy() {
    console.log('destroy');
  }
  public leFourOFour(statusCode?: number): string {
    console.log('welcome to 404');
    return 'welcome to 404';
  }
  get bur(): number {
    return 5;
  }

  private methodTwo() {
    console.log('welcome to 404 private');
  }
}