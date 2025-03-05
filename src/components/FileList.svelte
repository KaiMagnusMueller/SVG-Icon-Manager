<script>
    import { onMount } from 'svelte'
    import FileListPreview from './FileListPreview.svelte'

    export let fileList = []

    const statusOrder = ['added', 'deleted', 'changed', 'unchanged']

    // Group files by status
    $: groupedFiles = fileList.reduce((acc, file) => {
        const status = file.status || 'unchanged'
        if (!acc.has(status)) {
            acc.set(status, [])
        }
        acc.get(status).push(file)
        return acc
    }, new Map())

    // Convert Map to array and sort by status order
    $: sortedGroups = Array.from(groupedFiles.entries()).sort(
        (a, b) => statusOrder.indexOf(a[0]) - statusOrder.indexOf(b[0])
    )

    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    onMount(() => {
        if (!!fileList) {
            console.timeEnd('Display file previews: ')
        }
    })
</script>

{#if fileList.length > 0}
    <div class="file-list">
        {#each sortedGroups as [status, files]}
            {#if files.length > 0}
                <div class="status-group">
                    {#if sortedGroups.length > 1}
                        <h3 class="status-header {status}">
                            {formatStatus(status)} ({files.length})
                        </h3>
                    {/if}
                    <ul class="p-xxsmall">
                        {#each files as file (file.hash)}
                            <FileListPreview {file} />
                        {/each}
                    </ul>
                </div>
            {/if}
        {/each}
    </div>
{/if}

<style>
    .file-list {
        height: 100%;
    }

    .status-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        padding: 16px 8px;
    }

    .status-group:not(:last-child) {
        border-bottom: 1px solid var(--figma-color-border);
    }

    .status-header {
        font-size: var(--font-size-small);
        margin: 0;
        padding: 0;
        font-weight: var(--font-weight-bold);
    }

    ul {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 10px;
        margin: 0;
        padding: 0;
    }
</style>
