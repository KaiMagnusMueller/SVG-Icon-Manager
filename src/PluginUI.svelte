<script>
    import { fade } from 'svelte/transition'
    import HeroImage from './hero-image3.svg'
    import FileInput from './components/FileInput.svelte'
    import FileList from './components/FileList.svelte'

    //import Global CSS from the svelte boilerplate
    //contains Figma color vars, spacing vars, utility classes and more
    import { GlobalCSS } from 'figma-plugin-ds-svelte'

    //import some Svelte Figma UI components
    import { Button, Label, Section } from 'figma-plugin-ds-svelte'

    import { Icon, IconSpinner } from 'figma-plugin-ds-svelte'

    let menuItemArray = [
        {
            value: 'item1',
            label: 'Carbon Design System',
            group: null,
            selected: false,
        },
        {
            value: 'item2',
            label: 'Add Configuration ',
            group: null,
            selected: false,
        },
    ]

    import { differenceStore } from './stores.js'
    import Tutorial from './components/Tutorial.svelte'

    let fileList = []

    let _differences
    differenceStore.subscribe((value) => {
        _differences = value
    })
    let categories = []

    $: {
        for (const prop in _differences) {
            console.log(`${_differences[prop].length} item(s) ${prop}`)
            categories.push(`${_differences[prop].length} item(s) ${prop}`)
        }
        console.log(categories)
    }

    function cancel() {
        parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
    }

    //Submit button for webkit dir
    function handleSubmit() {
        createLibraryState = 'creating'

        // console.log(filesArray);

        setTimeout(() => {
            console.time('Create library: ')
            parent.postMessage({ pluginMessage: { type: 'create-library', doc: fileList } }, '*')

            for (let i = 0; i < fileList.length; i++) {
                fileList[i].status = ''
            }

            // $differenceStore = undefined
            // _differences = undefined
        }, 50)
    }

    let figmaNodes = []
    let fileListLoaded = false
    let createLibraryState = undefined
    let readFileState = undefined
    let filesSubmitted = false
    let hasLibraryInFile = false

    // let createLibraryProgress = 0
    let viewedTutorials = []
    let tutorialLoaded = false

    onmessage = (event) => {
        if (event.data.pluginMessage.type == 'loaded-tutorial') {
            tutorialLoaded = true
            if (event.data.pluginMessage.data) {
                console.log('tutorial data received...   loading')
                viewedTutorials = event.data.pluginMessage.data
            } else {
                console.log('no tutorials viewed...')
            }
        }
        if (event.data.pluginMessage.type == 'loaded-nodes') {
            figmaNodes = event.data.pluginMessage.data
            console.log('got existing icons from Figma')

            figmaNodes.sort(function (a, b) {
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            })

            fileList = figmaNodes

            // handeLoadedNodes(event.data.pluginMessage.data)

            fileListLoaded = true
            createLibraryState = 'default'
            readFileState = 'default'
            hasLibraryInFile = true
        } else if (event.data.pluginMessage.type == 'loaded-nodes-empty') {
            console.log('no existing icons in Figma')

            //handleEmptyNodes()
            fileListLoaded = true
            createLibraryState = 'nolibrary'
            readFileState = 'default'
        }

        // if (event.data.pluginMessage.type == 'create-library-progress') {
        //     console.log(event.data.pluginMessage.data)
        //     createLibraryProgress = event.data.pluginMessage.data
        // }

        if (event.data.pluginMessage.type == 'done-create-library') {
            createLibraryState = 'done'
            console.timeEnd('Create library: ')
        }
    }

    function resetTutorials() {
        parent.postMessage(
            {
                pluginMessage: {
                    type: 'save-tutorials',
                    data: [],
                },
            },
            '*'
        )
    }
</script>

<!-- {_differences}
{filesSubmitted}
{createLibraryState}
{fileListLoaded}
{readFileState}
{fileList.length} -->

