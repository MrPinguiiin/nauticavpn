import { CloudflareService } from '$lib/services/cloudflare'
import { CORS_HEADERS } from '$lib/config/constants'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ url }) => {
    const domain = url.searchParams.get('domain')
    
    if (!domain) {
        return new Response('Domain is required', { 
            status: 400,
            headers: CORS_HEADERS
        })
    }

    const cloudflareService = new CloudflareService()
    const status = await cloudflareService.registerDomain(domain)

    return new Response(null, { 
        status,
        headers: CORS_HEADERS
    })
} 