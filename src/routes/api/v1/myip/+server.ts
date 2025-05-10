import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { CORS_HEADER_OPTIONS } from '$lib/variable';

/**
 * Endpoint untuk mendapatkan informasi IP, negara, dan ISP pengguna.
 * Endpoint ini mirip dengan yang ada di original worker.
 */
export const GET: RequestHandler = async ({ request, fetch }) => {
  try {
    // Ambil data dari header request
    const ip = request.headers.get('cf-connecting-ipv6') || 
               request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-real-ip') || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               '127.0.0.1';
    
    const country = request.headers.get('cf-ipcountry') || 'Unknown';
    const colo = request.headers.get('cf-ray')?.split('-')[1] || '';
    
    // Coba dapatkan informasi ISP dari ipinfo.io (free tier)
    let asOrganization = 'Unknown';
    let city = '';
    let region = '';
    
    try {
      const ipinfoResponse = await fetch(`https://ipinfo.io/${ip}/json`);
      if (ipinfoResponse.ok) {
        const ipinfoData = await ipinfoResponse.json();
        asOrganization = ipinfoData.org || ipinfoData.asn || 'Unknown';
        city = ipinfoData.city || '';
        region = ipinfoData.region || '';
      }
    } catch (error) {
      console.error('Failed to fetch from ipinfo.io:', error);
    }
    
    // Format respons sesuai dengan yang diharapkan oleh frontend
    return json({
      ip,
      country,
      colo,
      city,
      region,
      asOrganization
    }, {
      headers: CORS_HEADER_OPTIONS
    });
  } catch (error) {
    console.error('Error in myip API:', error);
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