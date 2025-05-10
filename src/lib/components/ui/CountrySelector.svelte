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

  export let countries: string[] = [];
  export let selectedCountry: string | null = null;
  
  const dispatch = createEventDispatcher<{
    select: { country: string }
  }>();
  
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

  // Variabel untuk pencarian
  let searchQuery = '';
  
  // Filter negara berdasarkan pencarian
  $: filteredCountries = countries.filter(country => 
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Label untuk dropdown
  $: selectedLabel = selectedCountry ? `${getFlagEmoji(selectedCountry)} ${selectedCountry}` : 'Pilih Region';
</script>

<div class="w-full md:w-64 shrink-0">
  <div class="rounded-lg border border-gray-800 overflow-hidden">
    <div class="p-4 border-b border-gray-800">
      <h2 class="font-medium">Region Selection</h2>
    </div>

    <div class="p-4">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="outline"
            class="w-full justify-between border-gray-700"
          >
            {selectedLabel}
            <ChevronDown class="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56 border-gray-700">
          <DropdownMenuItem
            class="hover:bg-gray-800 focus:bg-gray-800"
            onclick={() => selectCountry('ALL')}
          >
            <Globe class="h-4 w-4 mr-2" />
            All Regions
          </DropdownMenuItem>
          {#each countries as country}
            <DropdownMenuItem
              class=""
              onclick={() => selectCountry(country)}
            >
              <span class="mr-2">{getFlagEmoji(country)}</span>
              {country}
            </DropdownMenuItem>
          {/each}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="p-4 border-t border-gray-800">
      <div class="space-y-2">
        <Input
          placeholder="Search servers..."
          class=" border-gray-700 focus:border-rose-500"
          bind:value={searchQuery}
        />

        <ScrollArea class="h-[300px] pr-4">
          <div class="space-y-1">
            {#each filteredCountries as country}
              <Button
                variant="ghost"
                class="w-full justify-start"
                onclick={() => selectCountry(country)}
              >
                <span class="mr-2">{getFlagEmoji(country)}</span>
                <span>{country}</span>
              </Button>
            {/each}
          </div>
        </ScrollArea>
      </div>
    </div>
  </div>
</div> 