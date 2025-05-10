// Import dependencies
import { config } from './config';
import { reverse } from '../function/utils';

// App constants
export const APP_DOMAIN = `${config.serviceName}.${config.rootDomain}`;
export const PORTS = [443, 80];
export const PROTOCOLS = [reverse("najort"), reverse("sselv"), reverse("ss")];

// URLs
export const KV_PROXY_URL = "https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/kvProxyList.json";
export const PROXY_BANK_URL = "https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/proxyList.txt";
export const PROXY_HEALTH_CHECK_API = "https://id1.foolvpn.me/api/v1/check";
export const CONVERTER_URL = "https://api.foolvpn.me/convert";
export const DONATE_LINK = "https://trakteer.id/dickymuliafiqri/tip";
export const BAD_WORDS_LIST =
  "https://gist.githubusercontent.com/adierebel/a69396d79b787b84d89b45002cb37cd6/raw/6df5f8728b18699496ad588b3953931078ab9cf1/kata-kasar.txt";

// Network settings
export const DNS_SERVER_ADDRESS = "8.8.8.8";
export const DNS_SERVER_PORT = 53;

// UI settings
export const PROXY_PER_PAGE = 24;

// WebSocket constants
export const WS_READY_STATE_OPEN = 1;
export const WS_READY_STATE_CLOSING = 2;

// CORS settings
export const CORS_HEADER_OPTIONS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};