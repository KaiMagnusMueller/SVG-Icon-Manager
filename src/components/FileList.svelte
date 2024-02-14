<script>
    import FileListPreview from './FileListPreview.svelte'

    export let fileList = []

    // $: findDupes(_files);

    // function findDupes(param) {
    //     var duplicates = param.reduce(function (acc, el, i, arr) {
    //         if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
    //         return acc;
    //     }, []);
    //     console.log(duplicates);
    //     return duplicates;
    // }
</script>

{#if fileList.length > 0}
    <ul class="p-xxsmall">
        {#each fileList as file (file.hash)}
            <FileListPreview {file} />
        {/each}
    </ul>
{/if}

<style>
    ul {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 10px;
        margin: 0;
        align-self: normal;
    }
</style>