{#if readFileState === 'reading' || readFileState === undefined || createLibraryState === 'creating'}
    <div class="read-file-overlay" transition:fade={{ duration: 100 }}>
        <div />
        <Icon iconName={IconSpinner} spin={true} />
        {#if createLibraryState === 'creating'}
            <p>This may take a few seconds</p>
        {/if}
    </div>
{/if}

<div class="wrapper" class:height-full={fileList.length === 0}>
    {#if fileListLoaded && fileList.length === 0}
        <div class="placeholder" transition:fade={{ duration: 100 }}>
            <!-- <img src="./src/hero-image.png" alt="" /> -->
            <div class="hero-image">
                {@html HeroImage}
            </div>

            <div class="action-card pl-main-action m-xsmall p-xsmall">
                <div class="action-header">
                    <FileInput
                        bind:fileList
                        on:readFiles={(e) => (readFileState = e.detail)}
                        on:readFiles={() => (filesSubmitted = true)}
                    />
                    <Button variant="tertiary"
                        ><a
                            target="_blank"
                            href="https://www.kaimagnus.de/articles/building-icon-libraries-with-icon-library-manager"
                            >How to Use ↗</a
                        ></Button
                    >
                </div>
                <div class="action-body">
                    <p class="">Create a library by selecting a source folder with .svg files.</p>
                    <p>
                        Click on 'How to Use' for an introduction to this plugin and how to manage
                        and update libraries.
                    </p>
                </div>
            </div>
        </div>
    {:else if fileListLoaded && fileList.length > 0}
        <div transition:fade={{ duration: 100 }}>
            <div class="content-section">
                {#if createLibraryState !== 'done'}
                    <!-- ------------------------------------------ -->
                    <!-- NO LIBRARY CREATED/UPDATED IN THIS SESSION -->
                    {#if _differences != null}
                        <div class="apply-changes-section p-xxsmall flex align-items-center">
                            <!-- SVG FILES IMPORTED -->
                            <Button on:click={handleSubmit} class=""
                                >{hasLibraryInFile ? 'Apply Changes' : 'Create Library'}</Button
                            >
                            {#if hasLibraryInFile}
                                <!-- SVG FILES IMPORTED AND LIBRARY EXISTS-->
                                <p>
                                    <span>
                                        {_differences.added.length || 'No'} new icons found.
                                    </span>
                                    <span>
                                        {_differences.deleted.length || ' No'} icons were removed and
                                    </span>
                                    <span>
                                        {_differences.changed.length || 'none'} changed.
                                    </span>
                                </p>
                            {:else}
                                <!-- SVG FILES IMPORTED AND NO LIBRARY IN FILE-->
                                <p>
                                    <span>
                                        Continue to create a component library with {_differences
                                            .added.length || 'No'} new icons here.
                                    </span>
                                </p>
                            {/if}
                        </div>
                    {:else}
                        {#if tutorialLoaded}
                            <div class="section--tutorial">
                                <Tutorial {viewedTutorials} />
                            </div>
                        {/if}
                        <!-- NO FILES IMPORTED -->
                        <div class="update-library-select flex justify-content-between">
                            <FileInput
                                bind:fileList
                                variant="secondary"
                                on:readFiles={() => (filesSubmitted = true)}
                                on:readFiles={(e) => (readFileState = e.detail)}
                            />
                            <Label class="">
                                Select a folder containing .svg files to update the library
                            </Label>
                        </div>
                    {/if}
                {:else}
                    <!-- --------------------------------------- -->
                    <!-- LIBRARY CREATED/UPDATED IN THIS SESSION -->
                    <div class="change-summary-section">
                        <Label>
                            {_differences.added.length || 'No'} new icons were added. There were {_differences
                                .deleted.length || ' no'} removed and {_differences.changed
                                .length || ' no'} changed icons.
                        </Label>
                        <Label>You can now publish the changes in your team library.</Label>
                    </div>
                {/if}
                <FileList {fileList} />

                <Button variant="tertiary" on:click={resetTutorials}>Reset tutorials</Button>
            </div>
        </div>
    {/if}
</div>

<style>
    a {
        color: var(--figma-color-text-brand);
    }

    .read-file-overlay {
        z-index: 1000;
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 4px;
    }
    .read-file-overlay div {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: -1;
        opacity: 0.8;
        background-color: var(--figma-color-bg);
    }

    .read-file-overlay p {
        font-size: var(--font-size-xsmall);
        margin: 0;
        color: var(--figma-color-text);
    }

    .custom-menu * .placeholder {
        font-size: var(--font-size-small) !important;
    }

    .apply-changes-section {
        position: sticky;
        top: 0;
        background-color: var(--figma-color-bg);
        width: 100%;
        border-bottom: 1px solid var(--figma-color-border);
        gap: var(--size-xxsmall);
    }

    .apply-changes-section p,
    .apply-changes-section span {
        font-size: var(--font-size-xsmall);
        margin: 0;
        color: var(--figma-color-text);
    }

    .card-wrapper {
        padding-inline: 8px;
        margin-top: 8px;
    }
    .inline-tutorial {
        overflow: hidden;
        z-index: 1;
        margin: 0;
    }

    .update-library-select {
        position: sticky;
        top: 0;
        padding: 8px;
        background-color: var(--figma-color-bg);
        border-bottom: 1px solid var(--figma-color-border);
    }

    .change-summary-section {
        padding: 8px 8px 0 8px;
    }

    .content-section {
        display: flex;
        flex-direction: column;
        align-items: baseline;
    }

    .height-full {
        height: 100%;
    }

    .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        position: relative;
    }

    .hero-image {
        position: absolute;
        top: 0;
    }

    .action-card {
        border: 1px solid var(--figma-color-border);
        background-color: var(--figma-color-bg-secondary);
        border-radius: 12px;
        position: relative;
        font-size: var(--font-size-xsmall);
        font-weight: var(--font-weight-normal);
        color: var(--figma-color-text);
        line-height: var(--font-line-height) !important;
    }

    .inline-tutorial:hover {
        background-color: color-mix(in srgb, transparent, var(--figma-color-text) 10%);
        border-color: color-mix(in srgb, transparent, var(--figma-color-text) 20%);
    }

    /* .inline-tutorial:hover p:first-of-type {
        text-decoration: underline;
    } */

    .pl-main-action {
        display: flex;
        flex-direction: column;
        justify-content: center;
        /* align-items: center; */
    }
    .action-header {
        display: flex;
        gap: 16px;
        /* justify-content: center; */
        align-items: center;
    }

    .action-card p {
        margin: 0;
    }

    .action-body p {
        margin-top: 8px;
    }

    .action-body p:not(:last-of-type) {
        margin-bottom: 8px;
    }

    .font-large {
        font-size: 20px;
    }
</style>
