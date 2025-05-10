<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let proxyInfo: {
    proxyIP: string;
    proxyPort: string;
    country: string;
    org: string;
  };
  export let configs: string[] = [];
  
  const dispatch = createEventDispatcher<{
    copy: { config: string }
  }>();
  
  function copyConfig() {
    dispatch('copy', { config: configs.join('\n') });
  }
  
  // Fungsi untuk mendapatkan emoji bendera
  function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char: string) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  
  let isLoading = false;
  let pingResult = "Tekan untuk cek";
  
  async function checkProxyHealth() {
    isLoading = true;
    pingResult = "Checking...";
    
    try {
      const res = await fetch(`/check?target=${proxyInfo.proxyIP}:${proxyInfo.proxyPort}`);
      if (res.status === 200) {
        const data = await res.json();
        if (data.proxyip === true) {
          pingResult = `Active ${data.delay} ms (${data.colo})`;
        } else {
          pingResult = "Inactive";
        }
      } else {
        pingResult = "Check Failed!";
      }
    } catch (error) {
      pingResult = "Error!";
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="lozad transition bg-white dark:bg-neutral-900 scale-95 border-2 border-neutral-800 dark:border-white rounded-lg p-3 w-full max-w-sm flex flex-col gap-2">
  <div class="flex items-center justify-between border-b-2 border-neutral-800 dark:border-white pb-1">
    <div class="flex items-center gap-1">
      <span class="text-xl">{getFlagEmoji(proxyInfo.country)}</span>
      <span class="text-md font-semibold dark:text-white">{proxyInfo.country}</span>
    </div>
    <button
      on:click={copyConfig}
      class="bg-amber-400 text-neutral-800 font-semibold px-3 py-1 rounded-md hover:bg-amber-500 transition"
    >
      Copy
    </button>
  </div>
  
  <div class="text-sm dark:text-white">
    <p>IP: {proxyInfo.proxyIP}</p>
    <p>Port: {proxyInfo.proxyPort}</p>
    <p>ISP: {proxyInfo.org}</p>
  </div>
  
  <div class="mt-2">
    <button
      id="ping-button"
      on:click={checkProxyHealth}
      class="w-full py-1 px-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-md text-sm transition"
      class:bg-green-100={pingResult.includes("Active")}
      class:dark:bg-green-700={pingResult.includes("Active")}
      class:bg-red-100={pingResult === "Inactive"}
      class:dark:bg-red-700={pingResult === "Inactive"}
      disabled={isLoading}
    >
      {#if isLoading}
        <span class="animate-pulse">Checking...</span>
      {:else}
        <span class:text-green-700={pingResult.includes("Active")} class:dark:text-green-300={pingResult.includes("Active")}
              class:text-red-700={pingResult === "Inactive"} class:dark:text-red-300={pingResult === "Inactive"}
        >
          {pingResult}
        </span>
      {/if}
    </button>
  </div>
</div> 