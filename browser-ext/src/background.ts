import axios, { AxiosError, AxiosResponse } from 'axios'
import { parse } from 'dotenv';
import Credentials from '../../model/Credentials';
import { getHostName } from './content-scripts/Utils';
import { Action, Request, Response, Result } from './lib/Messages';


chrome.runtime.onMessage.addListener( async function(request:any, sender:chrome.runtime.MessageSender, sendResponse: (res:Response)=>any) {
  if (request.type === "SIGN_CONNECT") {
    return console.log("Connected to sender:", sender.url);
  }
  
  let msgId = Date.now();
  console.log("MESSAGE "+msgId, {sender}, {request});
  
  let res: Response = new Response(Result.ERROR, "Invalid action.");
  switch (request.action) {
    case Action.GET_DOMAIN_CREDS:
      res = await getDomainCreds(request, sender);
      break;
  
    case Action.CRED_PASS:
      res = await getCredPass(request, sender);
      break;

    case Action.LOGIN:
      res = await attemptLogin(request, sender);
      break;
    
    case Action.NEW_CRED:
      res = await createCreds(request, sender);
      break;
    
    default:
      break;
  }
  
  console.log("RESPONSE "+msgId, res);
  sendResponse(res);
});


async function api(method:"get"|"post"|"put"|"delete", path:string, body?:any): Promise<Response> {
  let config = {withCredentials:true};
  let apiRoot = "http://localhost:3000/api/";
  let url= apiRoot+path;
  let handler: any;
  let args: any[];
  switch (method) {
    case "get":
      handler = await axios.get;
      args = [url, config];
      break;
    
    case "post":
      handler = await axios.post;
      args = [url, body, config];
      break;
  
    case "put":
      handler = await axios.put;
      args = [url, body, config];
      break;

    case "delete":
      handler = await axios.delete;
      args = [url, config];
      break;
  }

  return new Promise<Response>( (resolve, reject)=>{
    handler(...args)
      .then((res:AxiosResponse<any>)=>{
        resolve( new Response(Result.SUCCESS, res));
      })
      .catch((err:AxiosError)=>{
        let body:any = err;
        let result = Result.ERROR;
        if (err.response) {
          if (err.response.status === 401)  result = Result.LOGGED_OUT;
          body = err.response;
        }
        resolve(new Response(result,body));
      })
  });
}

async function getDomainCreds(request: Request, sender: chrome.runtime.MessageSender): Promise<any> {
  let host = getHostName(<string>sender?.url);
  console.log(host);
  let res:Response = await api("get","creds/d/"+host);
  if (res.result===Result.SUCCESS) {
    res.body = res.body.data;
  }
  return res;
}

async function attemptLogin(request: Request, sender: chrome.runtime.MessageSender): Promise<any> {
  let res:Response = await api("post","login",request.body);
  if (res.result===Result.SUCCESS) return new Response(Result.SUCCESS,res.body.data);
  return res;
}

async function createCreds(request: Request, sender: chrome.runtime.MessageSender): Promise<any> {
  let cred = {...request.body};
  cred.url = cred.url || sender.url;
  let res:Response = await api("post","creds/create",cred);
  if (res.result===Result.SUCCESS) return new Response(Result.SUCCESS,res.body.data);
  return res;
}

async function getCredPass(request: Request, sender: chrome.runtime.MessageSender): Promise<any> {
  let res:Response = await api("get","creds/p/"+request.body);
  if (res.result===Result.SUCCESS) return new Response(Result.SUCCESS,res.body.data);
  return res;
}
