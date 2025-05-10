<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let isVisible: boolean = false;
  
  const dispatch = createEventDispatcher<{
    close: void;
    formatCopy: { format: string };
    rawCopy: void;
  }>();
  
  function closeWindow() {
    dispatch('close');
  }
  
  function copyAsFormat(format: string) {
    dispatch('formatCopy', { format });
  }
  
  function copyAsRaw() {
    dispatch('rawCopy');
  }
</script>

<div 
  id="output-window" 
  class="fixed z-20 top-0 right-0 w-full h-full flex justify-center items-center"
  class:hidden={!isVisible}
>
  <div class="w-[75%] h-[30%] flex flex-col gap-1 p-1 text-center rounded-md">
    <div class="basis-1/6 w-full h-full rounded-md">
      <div class="flex w-full h-full gap-1 justify-between">
        <button
          on:click={() => copyAsFormat('clash')}
          class="basis-1/2 p-2 rounded-full bg-amber-400 flex justify-center items-center"
        >
          Clash
        </button>
        <button
          on:click={() => copyAsFormat('sfa')}
          class="basis-1/2 p-2 rounded-full bg-amber-400 flex justify-center items-center"
        >
          SFA
        </button>
        <button
          on:click={() => copyAsFormat('bfr')}
          class="basis-1/2 p-2 rounded-full bg-amber-400 flex justify-center items-center"
        >
          BFR
        </button>
      </div>
    </div>
    <div class="basis-1/6 w-full h-full rounded-md">
      <div class="flex w-full h-full gap-1 justify-between">
        <button
          on:click={() => copyAsFormat('v2ray')}
          class="basis-1/2 p-2 rounded-full bg-amber-400 flex justify-center items-center"
        >
          V2Ray/Xray
        </button>
        <button
          on:click={copyAsRaw}
          class="basis-1/2 p-2 rounded-full bg-amber-400 flex justify-center items-center"
        >
          Raw
        </button>
      </div>
    </div>
    <div class="basis-1/6 w-full h-full rounded-md">
      <div class="flex w-full h-full gap-1 justify-center">
        <button
          on:click={closeWindow}
          class="basis-1/2 border-2 border-indigo-400 hover:bg-indigo-400 dark:text-white p-2 rounded-full flex justify-center items-center"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</div> 