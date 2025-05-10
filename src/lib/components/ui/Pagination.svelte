<script lang="ts">
  export let currentPage: number;
  export let totalPages: number;
  export let baseUrl: string = "/sub";
  
  // Menyiapkan array tombol pagination
  let pages: { label: string; url: string; disabled: boolean; current: boolean }[] = [];
  
  $: {
    pages = [];
    
    // Previous page
    pages.push({
      label: "Prev",
      url: `${baseUrl}/${Math.max(0, currentPage - 1)}`,
      disabled: currentPage <= 0,
      current: false
    });
    
    // Page numbers
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push({
        label: String(i + 1),
        url: `${baseUrl}/${i}`,
        disabled: false,
        current: i === currentPage
      });
    }
    
    // Next page
    pages.push({
      label: "Next",
      url: `${baseUrl}/${Math.min(totalPages, currentPage + 1)}`,
      disabled: currentPage >= totalPages,
      current: false
    });
  }
</script>

<nav id="container-pagination" class="w-screen mt-8 sticky bottom-0 right-0 left-0 transition -translate-y-6 z-20">
  <ul class="flex justify-center space-x-4">
    {#each pages as page}
      <li>
        <a 
          href={page.url}
          class="px-3 py-2 rounded-full inline-block border-2 border-neutral-800 dark:border-white transition-colors
                 {page.current ? 'bg-amber-400' : 'bg-white dark:bg-neutral-800'} 
                 {page.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-400'}"
          class:text-white={!page.current && !page.disabled}
          aria-current={page.current ? 'page' : undefined}
          aria-disabled={page.disabled}
          tabindex={page.disabled ? -1 : 0}
        >
          {page.label}
        </a>
      </li>
    {/each}
  </ul>
</nav> 