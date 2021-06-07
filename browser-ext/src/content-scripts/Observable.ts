export default class Observable<T> {
  private val: T;
  private subscriptions: ((val:T)=>any)[] = [];
  constructor(val:T) {
    this.val = val;
  };
  
  public set(val:T) {
    this.val = val;
    this.publish();
  }
  
  public subscribe(fn: (val:T)=>any) {
    this.subscriptions.push(fn);
    this.publishTo(fn);
  }

  private publish() {
    this.subscriptions.forEach(s => this.publishTo(s));
  }

  private publishTo(fn: (val:T)=>any): void {
    fn(this.val);
  }
}