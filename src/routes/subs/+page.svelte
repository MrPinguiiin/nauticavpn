<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/ui/Header.svelte';
  import TitleBar from '$lib/components/ui/TitleBar.svelte';
  import CountrySelector from '$lib/components/ui/CountrySelector.svelte';
  import ProxyList from '$lib/components/ui/ProxyList.svelte';
  import Pagination from '$lib/components/ui/Pagination.svelte';
  import Footer from '$lib/components/ui/Footer.svelte';
  import Notification from '$lib/components/ui/Notification.svelte';
  import InfoWindow from '$lib/components/ui/InfoWindow.svelte';
  import OutputFormat from '$lib/components/ui/OutputFormat.svelte';
  import WildcardsWindow from '$lib/components/ui/WildcardsWindow.svelte';
  
  export let data;
  
  let pageData: {
    title: string;
    countries: string[];
    proxies: Array<{
      info: {
        proxyIP: string;
        proxyPort: string;
        country: string;
        org: string;
      };
      urls: string[];
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      baseUrl: string;
    };
    isApiReady: boolean;
  };
  
  let selectedCountry: string | null = null;
  let showNotification = false;
  let showInfoWindow = false;
  let showOutputWindow = false;
  let showWildcardsWindow = false;
  let infoText = "";
  let rawConfig = "";
  
  // Parse data from server
  $: {
    try {
      pageData = JSON.parse(data.html);
    } catch (e) {
      console.error("Error parsing data:", e);
    }
  }
  
  function handleCopy(event: CustomEvent<{ config: string }>) {
    rawConfig = event.detail.config;
    showOutputWindow = true;
    showInfoWindow = true;
    infoText = "Select output:";
  }
  
  function handleToggleDarkMode() {
    const htmlElement = document.getElementById("html");
    if (htmlElement) {
      htmlElement.classList.toggle("dark");
    }
  }
  
  function handleToggleWildcards() {
    showWildcardsWindow = !showWildcardsWindow;
    showInfoWindow = showWildcardsWindow;
    if (showWildcardsWindow) {
      infoText = "Domain list";
    }
  }
  
  function handleCloseOutputWindow() {
    showOutputWindow = false;
    showInfoWindow = false;
  }
  
  function handleRawCopy() {
    navigator.clipboard.writeText(rawConfig);
    showOutputWindow = false;
    showInfoWindow = false;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 2000);
  }
  
  async function handleFormatCopy(event: CustomEvent<{ format: string }>) {
    const format = event.detail.format;
    infoText = "Generating config...";
    
    try {
      // TODO: Get the converter URL from config
      const converterUrl = "https://script.google.com/macros/s/AKfycbwwVeHNUlnP92syOP82p1dOk_-xwBgRIxkTjLhxxZ5UXicrGOEVNc5JaSOu0Bgsx_gG/exec";
      
      const res = await fetch(converterUrl, {
        method: "POST",
        body: JSON.stringify({
          url: rawConfig,
          format,
          template: "cf",
        }),
      });
      
      if (res.status === 200) {
        const configText = await res.text();
        navigator.clipboard.writeText(configText);
        infoText = "Done!";
        
        showNotification = true;
        setTimeout(() => {
          showNotification = false;
          showOutputWindow = false;
          showInfoWindow = false;
        }, 2000);
      } else {
        infoText = `Error ${res.statusText}`;
      }
    } catch (error) {
      infoText = "Error generating config";
    }
  }
  
  function handleUpdateInfo(event: CustomEvent<{ text: string }>) {
    infoText = event.detail.text;
  }
  
  onMount(() => {
    // Initialize lazy loading for images
    if (typeof window !== 'undefined') {
      const lozad = (window as any).lozad;
      if (lozad) {
        const observer = lozad(".lozad", {
          load: (el: HTMLElement) => {
            el.classList.remove("scale-95");
          },
        });
        observer.observe();
      }
    }
  });
</script>

<svelte:head>
  <title>Nautica VPN</title>
  <meta name="description" content="NauticaVPN - Proxy Manager" />
  <link rel="stylesheet" href="https://cdn.tailwindcss.com" />
  <script src="https://cdn.jsdelivr.net/npm/lozad/dist/lozad.min.js"></script>
  <style>
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</svelte:head>

{#if pageData}
  <div class="bg-white dark:bg-neutral-800 bg-fixed min-h-screen">
    <!-- Notification -->
    <Notification 
      isVisible={showNotification} 
      message="Akun berhasil disalin" 
      title="Berhasil!" 
    />
    
    <!-- Country selector -->
    <CountrySelector 
      countries={pageData.countries} 
      selectedCountry={selectedCountry}
      on:select={(e) => selectedCountry = e.detail.country}
    />
    
    <!-- Header -->
    <Header 
      autoFetch={true}
    />
    
    <!-- Main content -->
    <div class="container">
      <TitleBar title={pageData.title} />
      
      <ProxyList 
        proxies={pageData.proxies} 
        on:copy={handleCopy}
      />
      
      <Pagination 
        currentPage={pageData.pagination.currentPage} 
        totalPages={pageData.pagination.totalPages} 
        baseUrl={pageData.pagination.baseUrl}
      />
    </div>
    
    <!-- Modal windows -->
    <InfoWindow 
      isVisible={showInfoWindow} 
      infoText={infoText} 
    />
    
    <OutputFormat 
      isVisible={showOutputWindow}
      on:close={handleCloseOutputWindow}
      on:rawCopy={handleRawCopy}
      on:formatCopy={handleFormatCopy}
    />
    
    <WildcardsWindow 
      isVisible={showWildcardsWindow}
      rootDomain="nauticavpn.com"
      on:close={() => showWildcardsWindow = false}
      on:updateInfo={handleUpdateInfo}
    />
    
    <!-- Footer -->
    <Footer 
      isApiReady={pageData.isApiReady}
      donateLink="#"
      on:toggleDarkMode={handleToggleDarkMode}
      on:toggleWildcards={handleToggleWildcards}
    />
  </div>
{:else}
  <div class="flex justify-center items-center h-screen">
    <p class="text-2xl dark:text-white">Loading...</p>
  </div>
{/if}
