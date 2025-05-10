<script>
  export let data;
</script>

<svelte:head>
  <title>Nautica VPN</title>
  <meta name="description" content="NauticaVPN - Proxy Manager" />
</svelte:head>

<!-- Halaman ini dirender oleh server di +page.server.ts -->
<div>
  <!-- Konten dari server -->
  {@html data.html || ''}
</div>
