<script>
    import { fileList } from "../stores.js";
    import FileListPreview from "./FileListPreview.svelte";

    let _files = [];

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

<ul>
    {#if _files}
        {#each _files as file}
            <FileListPreview {file} />
        {/each}
    {/if}
</ul>

<style>
    ul {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        grid-gap: 10px;
        /* margin: 0; */
        padding: 0;
    }
</style>
