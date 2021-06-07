import { Action, Request } from "@/lib/Messages";
import Credentials from "../../../model/Credentials";

export default class OpUi {
  doc:Document;
  isRendered = false;
  isLoading = false;
  isShowing = true;
  page: string = "";
  uiEl!: HTMLDivElement;
  bodyEl!: HTMLDivElement;
  showToggle!: HTMLInputElement;
  presenter: OpUiPresenter;

  constructor(doc:Document, presenter:OpUiPresenter) {
    this.doc = doc;
    this.presenter = presenter;
  }

  public init() {
    this.render();
  }

  public render() {
    if (this.isRendered) return;
    this.doc.body.insertAdjacentHTML("afterend", baseHTML);
    this.uiEl = <HTMLDivElement>this.doc.getElementById("op_UI");
    this.bodyEl = <HTMLDivElement>this.doc.getElementById("op_body");
    
    this.showToggle = <HTMLInputElement>this.doc.getElementById("op_showBody");
    this.showToggle.checked = this.isShowing;

    let loginButton = <HTMLButtonElement>this.doc.getElementById("op_loginButton");
    loginButton.addEventListener("click",()=>this.doLogin())

    let newCredlink = <HTMLButtonElement>this.doc.getElementById("op_newCredsLink");
    newCredlink.addEventListener("click",()=>this.setPage("new"))

    let newCredSave = <HTMLButtonElement>this.doc.getElementById("op_newCredButton");
    newCredSave.addEventListener("click",()=>this.saveNew())

    let newCredCancel = <HTMLButtonElement>this.doc.getElementById("op_newCredCancel");
    newCredCancel.addEventListener("click",()=>this.setPage("list"))
    
    let newCredUrl = <HTMLInputElement>this.doc.getElementById("op_f_url");
    newCredUrl.value = this.doc.location.href;
    
    this.isRendered = true;
  }

  public remove() {
    if (!this.isRendered) return;
    this.uiEl.remove();
    this.isRendered = false;
  }

  showLoading(val:boolean) {
    this.isLoading = val;
    this.uiEl.className = val ? "loading" : "";
  }

  show() {
    this.isShowing = true;
    this.showToggle.checked = this.isShowing;
  }
  hide() {
    this.isShowing = false;
    this.showToggle.checked = this.isShowing;
  }

  doLogin(): any {
    let acctVal = (<HTMLInputElement>this.doc.getElementById("op_l_acct")).value;
    let passVal = (<HTMLInputElement>this.doc.getElementById("op_l_pw")).value;
    let req = new Request(Action.LOGIN, {
      email: acctVal, password: passVal
    });
    this.presenter.doLogin(req);
  }

  saveNew(): any {
    let nameVal = (<HTMLInputElement>this.doc.getElementById("op_f_nn")).value;
    let urlVal = (<HTMLInputElement>this.doc.getElementById("op_f_url")).value;
    let acctVal = (<HTMLInputElement>this.doc.getElementById("op_f_acct")).value;
    let passVal = (<HTMLInputElement>this.doc.getElementById("op_f_pw")).value;
    let req = new Request(Action.NEW_CRED, {
      nickname: nameVal,
      url: urlVal,
      accountIdentifier: acctVal,
      password: passVal,
    });
    this.presenter.saveNew(req);
  }


  suggestNewCreds(passVal: string, acctVal: string) {
    if (!this.isRendered) return;
    (<HTMLInputElement>this.doc.getElementById("op_f_acct")).value = acctVal;
    (<HTMLInputElement>this.doc.getElementById("op_f_pw")).value = passVal;
    this.setPage("new");
    this.show();
  }


  public setPage(page: string): boolean {
    if (!this.isRendered) return false;
    this.page = page;
    this.bodyEl?.setAttribute("page", page);
    return true;
  }

  public loadCreds(creds: Credentials[]) {
    if (!this.isRendered) return;
    let credListEl = <HTMLDivElement>document.getElementById("op_credsList");
    if (!credListEl) return;
    credListEl.innerHTML = ""
    creds.forEach(c => credListEl.appendChild(this.createCredRow(c)));
  }

