<script lang="ts">
  export let isVisible: boolean = false;
  export let infoText: string = "";
</script>

<div class="fixed z-20 top-0 w-full h-full bg-white dark:bg-neutral-800" class:hidden={!isVisible}>
  <p id="container-window-info" class="text-center w-full h-full top-1/4 absolute dark:text-white">{infoText}</p>
</div> 