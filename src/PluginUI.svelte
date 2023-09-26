<script>
    import { fade } from 'svelte/transition'

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

    import { differenceStore, fileList } from './stores.js'

    let _files
    fileList.subscribe((value) => {
        _files = value
    })

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
            parent.postMessage({ pluginMessage: { type: 'create-library', doc: _files } }, '*')

            for (let i = 0; i < _files.length; i++) {
                _files[i].status = ''
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

    // let createLibraryProgress = 0

    onmessage = (event) => {
        if (event.data.pluginMessage.type == 'loaded-nodes') {
            figmaNodes = event.data.pluginMessage.data
            console.log('got existing icons from Figma')

            figmaNodes.sort(function (a, b) {
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            })

            $fileList = figmaNodes

            // handeLoadedNodes(event.data.pluginMessage.data)

            fileListLoaded = true
            createLibraryState = 'default'
            readFileState = 'default'
        } else if (event.data.pluginMessage.type == 'loaded-nodes-empty') {
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
        }
    }
</script>

{#if readFileState === 'reading' || readFileState === undefined || createLibraryState === 'creating'}
    <div class="read-file-overlay" transition:fade={{ duration: 100 }}>
        <div />
        <Icon iconName={IconSpinner} spin={true} />
        <!-- {#if createLibraryState === 'creating'}
            <Label>{createLibraryProgress}%</Label>
        {/if} -->
    </div>
{/if}

<div class="wrapper" class:height-full={_files.length === 0}>
    {#if fileListLoaded && _files.length === 0}
        <div class="placeholder" transition:fade={{ duration: 100 }}>
            <FileInput
                on:readFiles={(e) => (readFileState = e.detail)}
                on:readFiles={(e) => (filesSubmitted = true)}
            />
            <div class="placeholder-label mt-xxsmall">
                <Label class="">
                    No existing icons found. Import icons into this file by selecting a source
                    folder
                </Label>
            </div>
        </div>
    {:else if fileListLoaded && _files.length > 0}
        <div transition:fade={{ duration: 100 }}>
            <div class="content-section">
                {#if createLibraryState !== 'done'}
                    <div class="apply-changes-section flex p-xxsmall align-items-center">
                        {#if _differences != null && createLibraryState !== 'done'}
                            <Button on:click={handleSubmit} class="">Apply Changes</Button>
                            <p>
                                <span>
                                    {_differences.added.length || 'No'} new icons.
                                </span>
                                <span>
                                    {_differences.deleted.length || 'Zero'} icons were removed and
                                </span>
                                <span>
                                    {_differences.changed.length || 'zero'} changed.
                                </span>
                            </p>
                        {:else if createLibraryState === 'done'}
                            <!--  -->
                        {:else}
                            <div class="flex justify-content-between">
                                <FileInput
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
                            {_differences.added.length || 'No'} new icons were added. {_differences
                                .deleted.length || ' Zero'} icons were removed and {_differences
                                .changed.length || ' zero'} changed.
                        </Label>
                    </div>
                {/if}
                <!-- {_differences}
    {filesSubmitted}
                {createLibraryState}
                {fileListLoaded}
                {readFileState} -->
                <FileList {_files} />
            </div>
        </div>
    {/if}
</div>

<style>
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
    }
    .read-file-overlay div {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;

        opacity: 0.8;
        background-color: var(--figma-color-bg);
    }

    .custom-menu * .placeholder {
        font-size: var(--font-size-small) !important;
    }

    .apply-changes-section p,
    .apply-changes-section span {
        font-size: var(--font-size-xsmall);
        margin: 0;
        color: var(--figma-color-text);
    }

    .apply-changes-section {
        position: sticky;
        top: 0;
        background-color: var(--figma-color-bg);
        width: 100%;
        border-bottom: 1px solid var(--figma-color-border);
        gap: var(--size-xxsmall);
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
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .placeholder-label {
        text-align: center;
        width: 80% !important;
        line-height: var(--font-line-height) !important;
    }
</style>
