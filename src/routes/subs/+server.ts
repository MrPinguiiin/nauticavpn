import { CORS_HEADER_OPTIONS } from "$lib/variable";
import { config, runtimeState } from "$lib/variable";
import { getAllConfig } from "$lib/function/config";
import { getProxyList, reverseProxy, checkProxyHealth } from "$lib/function/proxy";
import { websocketHandler } from "$lib/function/websocket";
import { CloudflareApi } from "$lib/function/cloudflare-api";
import { shuffleArray } from "$lib/function/utils";
import type { RequestHandler } from "@sveltejs/kit";

// Memeriksa apakah API siap untuk digunakan
function checkApiReady(): boolean {
  if (config.cloudflare.apiKey && 
      config.cloudflare.apiEmail && 
      config.cloudflare.accountID && 
      config.cloudflare.zoneID) {
    runtimeState.isApiReady = true;
    return true;
  }
  return false;
}

// Handler untuk semua jenis request ke endpoint
export const GET: RequestHandler = async ({ request, url, fetch }) => {
  try {
    const upgradeHeader = request.headers.get("Upgrade");
    checkApiReady();

    // Handle WebSocket
    if (upgradeHeader === "websocket") {
      const proxyMatch = url.pathname.match(/^\/(.+[:=-]\d+)$/);

      if (url.pathname.length === 3 || url.pathname.match(",")) {
        // Contoh: /ID, /SG, dll
        const proxyKeys = url.pathname.replace("/", "").toUpperCase().split(",");
        const proxyKey = proxyKeys[Math.floor(Math.random() * proxyKeys.length)];
        
        // Mendapatkan daftar proxy dari KV
        const kvProxyList = await fetch(url.origin + "/api/kv-proxy").then(res => res.json());
        runtimeState.proxyIP = kvProxyList[proxyKey][Math.floor(Math.random() * kvProxyList[proxyKey].length)];

        return websocketHandler(request);
      } else if (proxyMatch) {
        runtimeState.proxyIP = proxyMatch[1];
        return websocketHandler(request);
      }
    }

    // Sub route
    if (url.pathname.startsWith("/sub")) {
      const page = url.pathname.match(/^\/sub\/(\d+)$/);
      const pageIndex = parseInt(page ? page[1] : "0");
      const hostname = request.headers.get("Host") || "";

      // Queries
      const countrySelect = url.searchParams.get("cc")?.split(",");
      const proxyBankUrl = url.searchParams.get("proxy-list") || undefined;
      
      // Get proxy list
      let proxyList = await getProxyList(proxyBankUrl);
      
      // Filter by country if needed
      if (countrySelect && countrySelect.length > 0) {
        proxyList = proxyList.filter((proxy) => countrySelect.includes(proxy.country));
      }

      // Generate config
      const result = await getAllConfig(request, hostname, proxyList, pageIndex);
      return result;
    } 
    // Check proxy health
    else if (url.pathname.startsWith("/check")) {
      const target = url.searchParams.get("target")?.split(":") || [];
      if (target.length === 0) {
        return new Response("Missing target parameter", { status: 400 });
      }
      
      const result = await checkProxyHealth(target[0], target[1] || "443");
      return new Response(JSON.stringify(result), {
        headers: {
          ...CORS_HEADER_OPTIONS,
          "Content-Type": "application/json",
        },
      });
    } 
    // API v1 route
    else if (url.pathname.startsWith("/api/v1")) {
      return handleApiV1(request, url);
    } 
    // Default reverse proxy
    else {
      const targetReverseProxy = "example.com"; // Default target
      return await reverseProxy(request, targetReverseProxy);
    }
  } catch (err: any) {
    return new Response(`An error occurred: ${err.toString()}`, {
      status: 500,
      headers: {
        ...CORS_HEADER_OPTIONS,
      },
    });
  }
};

// Handler untuk endpoint API v1
async function handleApiV1(request: Request, url: URL): Promise<Response> {
  const apiPath = url.pathname.replace("/api/v1", "");

  // Domain management API
  if (apiPath.startsWith("/domains")) {
    if (!runtimeState.isApiReady) {
      return new Response("Api not ready", { status: 500 });
    }

    const wildcardApiPath = apiPath.replace("/domains", "");
    const cloudflareApi = new CloudflareApi();

    if (wildcardApiPath === "/get") {
      const domains = await cloudflareApi.getDomainList();
      return new Response(JSON.stringify(domains), {
        headers: {
          ...CORS_HEADER_OPTIONS,
        },
      });
    } else if (wildcardApiPath === "/put") {
      const domain = url.searchParams.get("domain");
      if (!domain) {
        return new Response("Missing domain parameter", { status: 400 });
      }
      
      const register = await cloudflareApi.registerDomain(domain);
      return new Response(register.toString(), {
        status: register,
        headers: {
          ...CORS_HEADER_OPTIONS,
        },
      });
    }
  } 
  // Sub API - for subscription links
  else if (apiPath.startsWith("/sub")) {
    return handleSubApi(request, url);
  } 
  // My IP API
  else if (apiPath.startsWith("/myip")) {
    return new Response(
      JSON.stringify({
        ip: request.headers.get("cf-connecting-ipv6") ||
            request.headers.get("cf-connecting-ip") ||
            request.headers.get("x-real-ip"),
        colo: request.headers.get("cf-ray")?.split("-")[1]
        // Cloudflare specific data removed as it's not available in standard Request objects
      }),
      {
        headers: {
          ...CORS_HEADER_OPTIONS,
          "Content-Type": "application/json"
        },
      }
    );
  }

  return new Response("Not found", { status: 404 });
}

