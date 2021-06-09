import QueryWatcher from './QueryWatcher';
import OpUi, { OpUiPresenter } from './OpUi'
import { Action, Request, Response, Result } from '@/lib/Messages';
import FieldsFilter from './FieldsFIlter';
import Credentials from '../../../model/Credentials';
import { Log } from './Utils';

function allCapVariants(string: string): string[] {
  let lower = string.toLowerCase();
  let upper = string.toUpperCase();
  let firstUpper = string[0].toUpperCase() + lower.slice(1);
  return [lower, upper, firstUpper];
}

let generalPossibleAttrs = ["type", "placeholder", "name", "id", "aria-label"];
function getPossibleAttrsWithVals(vals: string[]): string[] {
  let attrs:string[] = [];
  vals.forEach(v => {
    generalPossibleAttrs.forEach(a => attrs.push(`[${a}*="${v}"]`))
  })
  return attrs;
}

let acctPossibleVals = [
  ...allCapVariants("phone"),
  ...allCapVariants("login"),
  ...allCapVariants("email"),
  ...allCapVariants("user"),
]
let acctAttrs = getPossibleAttrsWithVals(acctPossibleVals);
let passAttrs = getPossibleAttrsWithVals(allCapVariants("password"));
let newAttrs = getPossibleAttrsWithVals(allCapVariants("new"));
let opNotAttrs = getPossibleAttrsWithVals([
  ...allCapVariants("op_"),
  ...allCapVariants("op-"),
]);

let acctNots = acctAttrs.map(a => `:not(${a})`).join("");
let passNots = passAttrs.map(a => `:not(${a})`).join("");
let newNots = newAttrs.map(a => `:not(${a})`).join("");
let opNots = opNotAttrs.map(a => `:not(${a})`).join("");
let typeNots = ['checkbox','submit','number','range',"hidden"].map(t=> `:not([type="${t}"])`).join("");
let globalNots = [...opNots,...typeNots,...newNots].join("");

let acctnameSelector = acctAttrs.map(a => `input${a}${globalNots}${passNots}`).join(", ");
let passwordSelector = passAttrs.map(a => `input${a}${globalNots}`).join(", ");

let loggedIn = true;
class Presenter implements OpUiPresenter {
  isLoggedIn(): boolean {
    return loggedIn;
  }
  saveNew(req: Request): void {
    saveCreds(req);
  }
  doLogin(req: Request): void {
    doLogin(req);
  }
  fetchCreds(): void {
    throw new Error('Method not implemented.');
  }
  onCredSelect(cred: Credentials) {
    insertCred(cred);
  }
}

const fieldsFilter = new FieldsFilter();
const passFieldWatcher = new QueryWatcher('input[type="password"]');
const acctFieldWatcher = new QueryWatcher(acctnameSelector);
let acctField: HTMLInputElement;
let passField: HTMLInputElement;
let creds: Credentials[] = [];
let ui: OpUi = new OpUi(document, new Presenter());


passFieldWatcher.matches.subscribe((els)=>{
  Log.info("Latest Pass Fields: ",els);
  updateFieldsFilter({pass:els})
})
acctFieldWatcher.matches.subscribe((els: Element[])=>{
  Log.info("Latest Acct Fields: ",els)
  updateFieldsFilter({acct:els})
})

function ready(callbackFunction:any) {
  if (document.readyState != 'loading')
    callbackFunction(event)
  else
    document.addEventListener("DOMContentLoaded", callbackFunction)
}
ready(() => {
  passFieldWatcher.beginWatching();
  acctFieldWatcher.beginWatching();
});



function updateFieldsFilter(fields: { acct?:Element[], pass?:Element[]}) {
  let res = fieldsFilter.updateFilter(fields);
  if (res.success) onNewLoginFieldsDetected(res.acctFields[0],res.passFields[0]);
  else {
    Log.info("Did not detect login fields.")
    ui.remove();
  }
}

function onNewLoginFieldsDetected(newAcctField: Element, newPassField: Element) {
  if (!(newAcctField instanceof HTMLInputElement)) throw new Error("Account field is not an input!");
  if (!(newPassField instanceof HTMLInputElement)) throw new Error("Password field is not an input!");

  Log.info("Login detected!");

  if (acctField != newAcctField) {
    acctField = newAcctField;
    // setUpInputValueListener(acctField, (val:string)=>{
    // });
    acctField.addEventListener("focus", ()=>{
      showCreds();
    })
    acctField.addEventListener("blur", ()=>{
      suggestNewCreds();
    })
  }
  if (passField != newPassField) {
    passField = newPassField;
    // setUpInputValueListener(passField, (val:string)=>{
    // });
    passField.addEventListener("focus", ()=>{
      showCreds();
    })
    passField.addEventListener("blur", ()=>{
      suggestNewCreds();
    })
  }

  ui.init();
  getAndShowCreds();
}


async function sendRequest(req:Request, onResponse: (res:Response)=>any) {
  ui.showLoading(true);
  await chrome.runtime.sendMessage(req, async function(res:Response) {
    if (res.result === Result.LOGGED_OUT) {
      loggedIn = false;
      uiToPage("login");
    }
    else onResponse(res);
    ui.showLoading(false);
  });
}

function setUpInputValueListener(f: HTMLInputElement, onUpdate:(val:string)=>any) {
  f.addEventListener("input",()=>onUpdate(f.value));
  f.addEventListener("change",()=>onUpdate(f.value));
}


function doLogin(req:Request) {
  sendRequest(req, function(response:Response) {
    if (response.result === Result.SUCCESS) {
      loggedIn = true;
      getAndShowCreds();
    }
  });
}


function getAndShowCreds() {
  sendRequest(new Request(Action.GET_DOMAIN_CREDS), function(response:Response) {
    if (response.result === Result.SUCCESS) {
      creds = response.body;
      ui.loadCreds(creds);
      uiToPage("list");
    }
  });
}

function showCreds() {
  uiToPage("list");
}

function insertCred(cred: Credentials) {
  sendRequest(new Request(Action.CRED_PASS, cred._id), (res)=>{
    if (res.result === Result.SUCCESS) {
      acctField.value = cred.accountIdentifier;
      passField.value = res.body;  
      ui.hide();  
    }
  })
}

function suggestNewCreds() {
  let passVal = passField.value;
  let acctVal = acctField.value;
  if (passVal && acctVal) {
    let exists = creds.find(c => c.accountIdentifier == acctVal);
    if(!exists) {
      ui.suggestNewCreds(passVal,acctVal);
    }
  }
}

function saveCreds(req:Request) {
  sendRequest(req, function(res:Response) {
    if (res.result === Result.SUCCESS) {
      creds.push(res.body);
      ui.loadCreds(creds);
      uiToPage("list");
    }
  });
}


function uiToPage(page: string) {
  if (!loggedIn) {
    page = "login";
  }
  ui.setPage(page);
}


