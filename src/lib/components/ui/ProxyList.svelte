<script lang="ts">
  import ProxyCard from './ProxyCard.svelte';
  import { createEventDispatcher } from 'svelte';
  
  const runes = true;
  
  // Props dengan runes
  const props = $props<{
    proxies: Array<{
      info: {
        proxyIP: string;
        proxyPort: string;
        country: string;
        org: string;
      };
      urls: string[];
    }>;
    filteredByCountry?: string | null;
  }>();
  
  const dispatch = createEventDispatcher<{
    copy: { config: string }
  }>();
  
  function handleCopy(event: CustomEvent<{ config: string }>) {
    dispatch('copy', { config: event.detail.config });
  }
</script>

<div class="flex flex-wrap gap-6 pt-6 justify-center">
  {#if props.proxies.length === 0}
    <div class="bg-gray-100 dark:bg-gray-800 p-8 rounded-md text-center">
      <p class="text-lg dark:text-white">Tidak ada proxy ditemukan</p>
      <p class="text-sm text-gray-500 dark:text-gray-300 mt-2">Silahkan pilih region lain</p>
    </div>
  {:else}
    {#each props.proxies as proxy}
      <div class="transform transition-all duration-300 hover:scale-105">
        <ProxyCard 
          proxyInfo={proxy.info} 
          configs={proxy.urls}
          on:copy={handleCopy}
        />
      </div>
    {/each}
  {/if}
</div> 