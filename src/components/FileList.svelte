<script>
    import { fileList } from '../stores.js';
    import FileListPreview from './FileListPreview.svelte';
    import FileInput from './FileInput.svelte';
    import { Label } from 'figma-plugin-ds-svelte';

    export let _files = [];

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

{#if _files.length > 0}
    <ul>
        {#each _files as file (file.hash)}
            <FileListPreview {file} />
        {/each}
    </ul>
{/if}

<style>
    ul {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        grid-gap: 10px;
        /* margin: 0; */
        padding: 0;
        align-self: normal;
    }
</style>