  private createCredRow(c: Credentials): HTMLDivElement {
    let row = this.doc.createElement("div");
    row.innerHTML = `
      <div class="op-cred-row">
        <div class="op-cred-nickname">${c.nickname}</div>
        <div class="op-cred-account">${c.accountIdentifier}</div>
      </div>`;
    row.addEventListener("click", ()=> this.presenter.onCredSelect(c));
    return row;
  }
}



export interface OpUiPresenter {
  saveNew(req: Request): void;
  doLogin(req:Request): void;
  fetchCreds(): void;
  onCredSelect(cred:Credentials): void;
}





const baseHTML = `
<div id="op_UI">
  <label for="op_showBody" id="op_toggleShow">
    <div id="op_topBar">
      <span>OlivePass</span>
      <div id="op_loader"><div class="op-loading-spinner"></div></div>
    </div>
  </label>
  <input type="checkbox" id="op_showBody" checked hidden />
  <div id="op_body" page>
    <div id="op_login" class="op-page">
      <div class="op-h1">Log In</div>
      <p>
        <input type="text" id="op_l_acct" placeholder="Account" />
        <input type="text" id="op_l_pw" placeholder="Password" />
        <br>
        <button id="op_loginButton">Log In</button>
      </p>
    </div>

    <div id="op_list" class="op-page">
      <div class="op-h1">Select an account:</div>
      <div id="op_credsList">
        <div class="op-cred-row">
          <div class="op-cred-nickname">Nickname</div>
          <div class="op-cred-account">Account</div>
        </div>
      </div>

      <div id="op_newCredsLink">+ New Credentials</div>

    </div>

    <div id="op_new" class="op-page">
      <div class="op-h1">New credentials:</div>
      <p>
        <input type="text" id="op_f_nn" placeholder="Nickname" />
        <input type="text" id="op_f_url" placeholder="Url" />
        <input type="text" id="op_f_acct" placeholder="Account" />
        <input type="text" id="op_f_pw" placeholder="Password" />
        <br>
        <button id="op_newCredButton">Save</button>
        <button id="op_newCredCancel">Cancel</button>
    </div>
  </div>


  <style>
  :root {
    --op-primary: rgb(100, 212, 28);
  }
  
  #op_UI {
    background: #fff;
    font-family: sans-serif;
    position: fixed;
    bottom: 0;
    right: 2em;
    overflow: hidden;
    width: 250px;
    border-top-left-radius: .8em;
    border-top-right-radius: .8em;
    box-shadow: 0 0 .5em #0002;
    z-index: 9999999999;
    font-size: 14px;
  }
  
  .op-h1 {
    color: var(--op-primary);
    font-size: 1.2em;
    font-weight: bold;
    margin: 0 !important;
  }
  
  label#op_toggleShow {
    display: block;
    cursor: pointer;
  }
  
  #op_topBar {
    background: var(--op-primary);
    color: white;
    font-weight: bold;
    font-size: 1.2em;
    padding: .7em 1em;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  #op_UI.loading .op-loading-spinner {
    display: block;
  }
  .op-loading-spinner {
    display: inline-block;
    border: .2em solid;
    border-top-color: transparent;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    display: none;
    animation: spin 2s infinite linear;
  }
  @keyframes spin {
    from {
        transform:rotate(0deg);
    }
    to {
        transform:rotate(360deg);
    }
  }
  
  #op_body {
    display: none;
    padding: 1em;
    max-height: 40vh;
    min-height: 100px;
    overflow-y: auto;
  }
  
  #op_showBody:checked+#op_body {
    display: block;
  }
  
  #op_body>.op-page {
    display: none;
  }
  
  #op_body[page="login"]>#op_login {
    display: block;
  }
  
  #op_body[page="new"]>#op_new {
    display: block;
  }
  
  #op_body[page="list"]>#op_list {
    display: block;
  }
  
  .op-cred-row {
    padding: .5em;
    border-bottom: 1px solid #0001;
    cursor: pointer;
    user-select: none;
  }
  .op-cred-row:hover {
    background: #00000007;
  }
  
  
  .op-cred-account {
    color: #888;
  }
  
  #op_newCredsLink {
    color: var(--op-primary);
    text-align: center;
    padding: .5em;
    line-height: 3em;
    cursor: pointer;
  }

  #op_l_pw, #op_f_pw {
    -webkit-text-security: disc;
  }
  </style>

</div>
`