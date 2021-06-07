import Observable from "./Observable";

export default class QueryWatcher {
  private selector: string;
  private docObserver = new MutationObserver(()=>{
    this.checkForFields()
  })

  private latestMatches = new Set<Element>();
  public matches = new Observable<Element[]>(Array.from(this.latestMatches));

  constructor(selector: string) {
    this.selector = selector;
  }

  public beginWatching() {
    this.docObserver.observe(document.body, { subtree: true, attributes: true });
    this.checkForFields();
  }

  private checkForFields() {
    let foundEls = new Set(document.querySelectorAll(this.selector));
  
    foundEls.forEach(el => {
      if (!this.latestMatches.has(el)){
        this.latestMatches = new Set(foundEls);
        this.matches.set(Array.from(this.latestMatches.values()))
        return;
      }
    })
  
    this.latestMatches.forEach(el => {
      if (!foundEls.has(el)){
        this.latestMatches = new Set(foundEls);
        this.matches.set(Array.from(this.latestMatches.values()))
        return;
      }
    })
  }
}