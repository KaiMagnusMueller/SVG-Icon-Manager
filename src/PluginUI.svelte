<script>
    import { fade } from 'svelte/transition'
    import HeroImage from './hero-image3.svg'
    import FileInput from './components/FileInput.svelte'
    import FileList from './components/FileList.svelte'
    import { Confetti } from 'svelte-confetti'
    import ActionCard from './components/ActionCard.svelte'

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

    import { differenceStore, importLog } from './stores.js'
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
            console.time('Display file previews: ')

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
            document.getElementsByTagName('body')[0].scrollTo(0, 0)
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

<div class="min-height-100">
    {#if fileListLoaded && fileList.length === 0}
        <!-- ----------------------- -->
        <!-- NO LIBRARY IN THIS FILE -->

        <div class="placeholder" transition:fade={{ duration: 100 }}>
            <!-- <img src="./src/hero-image.png" alt="" /> -->
            <div class="hero-image">
                {@html HeroImage}
            </div>
            <ActionCard elevation={1}>
                <div
                    class="action-header flex flex-row align-items-center"
                    style="gap: 8px;"
                    slot="header"
                >
                    <FileInput
                        bind:fileList
                        on:readFiles={(e) => (readFileState = e.detail)}
                        on:readFiles={() => (filesSubmitted = true)}
                    />

                    <a
                        target="_blank"
                        href="https://www.kaimagnus.de/articles/building-icon-libraries-with-icon-library-manager"
                        >Read the blog post ↗</a
                    >
                </div>
                <div class="action-body" slot="body">
                    <p class="">Create a library by selecting a source folder with .svg files.</p>
                    <p>
                        Learn how to make managing and updating libraries even easier with npm in
                        the introduction blog post.
                    </p>
                </div>
            </ActionCard>
            <ActionCard elevation={1}>
                <div slot="header">
                    <h2>Quick Start</h2>
                    <p>Try out the plugin with carbon icons:</p>
                </div>
                <div slot="body">
                    <ol style="margin: unset;">
                        <li>
                            <a
                                target="_blank"
                                href="https://registry.npmjs.org/@carbon/icons/-/icons-11.36.0.tgz"
                                >Download the older 11.36 version
                            </a> of carbon icons from npm and unpack it.
                        </li>
                        <li>
                            Click "Select folder" above and import the "svg" folder from the one you
                            just unpacked.
                        </li>
                        <li>Create the library.</li>
                        <li>
                            <a
                                target="_blank"
                                href="https://registry.npmjs.org/@carbon/icons/-/icons-11.42.0.tgz"
                                >Download the newer 11.42 version</a
                            >, for example.
                        </li>
                        <li>Update the library… Profit.</li>
                    </ol>
                    <p>
                        See <a
                            target="_blank"
                            href="https://www.kaimagnus.de/articles/building-icon-libraries-with-icon-library-manager"
                            >the blog post above</a
                        > for more information.
                    </p>
                </div>
            </ActionCard>

            <ActionCard>
                <div slot="header">
                    <h2>Feedback</h2>
                </div>
                <div slot="body">
                    <p>I'd like to learn more about the users of this plugin.</p>
                    <p>
                        Help me by filling out this short <a
                            target="_blank"
                            href="https://docs.google.com/forms/d/e/1FAIpQLScavE3i5hWnqDyNM7Mgc1_shGPRP6hSe7LG7jGqtnT6hhkaOg/viewform?usp=sf_link"
                            >Google Form ↗️</a
                        > to tell me more about your experience, thanks!
                    </p>
                </div>
            </ActionCard>
        </div>
    {:else if fileListLoaded && fileList.length > 0}
        <!-- --------------------------- -->
        <!-- LIBRARY EXISTS IN THIS FILE -->
        <div transition:fade={{ duration: 100 }}>
            <div class="flex column min-height-100">
                {#if createLibraryState !== 'done'}
                    <!-- ------------------------------------------ -->
                    <!-- NO LIBRARY CREATED/UPDATED IN THIS SESSION -->
                    {#if _differences != null}
                        <div class="apply-changes-section p-xxsmall flex column">
                            <!-- SVG FILES IMPORTED -->
                            <div class="flex align-items-center">
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
                                            {_differences.deleted.length || ' No'} icons were removed
                                            and
                                        </span>
                                        <span>
                                            {_differences.changed.length || 'none'} changed.
                                        </span>
                                    </p>
                                {:else}
                                    <!-- SVG FILES IMPORTED AND NO LIBRARY IN FILE-->
                                    <p>
                                        Continue to create a component library with {_differences
                                            .added.length || 'No'} new icons here.
                                    </p>
                                {/if}
                            </div>
                            {#if $importLog.length > 0}
                                <div class="flex align-items-center">
                                    <p>
                                        There {$importLog.length <= 1 ? 'was' : 'were'}
                                        {$importLog.length}
                                        {$importLog.length <= 1 ? 'issue' : 'issues'} while reading files.
                                        This can be caused by corrupted SVG files or missing attributes.
                                        Please check the console for more information.
                                    </p>
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <!-- NO FILES IMPORTED -->
                        <div class="update-library-select flex justify-content-between">
                            <FileInput
                                bind:fileList
                                variant="secondary"
                                on:readFiles={() => (filesSubmitted = true)}
                                on:readFiles={(e) => (readFileState = e.detail)}
                            />
                            <Label class="">
                                Select a folder containing .svg files to update the library.
                            </Label>
                        </div>
                    {/if}
                {:else}
                    <div
                        style="position: fixed;top: -20px;left: 0;height: 100vh;width: 100vw;display: flex;justify-content: center;overflow: hidden;pointer-events: none; z-index: 999"
                    >
                        <Confetti
                            <Confetti
                            delay={[100, 150]}
                            x={[-0.6, 0.6]}
                            y={[-1.25, -0.25]}
                            cone
                            duration={3000}
                            xSpread="0.3"
                        />
                        <Confetti
                            delay={[100, 150]}
                            amount="10"
                            x={[-0.4, 0.4]}
                            duration={3000}
                            y={[-1.25, -0.25]}
                        />
                        <Confetti
                            delay={[100, 150]}
                            amount="10"
                            x={[-0.4, 0.4]}
                            duration={3000}
                            y={[-0.75, -0.15]}
                        />
                    </div>
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
                {#if createLibraryState === 'done'}
                    <div class="placeholder footer">
                        <ActionCard>
                            <div slot="body">
                                <p>
                                    I'm interested in your feedback. If you have a minute, help me
                                    by filling out this <a
                                        target="_blank"
                                        href="https://docs.google.com/forms/d/e/1FAIpQLScd0UXvrv23e10oRjkSMGtNPjCXHmB0IfGdnWLVUw0YQTxfmg/viewform?usp=sf_link"
                                        >Google Form ↗️</a
                                    >, thank you!
                                </p>
                            </div>
                        </ActionCard>
                    </div>
                {/if}

                {#if createLibraryState !== 'done' && _differences == null}
                    <div class="placeholder footer">
                        <ActionCard>
                            <div slot="body">
                                <p>
                                    Seeing this for the first time? Read the blog post <a
                                        target="_blank"
                                        href="https://www.kaimagnus.de/articles/building-icon-libraries-with-icon-library-manager"
                                        >Maintaining Icon Libraries in Figma with ILM</a
                                    > to learn more about managing icon libraries with this plugin.
                                </p>
                            </div>
                        </ActionCard>
                    </div>
                {/if}
                <FileList {fileList} />
                {#if createLibraryState !== 'done' && _differences == null && tutorialLoaded}
                    <div class="section--tutorial">
                        <Tutorial {viewedTutorials} />
                    </div>
                {/if}
                <footer>
                    <Button variant="tertiary" on:click={resetTutorials}>Reset tutorials</Button>
                </footer>
            </div>
        </div>
    {/if}
</div>

<style>
    a {
        color: var(--figma-color-text-brand);
    }

    :global(.hero-image svg) {
        width: 100%;
        height: auto;
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

    .apply-changes-section div {
        gap: var(--size-xxsmall);
    }

    .apply-changes-section p,
    .apply-changes-section span {
        font-size: var(--font-size-xsmall);
        margin: 0;
        color: var(--figma-color-text);
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

    .min-height-100 {
        min-height: 100%;
    }

    .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;

        padding: 0 0.75rem 0.75rem 0.75rem;
        gap: 0.75rem;
    }

    .placeholder.footer {
        margin-top: 0.75rem;
        /* position: sticky;
        bottom: 0; */
    }

    h1,
    h2,
    h3 {
        margin: 0;
    }

    h2 {
        font-size: var(--font-size-large);
        font-weight: var(--font-weight-bold);
    }

    footer {
        margin-inline: 0.75rem;
    }
</style>
