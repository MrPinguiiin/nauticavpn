import { KV_PROXY_URL, PROXY_BANK_URL, PROXY_HEALTH_CHECK_API } from '$lib/config/constants'
import type { ProxyHealthCheck, ProxyInfo, ProxyListResponse } from '$lib/types'

export class ProxyService {
    private static instance: ProxyService
    private cachedProxyList: ProxyInfo[] = []

    private constructor() {}

    static getInstance(): ProxyService {
        if (!ProxyService.instance) {
            ProxyService.instance = new ProxyService()
        }
        return ProxyService.instance
    }

    async getKVProxyList(): Promise<ProxyListResponse> {
        try {
            const response = await fetch(KV_PROXY_URL)
            if (!response.ok) {
                throw new Error('Failed to fetch KV proxy list')
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching KV proxy list:', error)
            return {}
        }
    }

    async getProxyList(): Promise<ProxyInfo[]> {
        try {
            const response = await fetch(PROXY_BANK_URL)
            if (!response.ok) {
                throw new Error('Failed to fetch proxy list')
            }

            const text = await response.text()
            const proxyString = text.split('\n').filter(Boolean)
            
            this.cachedProxyList = proxyString
                .map(entry => {
                    const [proxyIP, proxyPort, country, org] = entry.split(',')
                    return {
                        proxyIP: proxyIP || 'Unknown',
                        proxyPort: proxyPort || 'Unknown',
                        country: country || 'Unknown',
                        org: org || 'Unknown Org'
                    }
                })
                .filter(Boolean)

            return this.cachedProxyList
        } catch (error) {
            console.error('Error fetching proxy list:', error)
            return []
        }
    }

    async checkProxyHealth(proxyIP: string, proxyPort: string): Promise<any> {
        try {
            const response = await fetch(`${PROXY_HEALTH_CHECK_API}?ip=${proxyIP}:${proxyPort}`)
            return await response.json()
        } catch (error) {
            console.error('Error checking proxy health:', error)
            return {
                proxyip: false,
                delay: 0,
                colo: 'Error'
            }
        }
    }

    getCachedProxyList(): ProxyInfo[] {
        return this.cachedProxyList
    }

    filterProxyByCountry(countryCode: string): ProxyInfo[] {
        return this.cachedProxyList.filter(proxy => proxy.country === countryCode)
    }
} 