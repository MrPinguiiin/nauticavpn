<script lang="ts">
  import ProxyCard from './ProxyCard.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let proxies: Array<{
    info: {
      proxyIP: string;
      proxyPort: string;
      country: string;
      org: string;
    };
    urls: string[];
  }> = [];
  
  const dispatch = createEventDispatcher<{
    copy: { config: string }
  }>();
  
  function handleCopy(event: CustomEvent<{ config: string }>) {
    dispatch('copy', { config: event.detail.config });
  }
</script>

<div class="flex flex-wrap gap-6 pt-10 w-screen justify-center">
  {#each proxies as proxy}
    <ProxyCard 
      proxyInfo={proxy.info} 
      configs={proxy.urls}
      on:copy={handleCopy}
    />
  {/each}
</div> 