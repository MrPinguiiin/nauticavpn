// Proxy Types
export interface ProxyInfo {
    proxyIP: string
    proxyPort: string | number
    country: string
    org: string
}

export interface ProxyListResponse {
    [key: string]: string[]
}

export interface ProxyHealthCheck {
    proxyip: boolean
    delay: number
    colo: string
}

// Cloudflare API Types
export interface CloudflareDomainResponse {
    result: {
        service: string
        hostname: string
    }[]
}

// WebSocket Types
export interface WebSocketHeader {
    hasError: boolean
    message?: string
    addressRemote: string
    addressType: number
    portRemote: number
    rawDataIndex: number
    rawClientData: ArrayBuffer
    version: Uint8Array | null
    isUDP: boolean
}

// Protocol Types
export type Protocol = 'trojan' | 'vless' | 'ss'
export type Port = 80 | 443

// Config Types
export interface ConfigFormat {
    url: string
    format: 'clash' | 'sfa' | 'bfr' | 'v2ray'
    template: string
}

// API Response Types
export interface APIResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
} 