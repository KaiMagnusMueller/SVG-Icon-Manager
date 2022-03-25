<script>
    import { fileList } from "../stores.js";

    let _files = $fileList;

    fileList.subscribe((value) => {
        _files = value;
    }); // logs '0'
</script>

<ul>
    {#if _files}
        {#each _files as file}
            <li>
                {file.name}
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
