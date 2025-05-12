import { ProxyService } from '$lib/services/proxy'
import { CORS_HEADERS } from '$lib/config/constants'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
    const proxyService = ProxyService.getInstance()
    const ipPort = url.searchParams.get('ip')
    
    if (!ipPort) {
        return new Response('IP:Port parameter is required', { 
            status: 400,
            headers: CORS_HEADERS
        })
    }

    const [proxyIP, proxyPort] = ipPort.split(':')
    const healthCheck = await proxyService.checkProxyHealth(proxyIP, proxyPort)

    return new Response(JSON.stringify(healthCheck), {
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
        }
    })
} 