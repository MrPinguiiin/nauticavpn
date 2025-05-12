import { CloudflareService } from '$lib/services/cloudflare'
import { CORS_HEADERS } from '$lib/config/constants'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
    const cloudflareService = new CloudflareService()
    const domains = await cloudflareService.getDomainList()

    return new Response(JSON.stringify(domains), {
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
        }
    })
} 