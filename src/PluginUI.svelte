<script>
    import { fade } from 'svelte/transition'
    import HeroImage from './hero-image.svg'
    import FileInput from './components/FileInput.svelte'
    import FileList from './components/FileList.svelte'

    //import Global CSS from the svelte boilerplate
    //contains Figma color vars, spacing vars, utility classes and more
    import { GlobalCSS } from 'figma-plugin-ds-svelte'

    //import some Svelte Figma UI components
    import { Button, Label } from 'figma-plugin-ds-svelte'

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

    onmessage = (event) => {
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
            createLibraryState = 'default'
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
            <div class="pl-main-action">
                <FileInput
                    bind:fileList
                    on:readFiles={(e) => (readFileState = e.detail)}
                    on:readFiles={(filesSubmitted = true)}
                />
                <p class="">Create a library by selecting a source folder with .svg files.</p>
                <p>
                    Read more on how to use this plugin <a
                        href="https://www.kaimagnus.de/articles/building-icon-libraries-with-icon-library-manager"
                        target="_blank"
                        rel="noopener noreferrer">here</a
                    >.
                </p>
            </div>
        </div>
    {:else if fileListLoaded && fileList.length > 0}
        <div transition:fade={{ duration: 100 }}>
            <div class="content-section">
                {#if createLibraryState !== 'done'}
                    <div class="apply-changes-section flex p-xxsmall align-items-center">
                        {#if _differences != null && createLibraryState !== 'done'}
                            <Button on:click={handleSubmit} class=""
                                >{hasLibraryInFile ? 'Apply Changes' : 'Create Library'}</Button
                            >
                            {#if hasLibraryInFile}
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
                                <p>
                                    <span>
                                        Continue to create a component library with {_differences
                                            .added.length || 'No'} new icons here.
                                    </span>
                                </p>
                            {/if}
                        {:else if createLibraryState === 'done'}
                            <!--  -->
                        {:else}
                            <div class="flex justify-content-between">
                                <FileInput
                                    bind:fileList
                                    variant="secondary"
                                    on:readFiles={(e) => (filesSubmitted = true)}
                                    on:readFiles={(e) => (readFileState = e.detail)}
                                />
                                <Label class="">
                                    Select a folder containing .svg files to update the library
                                </Label>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="p-xxsmall">
                        <Label>
                            {_differences.added.length || 'No'} new icons were added. There were {_differences
                                .deleted.length || ' no'} removed and {_differences.changed
                                .length || ' no'} changed icons.
                        </Label>
                        <Label>You can now publish the changes in your team library.</Label>
                    </div>
                {/if}

                <FileList {fileList} />
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
        justify-content: space-between;
        height: 100%;
        position: relative;
    }

    .pl-main-action {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 16px 32px;
    }

    .placeholder p {
        font-size: var(--font-size-xsmall);
        font-weight: var(--font-weight-normal);
        color: var(--figma-color-text-secondary);
        margin: 8px 0;
        text-align: center;
        line-height: var(--font-line-height) !important;
    }
</style>
