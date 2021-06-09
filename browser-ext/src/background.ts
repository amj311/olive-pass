import axios, { AxiosError, AxiosResponse } from 'axios'
import { parse } from 'dotenv';
import Credentials from '../../model/Credentials';
import { getHostName } from './content-scripts/Utils';
import { Action, Request, Response, Result } from './lib/Messages';


chrome.runtime.onMessage.addListener( function(request:any, sender:chrome.runtime.MessageSender, sendResponse: (res:Response)=>any) {
  if (request.type === "SIGN_CONNECT") {
    return console.log("Connected to sender:", sender.url);
  }

  let msgId = Date.now();
  console.log("MESSAGE "+msgId, {sender}, {request});
  
  let handler;
  switch (request.action) {
    case Action.GET_DOMAIN_CREDS:
      handler = getDomainCreds;
      break;
  
    case Action.CRED_PASS:
      handler = getCredPass;
      break;

    case Action.LOGIN:
      attemptLogin(sendResponse);
      break;
    
    case Action.NEW_CRED:
      handler = createCreds;
      break;
    
    default:
      handler = async function() {
        return new Response(Result.ERROR, "Invalid action.");
      };
      break;
  }
  
  if (handler) {
    handler(request, sender)
    .then(res=>{
      console.log("RESPONSE "+msgId, res);
      sendResponse(res);
    })
    .catch(err=>{
      console.log("RESPONSE "+msgId, err);
      sendResponse(new Response(Result.ERROR, err));
    });
  }
  else {
    console.log("RESPONSE "+msgId, "Handled by method.");
  }

  return true; // Inform Chrome that we will make a delayed sendResponse
});


async function api(method:"get"|"post"|"put"|"delete", path:string, body?:any): Promise<Response> {
  let config = {withCredentials:true};
  let apiRoot = process.env.NODE_ENV === "development" ?
    `http://localhost:${process.env.PORT || 3000}/api/` :
    "https://olive-pass.herokuapp.com/api/";

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

  let res = await handler(...args)
    .then((res:AxiosResponse<any>)=>{
      return new Response(Result.SUCCESS, res);
    })
    .catch((err:AxiosError)=>{
      console.log("Err:", err);
      let body:any = err;
      let result = Result.ERROR;
      if (err.response) {
        if (err.response.status === 401)  result = Result.LOGGED_OUT;
        body = err.response;
      }
      return new Response(result,body);
    });
  return res;
}

async function getDomainCreds(request: Request, sender: chrome.runtime.MessageSender): Promise<any> {
  let host = getHostName(<string>sender?.url);
  let res:Response = await api("get","creds/d/"+host);
  if (res.result===Result.SUCCESS) {
    res.body = res.body.data;
  }
  console.log(res);
  return res;
}

async function attemptLogin(sendResponse: (res:Response)=>any): Promise<any> {
  let win = window.open("popup.html", "OlivePass Login", "width=350,height=400,status=no,scrollbars=no,resizable=no");
  if (win) win.document.title = "OlivePass Login";
  let timer = setInterval(function() { 
    if (win?.closed) {
      clearInterval(timer);
      sendResponse(new Response(Result.ERROR, "Window was closed!"));
    }
    if(win?.location.href.includes("app")) {
        clearInterval(timer);
        win.close();
        sendResponse(new Response(Result.SUCCESS));
    }
  }, 1000);
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
