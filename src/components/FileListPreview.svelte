<script>
    import { parseDOM } from "../svg-helpers";
    import { onMount } from "svelte";
    export let file;

    const svgElem = parseDOM(file.svg).firstChild;
    let container;
    $: title = file.name + " " + file.folder + " " + file.status;
    onMount(() => {
        container.appendChild(svgElem);
    });
</script>

<li class={file.status} {title}>
    <div bind:this={container} />
    <!-- <p>{file.name}</p> -->
</li>

<style>
    li {
        font-family: var(--font-stack);
        font-size: var(--font-size-xsmall);
        font-weight: var(--font-weight-medium);
        letter-spacing: var(--font-letter-spacing-neg-small);
        line-height: var(--font-line-height);

        list-style: none;
        border-radius: 4px;
        border: 2px solid transparent;
    }

    li:hover {
        background-color: rgb(228, 228, 228);
    }

    li:focus {
        background-color: rgb(228, 228, 228);
    }

    li div {
        aspect-ratio: 1/1;
        padding: 4px;
    }

    div :global(svg) {
        aspect-ratio: 1;
    }

    li p {
        display: none;
    }

    .changed {
        border-color: cornflowerblue;
    }

    .added {
        border-color: green;
    }

    .deleted {
        border-color: salmon;
    }

    li.deleted div {
        opacity: 1;
    }
</style>
