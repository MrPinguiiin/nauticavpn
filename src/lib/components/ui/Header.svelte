<script lang="ts">
  import { onMount } from 'svelte';
    import Button from './button/button.svelte';
    import { Globe, Shield } from '@lucide/svelte';
  
  export let ip: string = "127.0.0.1";
  export let country: string = "Unknown";
  export let isp: string = "Unknown";
  export let autoFetch: boolean = true;
  
  let isLoading = false;
  
  // Fungsi untuk mendapatkan info menggunakan server proxy
  async function checkGeoip() {
    if (isLoading) return;
    
    isLoading = true;
    
    // Coba beberapa sumber berbeda
    await Promise.all([
      tryDirectIpInfo()
    ]);
    
    isLoading = false;
  }
  
  async function tryDirectIpInfo() {
    try {
      const response = await fetch('https://ipinfo.io/json');
      
      if (response.ok) {
        const data = await response.json();
        
        // Update nilai
        ip = data.ip || ip;
        country = data.country || country;
        isp = data.org || isp;
        
        return true;
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
    return false;
  }
  
  
  onMount(() => {
    if (autoFetch) {
      checkGeoip();
    }
  });
</script>

<header class="\ border-b border-gray-800">
  <div class="container mx-auto px-4 py-3 flex justify-between items-center">
    <div class="flex items-center gap-2">
      <Shield class="h-6 w-6 text-rose-500" />
      <h1 class="text-xl font-bold">
        Nautica <span class="text-rose-500">x</span> badcode
      </h1>
    </div>

    <div class="flex items-center gap-8">
      <div class="hidden md:flex items-center gap-2 text-sm">
        <span>IP: {ip}</span>
        <span>•</span>
        <span>Country: {country}</span>
        <span>•</span>
        <span>ISP: {isp}</span>
      </div>
    </div>
  </div>
</header>