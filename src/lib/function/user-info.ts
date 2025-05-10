/**
 * Informasi pengguna
 */
export interface UserInfo {
  ip: string;
  country: string;
  isp: string;
  timestamp?: number;
}

// Cache untuk informasi pengguna (client-side)
let userInfoCache: UserInfo | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit dalam milidetik

/**
 * Fungsi untuk mendapatkan informasi pengguna seperti IP, lokasi, dan ISP
 * @param forceRefresh Jika true, akan mengabaikan cache dan mengambil data baru dari server
 */
export async function getUserInfo(forceRefresh = false): Promise<UserInfo> {
  // Cek cache jika tidak dipaksa untuk refresh
  if (!forceRefresh && userInfoCache && Date.now() - (userInfoCache.timestamp || 0) < CACHE_DURATION) {
    return userInfoCache;
  }
  
  try {
    const response = await fetch('/api/user-info');
    if (response.ok) {
      const data = await response.json();
      const userInfo: UserInfo = {
        ip: data.ip || '127.0.0.1',
        country: data.country || 'Unknown',
        isp: data.asOrganization || data.org || 'Unknown',
        timestamp: Date.now()
      };
      
      // Simpan ke cache
      userInfoCache = userInfo;
      return userInfo;
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error);
  }
  
  // Nilai default jika gagal mengambil data
  const defaultInfo: UserInfo = {
    ip: '127.0.0.1',
    country: 'Unknown',
    isp: 'Unknown',
    timestamp: Date.now()
  };
  
  // Update cache jika belum ada cache
  if (!userInfoCache) {
    userInfoCache = defaultInfo;
  }
  
  return defaultInfo;
} 