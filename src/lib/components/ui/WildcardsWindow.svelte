<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let isVisible: boolean = false;
  export let rootDomain: string = "";
  export let infoText: string = "Domain list";
  
  let domains: string[] = [];
  let newDomain: string = "";
  let isDomainListFetched: boolean = false;
  
  const dispatch = createEventDispatcher<{
    close: void;
    updateInfo: { text: string };
  }>();
  
  function closeWindow() {
    dispatch('close');
  }
  
  function updateInfoText(text: string) {
    dispatch('updateInfo', { text });
  }
  
  async function getDomainList() {
    if (isDomainListFetched) return;
    isDomainListFetched = true;
    
    updateInfoText("Fetching data...");
    
    try {
      const response = await fetch(`/api/v1/domains/get`);
      if (response.status === 200) {
        domains = await response.json();
        updateInfoText("Done!");
      } else {
        updateInfoText("Failed!");
      }
    } catch (error) {
      updateInfoText("Error fetching domains!");
    }
  }
  
  async function registerDomain() {
    const rawDomain = newDomain.toLowerCase();
    const domain = `${rawDomain}.${rootDomain}`;
    
    // Validasi domain
    if (!rawDomain.match(/^\w+$/) || rawDomain.endsWith(rootDomain)) {
      updateInfoText("Invalid URL!");
      return;
    }
    
    updateInfoText("Pushing request...");
    
    try {
      const response = await fetch(`/api/v1/domains/put?domain=${domain}`);
      if (response.status === 200) {
        updateInfoText("Done!");
        newDomain = "";
        isDomainListFetched = false;
        await getDomainList();
      } else if (response.status === 409) {
        updateInfoText("Domain exists!");
      } else {
        updateInfoText(`Error ${response.status}`);
      }
    } catch (error) {
      updateInfoText("Error registering domain!");
    }
  }
  
  onMount(() => {
    if (isVisible) {
      getDomainList();
    }
  });
  
  $: if (isVisible && !isDomainListFetched) {
    getDomainList();
  }
</script>

<div 
  id="wildcards-window" 
  class="fixed z-20 top-0 right-0 w-full h-full flex justify-center items-center"
  class:hidden={!isVisible}
>
  <div class="w-[75%] h-[30%] flex flex-col gap-1 p-1 text-center rounded-md">
    <div class="basis-1/6 w-full h-full rounded-md">
      <div class="flex w-full h-full gap-1 justify-between">
        <input
          id="new-domain-input"
          bind:value={newDomain}
          type="text"
          placeholder="Input wildcard"
          class="basis-11/12 w-full h-full px-6 rounded-md focus:outline-0"
        />
        <button
          on:click={registerDomain}
          class="p-2 rounded-full bg-amber-400 flex justify-center items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path
              fill-rule="evenodd"
              d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="basis-5/6 w-full h-full rounded-md">
      <div
        id="container-domains"
        class="w-full h-full rounded-md flex flex-col gap-1 overflow-scroll scrollbar-hide"
      >
        {#each domains as domain}
          <p class="w-full bg-amber-400 rounded-md">{domain}</p>
        {/each}
      </div>
    </div>
  </div>
</div> 