<script lang="ts">
  import { onMount } from 'svelte';
  import Button from './button/button.svelte';
  import { Globe, Shield } from '@lucide/svelte';
  
  const runes = true;
  
  // Props dengan runes
  const props = $props<{ autoFetch?: boolean }>();
  const autoFetch = props.autoFetch ?? true;
  
  // User info state with runes
  let ip = $state("127.0.0.1");
  let country = $state("Unknown");
  let isp = $state("Unknown");
  let isLoading = $state(false);
  
  // Fungsi untuk mendapatkan info menggunakan server proxy
  async function checkGeoip() {
    if (isLoading) return;
    
    isLoading = true;
    
    try {
      const response = await fetch('https://ipinfo.io/json');
      
      if (response.ok) {
        const data = await response.json();
        
        // Update nilai dengan data
        ip = data.ip || ip;
        country = data.country || country;
        isp = data.org || isp;
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    } finally {
      isLoading = false;
    }
  }
  
  onMount(() => {
    if (autoFetch) {
      checkGeoip();
    }
  });
</script>

<header class="border-b border-gray-800">
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
      <Button
        variant="ghost"
        size="sm"
        class="text-rose-500 hover:text-rose-400"
        onclick={checkGeoip}
      >
        <Globe class="h-4 w-4 mr-2" />
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  </div>
</header>