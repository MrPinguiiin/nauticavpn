<script lang="ts">
    import type { ProxyInfo } from '$lib/types'
    import Button from './ui/button/button.svelte'

    let {
        proxy,
        configs = []
    }: {
        proxy: ProxyInfo,
        configs?: string[]
    } = $props()

    let isChecking = $state(false)
    let healthStatus = $state('Tekan untuk cek')
    let healthClass = $state('dark:text-white')

    function getFlagEmoji(countryCode: string): string {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0))
        return String.fromCodePoint(...codePoints)
    }

    async function checkHealth() {
        if (isChecking) return
        isChecking = true
        healthStatus = 'Checking...'

        try {
            const response = await fetch(`/api/v1/proxy/health?ip=${proxy.proxyIP}:${proxy.proxyPort}`)
            const data = await response.json()

            if (data.proxyip) {
                healthStatus = `Active ${data.delay}ms (${data.colo})`
                healthClass = 'text-green-700 dark:text-green-300'
            } else {
                healthStatus = 'Inactive'
                healthClass = 'text-red-700 dark:text-red-300'
            }
        } catch (error) {
            healthStatus = 'Check Failed!'
            healthClass = 'text-red-700 dark:text-red-300'
        } finally {
            isChecking = false
        }
    }

    function copyConfig() {
        if (configs.length > 0) {
            navigator.clipboard.writeText(configs.join('\n'))
                .then(() => {
                    // Bisa ditambahkan notifikasi sukses disini
                })
                .catch(err => {
                    console.error('Failed to copy:', err)
                })
        }
    }
</script>

<div class="lozad transition bg-white dark:bg-neutral-900 scale-95 border-2 border-neutral-800 dark:border-white rounded-lg p-3 w-full max-w-sm flex flex-col gap-2">
    <div class="flex items-center justify-between border-b-2 border-neutral-800 dark:border-white pb-1">
        <div class="flex items-center gap-1">
            <span class="text-xl">{getFlagEmoji(proxy.country)}</span>
            <span class="text-md font-semibold dark:text-white">{proxy.country}</span>
        </div>
        <Button
            variant="default"
            onclick={copyConfig}
            class="bg-amber-400 text-neutral-800 font-semibold hover:bg-amber-500"
        >
            Copy
        </Button>
    </div>

    <div class="text-sm dark:text-white">
        <p>IP: {proxy.proxyIP}</p>
        <p>Port: {proxy.proxyPort}</p>
        <p>ISP: {proxy.org}</p>
    </div>

    <div class="mt-2">
        <Button
            variant="default"
            onclick={checkHealth}
            disabled={isChecking}
            class="w-full {healthStatus.includes('Active') ? 'bg-green-100 dark:bg-green-700' : 
                   healthStatus === 'Inactive' ? 'bg-red-100 dark:bg-red-700' : 
                   'bg-blue-100 dark:bg-blue-700'} hover:opacity-90"
        >
            {#if isChecking}
                <span class="animate-pulse">Checking...</span>
            {:else}
                <span class={healthClass}>
                    {healthStatus}
                </span>
            {/if}
        </Button>
    </div>
</div>