export function getHostName(url:string): string|null {
  let trunc = url;
    if (trunc.startsWith("http")) trunc = trunc.split("//")[1];
    if (trunc.includes("/")) trunc = trunc.split("/")[0];
    if (trunc.startsWith("www.")) trunc = trunc.split("www.")[1];
    return trunc;
}

export class Log {
  private static TAG:string = "OP";
  public static info(...args:any[]) {
    console.info(`[${this.TAG}]`, ...args);
  }
  public static warn(...args:any[]) {
    console.warn(`[${this.TAG}]`, ...args);
  }
  public static error(...args:any[]) {
    console.error(`[${this.TAG}]`, ...args);
  }
}