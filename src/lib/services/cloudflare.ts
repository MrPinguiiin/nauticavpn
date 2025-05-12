import { CF_ACCOUNT_ID, CF_API_EMAIL, CF_API_KEY, CF_ZONE_ID, SERVICE_NAME } from '$lib/config/constants'
import type { CloudflareDomainResponse } from '$lib/types'

export class CloudflareService {
    private headers: HeadersInit

    constructor() {
        this.headers = {
            'Authorization': `Bearer ${CF_API_KEY}`,
            'X-Auth-Email': CF_API_EMAIL,
            'X-Auth-Key': CF_API_KEY
        }
    }

    async getDomainList(): Promise<string[]> {
        try {
            const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/domains`
            const response = await fetch(url, {
                headers: this.headers
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json() as CloudflareDomainResponse
            return data.result
                .filter(domain => domain.service === SERVICE_NAME)
                .map(domain => domain.hostname)
        } catch (error) {
            console.error('Error fetching domain list:', error)
            return []
        }
    }

    async registerDomain(domain: string): Promise<number> {
        try {
            const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/domains`
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    ...this.headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    environment: 'production',
                    hostname: domain,
                    service: SERVICE_NAME,
                    zone_id: CF_ZONE_ID
                })
            })

            return response.status
        } catch (error) {
            console.error('Error registering domain:', error)
            return 500
        }
    }
} 