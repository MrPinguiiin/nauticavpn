import { ProxyService } from '$lib/services/proxy'
import { CORS_HEADERS } from '$lib/config/constants'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
    const proxyService = ProxyService.getInstance()
    const countryCode = url.searchParams.get('cc')
    
    let proxyList = await proxyService.getProxyList()
    
    if (countryCode) {
        proxyList = proxyService.filterProxyByCountry(countryCode)
    }

    return new Response(JSON.stringify(proxyList), {
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
        }
    })
} 