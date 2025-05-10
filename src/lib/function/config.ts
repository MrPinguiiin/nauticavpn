import { 
  PORTS, 
  PROTOCOLS, 
  PROXY_PER_PAGE 
} from "$lib/variable";
import { config } from "$lib/variable";
import { reverse } from "./utils";

// Perlu deklarasi Document
class Document {
  private title: string = "";
  private info: string[] = [];
  private proxies: any[] = [];
  private pageButtons: { label: string; url: string; disabled: boolean }[] = [];
  private request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  addInfo(info: string): void {
    this.info.push(info);
  }

  registerProxies(proxyInfo: { proxyIP: string; proxyPort: string; country: string; org: string }, proxyUrls: string[]): void {
    this.proxies.push({ info: proxyInfo, urls: proxyUrls });
  }

  addPageButton(label: string, url: string, disabled: boolean): void {
    this.pageButtons.push({ label, url, disabled });
  }

  build(): Response {
    // Implementasi sederhana untuk tujuan contoh
    const html = `
      <html>
        <head><title>${this.title}</title></head>
        <body>
          <h1>${this.title}</h1>
          <div>${this.info.join("<br>")}</div>
          <!-- Proxies and other content would be here -->
          <div class="pagination">
            ${this.pageButtons.map(btn => 
              `<a href="${btn.url}" ${btn.disabled ? 'disabled' : ''}>${btn.label}</a>`
            ).join("")}
          </div>
        </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  }
}

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
) {
    const startIndex = PROXY_PER_PAGE * page;
  
    try {
      const uuid = crypto.randomUUID();
  
      // Build URI
      const uri = new URL(`${reverse("najort")}://${hostName}`);
      uri.searchParams.set("encryption", "none");
      uri.searchParams.set("type", "ws");
      uri.searchParams.set("host", hostName);
  
      // Build HTML
      const document = new Document(request);
      document.setTitle("Welcome to <span class='text-blue-500 font-semibold'>Nautica</span>");
      document.addInfo(`Total: ${proxyList.length}`);
      document.addInfo(`Page: ${page}/${Math.floor(proxyList.length / PROXY_PER_PAGE)}`);
  
      for (let i = startIndex; i < startIndex + PROXY_PER_PAGE; i++) {
        const proxy = proxyList[i];
        if (!proxy) break;
  
        const { proxyIP, proxyPort, country, org } = proxy;
  
        uri.searchParams.set("path", `/${proxyIP}-${proxyPort}`);
  
        const proxies = [];
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
            proxies.push(uri.toString());
          }
        }
        document.registerProxies(
          {
            proxyIP,
            proxyPort,
            country,
            org,
          },
          proxies
        );
      }
  
      // Build pagination
      document.addPageButton("Prev", `/sub/${page > 0 ? page - 1 : 0}`, page > 0 ? false : true);
      document.addPageButton("Next", `/sub/${page + 1}`, page < Math.floor(proxyList.length / 10) ? false : true);
  
      return document.build();
    } catch (error) {
      return new Response(`An error occurred while generating the ${reverse("SSELV")} configurations. ${error}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }