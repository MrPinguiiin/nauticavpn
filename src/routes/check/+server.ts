import { CORS_HEADERS } from '$lib/config/constants'
import { ProxyService } from '$lib/services/proxy'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
    const target = url.searchParams.get('target')?.split(':')
    
    if (!target) {
        return new Response('Target parameter is required', { 
            status: 400,
            headers: CORS_HEADERS
        })
    }

    const proxyService = ProxyService.getInstance()
    const healthCheck = await proxyService.checkProxyHealth(target[0], target[1] || '443')

    return new Response(JSON.stringify(healthCheck), {
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
        }
    })
} 