import { config } from "$lib/variable";
import { getAllConfig } from "$lib/function/config";
import { getProxyList } from "$lib/function/proxy";
import type { ServerLoad } from "@sveltejs/kit";

/**
 * Load function untuk menyediakan data ke komponen frontend
 */
export const load: ServerLoad = async ({ request, url, fetch }) => {
  // Sub route
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

  // Jika result adalah Response, ambil textnya
  if (result instanceof Response) {
    const html = await result.text();
    return { html };
  }
  
  // Jika result adalah string
  return { html: result };
}; 