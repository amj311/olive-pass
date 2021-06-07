export enum Action {
  GET_DOMAIN_CREDS,
  CRED_PASS,
  NEW_CRED,
  LOGIN
}

export enum Result {
  LOGGED_OUT,
  SUCCESS,
  ERROR,
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
