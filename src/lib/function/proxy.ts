import { CORS_HEADER_OPTIONS, KV_PROXY_URL, PROXY_BANK_URL, PROXY_HEALTH_CHECK_API } from "$lib/variable";
import { runtimeState } from "$lib/variable";


export async function getKVProxyList(kvProxyUrl = KV_PROXY_URL) {
    if (!kvProxyUrl) {
        throw new Error("No KV Proxy URL Provided!");
    }

    const kvProxy = await fetch(kvProxyUrl);
    if (kvProxy.status == 200) {
        return await kvProxy.json();
    } else {
        return {};
    }
}


export async function getProxyList(proxyBankUrl = PROXY_BANK_URL) {
    if (!proxyBankUrl) {
      throw new Error("No Proxy Bank URL Provided!");
    }
  
    const proxyBank = await fetch(proxyBankUrl);
    if (proxyBank.status == 200) {
      const text = (await proxyBank.text()) || "";
  
      const proxyString = text.split("\n").filter(Boolean);
      runtimeState.cachedProxyList = proxyString
        .map((entry) => {
          const [proxyIP, proxyPort, country, org] = entry.split(",");
          return {
            proxyIP: proxyIP || "Unknown",
            proxyPort: proxyPort || "Unknown",
            country: country || "Unknown",
            org: org || "Unknown Org",
          };
        })
        .filter(Boolean);
    }
  
    return runtimeState.cachedProxyList;
  }

  export async function reverseProxy(
    request: Request, 
    target: string, 
    targetPath?: string
  ) {
    const targetUrl = new URL(request.url);
    const targetChunk = target.split(":");
  
    targetUrl.hostname = targetChunk[0];
    targetUrl.port = targetChunk[1]?.toString() || "443";
    targetUrl.pathname = targetPath || targetUrl.pathname;
  
    const modifiedRequest = new Request(targetUrl, request);
  
    modifiedRequest.headers.set("X-Forwarded-Host", request.headers.get("Host") || "");
  
    const response = await fetch(modifiedRequest);
  
    const newResponse = new Response(response.body, response);
    for (const [key, value] of Object.entries(CORS_HEADER_OPTIONS)) {
      newResponse.headers.set(key, value as string);
    }
    newResponse.headers.set("X-Proxied-By", "Cloudflare Worker");
  
    return newResponse;
  }

  /**
   * Memeriksa kesehatan proxy
   * @param proxyIP - IP dari proxy
   * @param proxyPort - Port dari proxy
   * @returns Status kesehatan proxy
   */
  export async function checkProxyHealth(proxyIP: string, proxyPort: string) {
    try {
      const req = await fetch(`${PROXY_HEALTH_CHECK_API}?ip=${proxyIP}:${proxyPort}`);
      return await req.json();
    } catch (error) {
      return { error: "Failed to check proxy health", details: error };
    }
  }
