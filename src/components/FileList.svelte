<script>
    import { fileList } from "../stores.js";

    let _files = $fileList;

    $: $fileList;
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
    }); // logs '0'
</script>

<ul>
    {#if _files}
        {#each _files as file}
            <li>
                {file.name}
                <!-- {#await promise then value}
                    <p>the value is {value}</p>
                {/await} -->

                <!-- TODO: File list previwe component -->
            </li>
        {/each}
    {/if}
</ul>

<style>
    li {
        font-family: var(--font-stack);
        font-size: var(--font-size-xsmall);
        font-weight: var(--font-weight-medium);
        letter-spacing: var(--font-letter-spacing-neg-small);
        line-height: var(--font-line-height);
    }
</style>
