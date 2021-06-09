export enum Action {
  GET_DOMAIN_CREDS = "GET_DOMAIN_CREDS",
  CRED_PASS = "CRED_PASS",
  NEW_CRED = "NEW_CRED",
  LOGIN = "LOGIN"
}

export enum Result {
  LOGGED_OUT = "LOGGED_OUT",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export class Request {
  action: Action;
  body?: any;

  constructor(action:Action,body?:any) {
    this.action = action;
    this.body = body;
  }
}


export class Response {
  result: Result;
  body?: any;

  constructor(result:Result,body?:any) {
    this.result = result;
    this.body = body;
  }
}
