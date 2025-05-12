<script lang="ts">
  const runes = true;
  
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
  
  // Props dari server
  const props = $props<{ data: any }>();
  
  // Type untuk proxy
  type ProxyType = {
    info: {
      proxyIP: string;
      proxyPort: string;
      country: string;
      org: string;
    };
    urls: string[];
  };
  
  // Type untuk page data
  type PageDataType = {
    title: string;
    countries: string[];
    proxies: ProxyType[];
    pagination: {
      currentPage: number;
      totalPages: number;
      baseUrl: string;
    };
    isApiReady: boolean;
  };
  
  // Type untuk events
  type SelectCountryEvent = CustomEvent<{ country: string }>;
  type CopyEvent = CustomEvent<{ config: string }>;
  type FormatCopyEvent = CustomEvent<{ format: string }>;
  type UpdateInfoEvent = CustomEvent<{ text: string }>;
  
  // State menggunakan runes
  let pageData = $state<PageDataType | null>(null);
  let selectedCountry = $state<string | null>(null);
  let showNotification = $state(false);
  let showInfoWindow = $state(false);
  let showOutputWindow = $state(false);
  let showWildcardsWindow = $state(false);
  let infoText = $state("");
  let rawConfig = $state("");
  
  // Derived values
  const filteredProxies = $derived(
    !pageData ? [] : 
    !selectedCountry || selectedCountry === 'ALL' ? 
      pageData.proxies : 
      pageData.proxies.filter(proxy => proxy.info.country === selectedCountry)
  );
  
  const pageTitle = $derived(
    pageData ? 
      selectedCountry && selectedCountry !== 'ALL' ? 
        `Proxy - ${selectedCountry}` : 
        pageData.title || 'Nautica VPN' 
      : 'Nautica VPN'
  );
  
  // Parsing data dari server
  $effect(() => {
    if (props.data?.html) {
      try {
        pageData = JSON.parse(props.data.html);
      } catch (e) {
        console.error("Error parsing data:", e);
      }
    }
  });
  
  // Debug filter effect
  $effect(() => {
    console.log(`Filtered proxies count: ${filteredProxies.length}`);
    console.log(`Selected country: ${selectedCountry}`);
  });
  
  // Debug dengan tambahan detail
  $effect(() => {
    // Tampilkan detail saat filter dan proxy berubah
    if (selectedCountry) {
      console.log(`Country Selection detail: ${selectedCountry}`);
      console.log(`Filtered Proxies detail: ${filteredProxies.length} dari ${pageData?.proxies.length || 0} total proxy`);
      
      // Tampilkan beberapa proxy pertama untuk debugging
      if (filteredProxies.length > 0) {
        console.log('Sample proxy pertama:', filteredProxies[0].info);
      }
    }
  });
  
  function handleSelectCountry(event: SelectCountryEvent) {
    console.log(`Selected country: ${event.detail.country}`);
    
    // Set selected country state
    selectedCountry = event.detail.country;
    
    // Update page title berdasarkan negara yang dipilih
    if (pageData) {
      document.title = selectedCountry && selectedCountry !== 'ALL' ? 
                        `Proxy - ${selectedCountry}` : 
                        pageData.title || 'Nautica VPN';
    }
    
    // Log jumlah proxy yang tampil setelah filter
    setTimeout(() => {
      console.log(`Filtered proxies: ${filteredProxies.length} items`);
    }, 0);
  }
  
  function handleCopy(event: CopyEvent) {
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
  
  async function handleFormatCopy(event: FormatCopyEvent) {
    const format = event.detail.format;
    infoText = "Generating config...";
    
    try {
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
  
  function handleUpdateInfo(event: UpdateInfoEvent) {
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
      on:select={handleSelectCountry}
    />
    
    <!-- Header -->
    <Header />
    
    <!-- Main content -->
    <div class="container mx-auto px-4 pt-6 ml-64">
      <TitleBar title={pageTitle} />
      
      {#if selectedCountry && selectedCountry !== 'ALL'}
        <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-md mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">{selectedCountry}</span>
            <span class="text-sm">
              {filteredProxies.length} proxy ditemukan
            </span>
          </div>
          <button 
            class="bg-rose-500 hover:bg-rose-600 text-white py-1 px-3 rounded-md text-sm"
            onclick={() => selectedCountry = 'ALL'}
          >
            Reset Filter
          </button>
        </div>
      {/if}
      
      <ProxyList 
        proxies={filteredProxies} 
        on:copy={handleCopy}
      />
      
      {#if pageData.pagination}
        <Pagination 
          currentPage={pageData.pagination.currentPage} 
          totalPages={pageData.pagination.totalPages} 
          baseUrl={pageData.pagination.baseUrl}
        />
      {/if}
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
  </div>
{:else}
  <div class="flex items-center justify-center h-screen bg-gray-900">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto mb-4"></div>
      <p class="text-white">Memuat data...</p>
    </div>
  </div>
{/if}
