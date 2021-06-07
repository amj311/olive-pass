import { Action, Request } from "@/lib/Messages";
import Credentials from "../../../model/Credentials";

export default class OpUi {
  doc:Document;
  isRendered = false;
  isShowing = true;
  page: string = "";
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
    
    let newCredUrl = <HTMLInputElement>this.doc.getElementById("op_Url");
    newCredUrl.value = this.doc.location.href;
    
    this.isRendered = true;
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
    let acctVal = (<HTMLInputElement>this.doc.getElementById("op_loginAcct")).value;
    let passVal = (<HTMLInputElement>this.doc.getElementById("op_loginPass")).value;
    let req = new Request(Action.LOGIN, {
      email: acctVal, password: passVal
    });
    this.presenter.doLogin(req);
  }

  saveNew(): any {
    let nameVal = (<HTMLInputElement>this.doc.getElementById("op_Nickname")).value;
    let urlVal = (<HTMLInputElement>this.doc.getElementById("op_Url")).value;
    let acctVal = (<HTMLInputElement>this.doc.getElementById("op_Acct")).value;
    let passVal = (<HTMLInputElement>this.doc.getElementById("op_Pass")).value;
    let req = new Request(Action.NEW_CRED, {
      nickname: nameVal,
      url: urlVal,
      accountIdentifier: acctVal,
      password: passVal,
    });
    this.presenter.saveNew(req);
  }


  suggestNewCreds(passVal: string, acctVal: string) {
    (<HTMLInputElement>this.doc.getElementById("op_Acct")).value = acctVal;
    (<HTMLInputElement>this.doc.getElementById("op_Pass")).value = passVal;
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
    let credListEl = <HTMLDivElement>document.getElementById("op_credsList");
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
    <div id="op_topBar">OlivePass
    </div>
  </label>
  <input type="checkbox" id="op_showBody" checked hidden />
  <div id="op_body" page>
    <div id="op_login" class="op-page">
      <div class="op-h1">Log In</div>
      <p>
        <input type="email" id="op_loginAcct" placeholder="Account" />
        <input type="password" id="op_loginPass" placeholder="Password" />
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
        <input type="text" id="op_Nickname" placeholder="Nickname" />
        <input type="text" id="op_Url" placeholder="Url" />
        <input type="email" id="op_Acct" placeholder="Account" />
        <input type="password" id="op_Pass" placeholder="Password" />
        <br>
        <button id="op_newCredButton">Save</button>
        <button id="op_newCredCancel">Cancel</button>
    </div>
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
</style>
`