<script>
    //import Global CSS from the svelte boilerplate
    //contains Figma color vars, spacing vars, utility classes and more
    import { GlobalCSS, Button } from 'figma-plugin-ds-svelte'

    import { onMount } from 'svelte'
    import { differenceStore, rootFolder, appVersion } from '../stores.js'

    import { cyrb53, getPathData, getIconSize, parseSVGFromString } from '../svg-helpers'
    import { createEventDispatcher } from 'svelte'

    export let variant = 'primary'
    export let fileList

    let filePicker
    onMount(() => {
        filePicker = document.getElementById('fileInput')
    })

    let files
    let differences

    function cleanFiles(_files) {
        let fileArray = []
        Object.keys(_files).forEach((i) => {
            const file = _files[i]
            if (!validFileType(file)) {
                console.log(
                    `skipped: ${file.name} in ${file.webkitRelativePath} with file type ${
                        file.type || 'unknown'
                    }.`
                )
                return
            }
            fileArray.push(file)
        })
        return fileArray
    }

    let dispatch = createEventDispatcher()

    function filesSelected(e) {
        dispatch('readFiles', 'reading')

        console.log('' + files.length + ' files from selection.')

        setTimeout(() => {
            printEvent(e)
            updateFileList(files)
        }, 50)
    }

    function printEvent(event) {
        console.log(event.target.files[0].webkitRelativePath.split('/')[0])
        $rootFolder = event.target.files[0].webkitRelativePath.split('/')[0]
    }

    async function updateFileList(files) {
        let localArray = []
        const cleanedFiles = cleanFiles(files)

        console.log('Getting file contents...')
        console.time('Files loaded in:     ')

        for (let i = 0; i < cleanedFiles.length; i++) {
            const file = cleanedFiles[i]
            const fileName = file.name.split('.')[0]

            const fileContent = await file.text()
            const fileHash = cyrb53(fileContent + fileName)
            const fileDirectory = getPathData(file)
            const svgSize = getIconSize(parseSVGFromString(fileContent))

            // console.log(fileName + ' ' + svgSize + ' ' + fileDirectory);

            localArray.push({
                name: fileName,
                svg: fileContent,
                dimensions: svgSize,
                hash: fileHash,
                folder: fileDirectory,
                status: '',
                createdVersion: $appVersion,
            })
        }

        console.timeEnd('Files loaded in:     ')

        // console.log(localArray)
        // This is a hack
        // For some reason, files are missing sometimes after the local array is built
        // Since this is rare, simply restarting the file reading process fixes this issue without problems (just takes a little bit longer when that happens)
        // Wating to see if it still happens with the for loop above. The previos forEach and .then construction looked a bit ugly anyways
        if (localArray.length < cleanedFiles.length) {
            console.warn('Files are missing from array! Retrying…')
            updateFileList(files)
            throw e
        }

        // console.log('' + localArray.length + ' files to check for differences.')

        console.time('Detect differences:  ')
        differences = detectDifferences(fileList, localArray)
        console.timeEnd('Detect differences:  ')

        console.time('Create diff summary: ')

        //TODO: add status in detectDifferences function instead of here
        if (differences) {
            Object.keys(differences).forEach((keyName) => {
                const diffTypeArray = differences[keyName]
                // console.log(keyName);

                diffTypeArray.forEach((element) => {
                    if (keyName == 'deleted') {
                        //add element from difference array to flesArray if it was deleted (to restore it)
                        localArray.push(element)
                        // console.log(element);
                    }

                    //handle changed element
                    let modifiedItem = localArray.find((i) => i.hash === element.hash)

                    // console.log(modifiedItem);

                    //change status of element, modifiedItem is the element in files array
                    modifiedItem.status = keyName
                    // console.log(modifiedItem);
                })
            })
        } else {
            //if there are no figma nodes, differences is null, mark all as added
            localArray.forEach((element) => {
                element.status = 'added'
            })
        }

        localArray.sort(function (a, b) {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        })

        fileList = localArray
        console.timeEnd('Create diff summary: ')
    }

    const fileTypes = ['image/svg+xml']

    function validFileType(file) {
        return fileTypes.includes(file.type)
    }

    function detectDifferences(_figmaNodes, _selectedFiles) {
        if (!_figmaNodes) {
            console.info('no imported icons exist in Figma')
            dispatch('readFiles', 'done')
            return null
        }

        const figmaHash = _figmaNodes.map((a) => a.hash)
        const filesHash = _selectedFiles.map((a) => a.hash)

        let figmaHashSet = new Set([...figmaHash])
        let filesHashSet = new Set([...filesHash])

        //check if there are less files selected than there are in figma
        //returns icons, that appear in Figma, but not in the selected files
        //relative complement of selected files in Figma
        var hashesOnlyInFigma = new Set([...figmaHashSet].filter((x) => !filesHashSet.has(x)))

        //check if there are more files selected than there are in figma
        //returns icons, that appear in the selected files, but not in Figma
        //relative complement of Figma in selected files
        var hashesOnlyInFiles = new Set([...filesHashSet].filter((x) => !figmaHashSet.has(x)))

        // console.log(hashesOnlyInFigma);
        // console.log(hashesOnlyInFiles);

        let changedItems = {
            added: [],
            changed: [],
            deleted: [],
            unchanged: [],
        }

        //unchanged
        let hashesInBothSets = new Set([...figmaHashSet].filter((x) => filesHashSet.has(x)))

        hashesInBothSets.forEach((hash) => {
            let objInFigma = _figmaNodes.find((o) => o.hash === hash)
            let objInFiles = _selectedFiles.find((o) => o.hash === hash)

            // console.log(
            // 	`Found unchanged item in files with name ${objInFiles.name}`
            // );
            //add existing id to object
            objInFiles.id = objInFigma.id
            changedItems.unchanged.push(objInFiles)
        })

        //changed
        //same name with same properties exists in figma & selected files, but hash changed

        const figmaNames = _figmaNodes.map((a) => a.name)
        const filesNames = _selectedFiles.map((a) => a.name)

        let figmaNameSet = new Set([...figmaNames])
        let filesNameSet = new Set([...filesNames])

        var intersectingNames = new Set([...figmaNameSet].filter((x) => filesNameSet.has(x)))
        // console.log(intersectingNames);

        hashesOnlyInFigma.forEach((hash) => {
            let objInFigma = _figmaNodes.find((o) => o.hash === hash)

            let changedName = objInFigma.name
            let changedFolder = objInFigma.folder

            //folder [0] hardcoded, seems to be somehow different when coming from o.folder and objInFigma.folder
            //needs to be updated, if icons are in a folder structure deeper than one level
            let objInFiles = _selectedFiles.find(
                (o) => o.name === objInFigma.name && o.folder[0] === changedFolder[0]
            )

            // console.log(objInFigma);
            // console.log(objInFiles);

            if (objInFiles) {
                console.log(
                    `Found changed item in files with name ${changedName} in folder ${changedFolder}`
                )

                //add existing id to object
                objInFiles.id = objInFigma.id

                changedItems.changed.push(objInFiles)

                hashesOnlyInFigma.delete(hash)
                hashesOnlyInFiles.delete(objInFiles.hash)
                //double check if the next entry is not getting deleted here
            }
        })

        //TODO: reference obj in figma in files

        //deleted
        //hash & name don't exist in selected files
        //hash & name exist only in Figma
        hashesOnlyInFigma.forEach((hash) => {
            let objInFigma = _figmaNodes.find((o) => o.hash === hash)

            //find objects with same name in files
            let objInFiles = _selectedFiles.find(
                (o) => o.name === objInFigma.name && o.hash === objInFigma.hash
            )

            // console.log("objInFigma: ");
            // console.log(objInFigma);

            if (!objInFiles) {
                changedItems.deleted.push(objInFigma)
            }
        })

        //added
        //hash & name don't exist in figma
        //hash & name only exist in selected files

        hashesOnlyInFiles.forEach((hash) => {
            let objInFiles = _selectedFiles.find((o) => o.hash === hash)

            //find objects with same name in Figma
            let objInFigma = _figmaNodes.find(
                (o) => o.name === objInFiles.name && o.hash === objInFiles.hash
            )

            if (!objInFigma) {
                changedItems.added.push(objInFiles)
            }
        })

        // for (const prop in changedItems) {
        // 	console.log(`${changedItems[prop].length} item(s) ${prop}`);
        // }

        // console.log(changedItems);

        $differenceStore = changedItems

        //Spaghetti
        dispatch('readFiles', 'done')
        console.time('Display file previews: ')

        return changedItems

        // if (_difference.size == 0) {
        //   return "no differences"
        // }

        // if (_difference.size > 0) {
        //   console.log("differences");
        //   console.log(_difference);

        //   return _difference
        // }

        /*         
	status:
	  - no change
		same hash
	  - deleted
		hash & name don't exist in selected files
		hash & name exist only in Figma
	  - added
		hash & name don't exist in figma
		hash & name only exist in selected files
	  - changed
		name exists in figma & selected files, but hash changed
		all other properties need to be the same as well
		*/
    }
</script>

<input
    class="hidden"
    type="file"
    id="fileInput"
    bind:files
    on:change={(e) => filesSelected(e)}
    webkitdirectory
/>

<Button on:click={filePicker.click()} {variant}>Select Folder</Button>

<style>
    /* Add additional global or scoped styles here */
</style>
