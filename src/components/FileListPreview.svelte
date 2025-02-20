<script>
    import { parseSVGFromString } from '../svg-helpers'
    import { onMount } from 'svelte'
    export let file

    const svgElem = parseSVGFromString(file.svg)

    onMount(() => {
        const shadow = container.attachShadow({ mode: 'open' })
        shadow.appendChild(svgElem)
        const sheet = new CSSStyleSheet()
        sheet.replaceSync('svg {aspect-ratio: 1; width: 100%; height: 100%;}')
        shadow.adoptedStyleSheets = [sheet]
    })

    let container
    const title =
        file.name +
        (file.folder !== '' ? ' ' + file.folder : '') +
        (file.status !== '' ? ' ' + file.status : '')
</script>

<li class={file.status !== '' ? file.status : ''} {title}>
    <div bind:this={container}></div>
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
        /* min-width: 44px; */
        /* (330-16-50)/6 = 44 */
    }

    li:hover {
        background-color: var(--figma-color-bg-hover);
    }

    li:focus {
        background-color: rgb(228, 228, 228);
    }

    li div {
        aspect-ratio: 1/1;
        padding: 4px;
        fill: var(--figma-color-text);
        --color-icon: var(--figma-color-text);
    }

    /* 
    li p {
        display: none;
    } */

    .changed {
        border-color: var(--figma-color-border-brand-strong);
        /* background-color: var(--figma-color-bg-brand-tertiary); */
    }

    .added {
        border-color: var(--figma-color-border-success-strong);
    }

    @media (prefers-color-scheme: dark) {
        .added {
            border-color: var(--figma-color-border-success);
        }
    }

    .deleted {
        border-color: var(--figma-color-border-danger-strong);
        /* background-color: var(--figma-color-bg-danger-tertiary); */
    }

    li.deleted div {
        opacity: 1;
    }
</style>