// Handler untuk API Subscription
async function handleSubApi(request: Request, url: URL): Promise<Response> {
  const { PORTS, PROTOCOLS, CONVERTER_URL } = await import("$lib/variable");
  const { reverse } = await import("$lib/function/utils");
  const APP_DOMAIN = `${config.serviceName}.${config.rootDomain}`;

  // Get parameters
  const filterCC = url.searchParams.get("cc")?.split(",") || [];
  const filterPort = url.searchParams.get("port")?.split(",")?.map(Number) || PORTS;
  const filterVPN = url.searchParams.get("vpn")?.split(",") || PROTOCOLS;
  const filterLimit = parseInt(url.searchParams.get("limit") || "10");
  const filterFormat = url.searchParams.get("format") || "raw";
  const fillerDomain = url.searchParams.get("domain") || APP_DOMAIN;

  // Get proxy list
  const proxyBankUrl = url.searchParams.get("proxy-list") || undefined;
  let proxyList = await getProxyList(proxyBankUrl);
  
  // Filter by country if needed
  if (filterCC.length > 0) {
    proxyList = proxyList.filter((proxy) => filterCC.includes(proxy.country));
  }
  
  // Shuffle the list
  shuffleArray(proxyList);

  // Generate config
  const uuid = crypto.randomUUID();
  const result = [];
  
  // Generate config for each proxy
  for (const proxy of proxyList) {
    const uri = new URL(`${reverse("najort")}://${fillerDomain}`);
    uri.searchParams.set("encryption", "none");
    uri.searchParams.set("type", "ws");
    uri.searchParams.set("host", APP_DOMAIN);

    for (const port of filterPort) {
      for (const protocol of filterVPN) {
        if (result.length >= filterLimit) break;

        uri.protocol = protocol;
        uri.port = port.toString();
        if (protocol === "ss") {
          uri.username = btoa(`none:${uuid}`);
          uri.searchParams.set(
            "plugin",
            `v2ray-plugin${port === 80 ? "" : ";tls"};mux=0;mode=websocket;path=/${proxy.proxyIP}-${
              proxy.proxyPort
            };host=${APP_DOMAIN}`
          );
        } else {
          uri.username = uuid;
        }

        uri.searchParams.set("security", port === 443 ? "tls" : "none");
        uri.searchParams.set("sni", port === 80 && protocol === reverse("sselv") ? "" : APP_DOMAIN);
        uri.searchParams.set("path", `/${proxy.proxyIP}-${proxy.proxyPort}`);

        uri.hash = `${result.length + 1} ${getFlagEmoji(proxy.country)} ${proxy.org} WS ${
          port === 443 ? "TLS" : "NTLS"
        } [${config.serviceName}]`;
        result.push(uri.toString());
      }
    }
  }

  // Format results
  let finalResult = "";
  switch (filterFormat) {
    case "raw":
      finalResult = result.join("\n");
      break;
    case "v2ray":
      finalResult = btoa(result.join("\n"));
      break;
    case "clash":
    case "sfa":
    case "bfr":
      try {
        const res = await fetch(CONVERTER_URL, {
          method: "POST",
          body: JSON.stringify({
            url: result.join(","),
            format: filterFormat,
            template: "cf",
          }),
        });
        
        if (res.status === 200) {
          finalResult = await res.text();
        } else {
          return new Response(res.statusText, {
            status: res.status,
            headers: {
              ...CORS_HEADER_OPTIONS,
            },
          });
        }
      } catch (error) {
        return new Response(`Conversion error: ${error}`, {
          status: 500,
          headers: {
            ...CORS_HEADER_OPTIONS,
          },
        });
      }
      break;
  }

  return new Response(finalResult, {
    headers: {
      ...CORS_HEADER_OPTIONS,
      "Content-Type": "text/plain"
    },
  });
}

/**
 * Mendapatkan emoji bendera dari kode negara
 */
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
} 