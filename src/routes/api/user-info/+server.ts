import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { CORS_HEADER_OPTIONS } from '$lib/variable';

export const GET: RequestHandler = async ({ request, fetch }) => {
  try {
    try {
      const myipResponse = await fetch('/api/v1/myip');
      if (myipResponse.ok) {
        const data = await myipResponse.json();
        return json(data, {
          headers: CORS_HEADER_OPTIONS
        });
      }
    } catch (error) {
      console.error('Failed to fetch from myip API:', error);
    }
    
    const ip = request.headers.get('cf-connecting-ipv6') || 
               request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-real-ip') || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               '127.0.0.1';
    
    const country = request.headers.get('cf-ipcountry') || 'Unknown';
    const colo = request.headers.get('cf-ray')?.split('-')[1] || '';
    
    return json({
      ip,
      country,
      colo,
      asOrganization: 'Unknown'
    }, {
      headers: CORS_HEADER_OPTIONS
    });
  } catch (error) {
    console.error('Error in user-info API:', error);
    return json({
      ip: '127.0.0.1',
      country: 'Unknown',
      asOrganization: 'Unknown',
      error: String(error)
    }, {
      status: 500,
      headers: CORS_HEADER_OPTIONS
    });
  }
}; 