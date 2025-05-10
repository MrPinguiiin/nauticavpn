import { 
  PORTS, 
  PROTOCOLS, 
  PROXY_PER_PAGE 
} from "$lib/variable";
import { config } from "$lib/variable";
import { reverse } from "./utils";

// Fungsi untuk mendapatkan emoji bendera dari kode negara
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export async function getAllConfig(
  request: Request, 
  hostName: string, 
  proxyList: Array<{ proxyIP: string; proxyPort: string; country: string; org: string }>, 
  page: number = 0
): Promise<Response | string> {
  const startIndex = PROXY_PER_PAGE * page;
  const totalPages = Math.floor(proxyList.length / PROXY_PER_PAGE);

  try {
    const uuid = crypto.randomUUID();

    // Build URI
    const uri = new URL(`${reverse("najort")}://${hostName}`);
    uri.searchParams.set("encryption", "none");
    uri.searchParams.set("type", "ws");
    uri.searchParams.set("host", hostName);
    
    // Generate data for template
    const title = `Welcome to <span class='text-blue-500 font-semibold'>Nautica</span>`;
    const totalCount = proxyList.length;
    
    // Prepare data for displaying proxies
    const proxies = [];
    
    for (let i = startIndex; i < startIndex + PROXY_PER_PAGE; i++) {
      const proxy = proxyList[i];
      if (!proxy) break;

      const { proxyIP, proxyPort, country, org } = proxy;

      uri.searchParams.set("path", `/${proxyIP}-${proxyPort}`);

      const proxyConfigs = [];
      for (const port of PORTS) {
        uri.port = port.toString();
        uri.hash = `${i + 1} ${getFlagEmoji(country)} ${org} WS ${port == 443 ? "TLS" : "NTLS"} [${config.serviceName}]`;
        for (const protocol of PROTOCOLS) {
          // Special exceptions
          if (protocol === "ss") {
            uri.username = btoa(`none:${uuid}`);
            uri.searchParams.set(
              "plugin",
              `v2ray-plugin${
                port == 80 ? "" : ";tls"
              };mux=0;mode=websocket;path=/${proxyIP}-${proxyPort};host=${hostName}`
            );
          } else {
            uri.username = uuid;
            uri.searchParams.delete("plugin");
          }

          uri.protocol = protocol;
          uri.searchParams.set("security", port == 443 ? "tls" : "none");
          uri.searchParams.set("sni", port == 80 && protocol == reverse("sselv") ? "" : hostName);

          // Build VPN URI
          proxyConfigs.push(uri.toString());
        }
      }
      
      proxies.push({
        info: { proxyIP, proxyPort, country, org },
        urls: proxyConfigs
      });
    }
    
    // Build a list of available countries for filtering
    const countries = Array.from(new Set(proxyList.map(proxy => proxy.country)));
    
    // Prepare data for the Svelte components
    const templateData = {
      title,
      countries,
      proxies,
      pagination: {
        currentPage: page,
        totalPages,
        baseUrl: "/sub"
      },
      isApiReady: Boolean(config.cloudflare?.apiKey && 
                 config.cloudflare?.apiEmail && 
                 config.cloudflare?.accountID && 
                 config.cloudflare?.zoneID)
    };
    
    return JSON.stringify(templateData);
  } catch (error) {
    return new Response(`An error occurred while generating the ${reverse("SSELV")} configurations. ${error}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}