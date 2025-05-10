/**
 * Aplikasi konfigurasi
 * File ini berisi semua konfigurasi yang bisa dikustomisasi oleh pengguna
 */

// Ganti nilai-nilai ini sesuai dengan konfigurasi Anda
export const config = {
  // Domain settings
  rootDomain: "badcode.biz.id",
  serviceName: "nautica",
  
  // Cloudflare settings
  cloudflare: {
    apiKey: "", 
    apiEmail: "",
    accountID: "",
    zoneID: ""
  }
};

// Runtime state variables
export let runtimeState = {
  isApiReady: false,
  proxyIP: "",
  cachedProxyList: [] as any[]
}; 