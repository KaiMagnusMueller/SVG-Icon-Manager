<script>
    import { fileList } from "../stores.js";
    import FileListPreview from "./FileListPreview.svelte";
    import FileInput from "./FileInput.svelte";
    import { Label } from "figma-plugin-ds-svelte";

    export let _files = [];

    // $: $fileList && getFileContent();

    // function getFileContent() {
    //     Object.keys(_files).forEach((i) => {
    //         const file = _files[i];

    //         // promise = getSvgString(file);
    //         console.log(file);

    //         fileContent.push(file);
    //     });
    // }

    // let fileContent = [];

    // // let promise = getSvgString();

    // async function getSvgString(file) {
    //     const svgPromise = await file.text();
    //     return svgPromise;
    // }

    fileList.subscribe((value) => {
        _files = value;
    });
</script>

{#if _files.length > 0}
    <ul>
        {#each _files as file (file)}
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
