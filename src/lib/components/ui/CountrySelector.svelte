<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import { 
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
  } from '$lib/components/ui/dropdown-menu';
  import { ChevronDown, Globe } from '@lucide/svelte';

  const runes = true;
  
  // Props menggunakan runes
  const props = $props<{
    countries: string[];
    selectedCountry?: string | null;
  }>();
  
  // State menggunakan runes
  let searchQuery = $state('');
  let selectedCountry = $state(props.selectedCountry || null);
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    select: { country: string }
  }>();
  
  // Derived values
  const filteredCountries = $derived(
    props.countries.filter((country: string) => 
      country.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const selectedLabel = $derived(
    selectedCountry ? `${getFlagEmoji(selectedCountry)} ${selectedCountry}` : 'Pilih Region'
  );
  
  // Event handler untuk pemilihan negara
  function selectCountry(country: string): void {
    selectedCountry = country;
    // Dispatch event untuk memberi tahu komponen induk
    dispatch('select', { country });
  }
  
  // Fungsi untuk mendapatkan emoji bendera
  function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char: string) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  
  // Helper function untuk styling button
  function getButtonClass(country: string) {
    const baseClass = "w-full justify-start font-semibold hover:bg-gray-800 hover:text-white transition-colors";
    if (selectedCountry === country) {
      return `${baseClass} bg-rose-500 text-white hover:bg-rose-600`;
    }
    if (country === 'ALL') {
      return `${baseClass} text-gray-300`;
    }
    return `${baseClass} text-gray-300`;
  }
  
  // Update selectedCountry ketika props berubah
  $effect(() => {
    if (props.selectedCountry !== undefined && props.selectedCountry !== selectedCountry) {
      selectedCountry = props.selectedCountry;
    }
  });
</script>

<div class="w-64 fixed left-0 top-0 bottom-0 border-r border-gray-800 bg-gray-950 z-20 overflow-hidden flex flex-col">
  <!-- Header -->
  <div class="p-4 border-b border-gray-800">
    <h2 class="font-semibold text-white flex items-center">
      <Globe class="h-4 w-4 mr-2 text-rose-500" />
      Region Selection
    </h2>
  </div>
  
  <!-- Search -->
  <div class="p-4 border-b border-gray-800">
    <Input
      placeholder="Search servers..."
      class="border-gray-700 bg-gray-900 text-white focus:border-rose-500"
      bind:value={searchQuery}
    />
  </div>
  
  <!-- Country list -->
  <ScrollArea class="flex-1">
    <div class="p-2 space-y-1">
      <Button
        variant="ghost"
        class={getButtonClass('ALL')}
        onclick={() => selectCountry('ALL')}
      >
        <Globe class="h-4 w-4 mr-2 text-rose-500" />
        <span>All Regions</span>
      </Button>
      
      {#each filteredCountries as country}
        <Button
          variant="ghost"
          class={getButtonClass(country)}
          onclick={() => {
            console.log(`Selecting country: ${country}`);
            selectCountry(country);
          }}
        >
          <span class="mr-2 text-lg">{getFlagEmoji(country)}</span>
          <span>{country}</span>
        </Button>
      {/each}
    </div>
  </ScrollArea>
</div> 