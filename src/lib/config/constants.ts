// Constants and Configuration

// Domain Configuration
export const ROOT_DOMAIN = 'foolvpn.me'
export const SERVICE_NAME = 'nautica'
export const APP_DOMAIN = `${SERVICE_NAME}.${ROOT_DOMAIN}`

// Cloudflare API Configuration
export const CF_API_KEY = import.meta.env.VITE_CF_API_KEY || ''
export const CF_API_EMAIL = import.meta.env.VITE_CF_API_EMAIL || ''
export const CF_ACCOUNT_ID = import.meta.env.VITE_CF_ACCOUNT_ID || ''
export const CF_ZONE_ID = import.meta.env.VITE_CF_ZONE_ID || ''

// Network Configuration
export const PORTS = [443, 80] as const
export const PROTOCOLS = ['trojan', 'vless', 'ss'] as const

// API Endpoints
export const KV_PROXY_URL = 'https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/kvProxyList.json'
export const PROXY_BANK_URL = 'https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/proxyList.txt'
export const DNS_SERVER = {
    ADDRESS: '8.8.8.8',
    PORT: 53
}

// External Services
export const PROXY_HEALTH_CHECK_API = 'https://id1.foolvpn.me/api/v1/check'
export const CONVERTER_URL = 'https://api.foolvpn.me/convert'
export const DONATE_LINK = 'https://trakteer.id/dickymuliafiqri/tip'
export const BAD_WORDS_LIST = 'https://gist.githubusercontent.com/adierebel/a69396d79b787b84d89b45002cb37cd6/raw/6df5f8728b18699496ad588b3953931078ab9cf1/kata-kasar.txt'

// UI Configuration
export const PROXY_PER_PAGE = 24

// WebSocket States
export const WS_STATES = {
    OPEN: 1,
    CLOSING: 2
} as const

// CORS Configuration
export const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400'
} 