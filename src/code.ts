// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
console.clear()

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 330, height: 500, themeColors: true })

const nodes = figma.currentPage.findAllWithCriteria({
    types: ['COMPONENT'],
})

let existingIcons = []
let existingNodes = []

if (nodes.length !== 0) {
    nodes.forEach((node) => {
        const data = node.getPluginData('importedIcon')
        if (!data) {
            return
        }

        let obj = JSON.parse(data)

        //delete all changed status from elements
        obj.status = ''

        existingIcons.push(obj)
        existingNodes.push(node)
    })
}

if (existingIcons.length !== 0) {
    figma.ui.postMessage({ type: 'loaded-nodes', data: existingIcons })
} else {
    figma.ui.postMessage({ type: 'loaded-nodes-empty' })
}

async function getTutorials() {
    let tutorial
    try {
        tutorial = await figma.clientStorage.getAsync('tutorial')
    } catch (e) {
        console.log('Storage error:', e)
    }

    figma.ui.postMessage({
        type: 'loaded-tutorial',
        data: tutorial || undefined,
    })
}

getTutorials()

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.

    if (msg.type === 'get-tutorials') {
        console.log('get-tutorials')
        getTutorials()
    }

    if (msg.type === 'save-tutorials') {
        figma.clientStorage.setAsync('tutorial', msg.data)
        getTutorials()
    }

    if (msg.type === 'create-library') {
        const startingPos = { x: 0, y: 0 }
        const columnCount = 50

        let carryDelta = 0

        let changeLog = {
            added: [],
            updated: [],
        }

        // let processedFiles = 0
        // const fileCount = msg.doc.length

        // function progressUpdate(processedFiles: number) {
        //     // console.log((processedFiles / fileCount) * 100)

        //     const progress = (processedFiles / fileCount) * 100

        //     figma.ui.postMessage({
        //         type: 'create-library-progress',
        //         data: progress,
        //     })
        // }

        // Insert icons backwards so the layer list is sorted A-Z in the end (the first inserted icon is at the bottom)
        const elementsToInsert = msg.doc.reverse()

        elementsToInsert.forEach((element, i) => {
            let currentHash = element.hash
            // let foundIndex = existingIcons.findIndex((e) => e.hash == currentHash)
            // console.log(`Current index ${i} Found same Icon at ${foundIndex}`);

            if (element.status === 'added') {
                const pluginData = element

                const svg = figma.createNodeFromSvg(element.svg)
                svg.name = 'svg'

                const component = figma.createComponent()
                component.resizeWithoutConstraints(svg.width, svg.height)

                // TODO: Create logic that determines the best course of action for any icon
                // Some filled icons are bugged, when used in icon components that use the union layer hack for color
                // Update 12.02.24: With mask based components, this is no longer an issue

                // let cleanSVG = figma.createFrame()
                // cleanSVG.resizeWithoutConstraints(svg.width, svg.height)
                // cleanSVG.name = element.name

                // svg.children.forEach((child) => {
                //     if (
                //         child.width === svg.width &&
                //         child.height === svg.height &&
                //         child.fills[0].color.r === 1 &&
                //         child.fills[0].color.g === 1 &&
                //         child.fills[0].color.b === 1
                //     ) {
                //         console.log('Skipping full size node. Probably a Figma export artifact.')
                //         return
                //     }

                //     // if (child.type === 'VECTOR' && child.strokes[0]) {
                //     //     child = child.outlineStroke()
                //     // }
                //     child.name = 'Vector'
                //     cleanSVG.appendChild(child)
                // })

                // svg.remove()
                component.appendChild(svg)
                figma.ungroup(svg)

                // SET COORDINATES
                let coords = getCoords(i, elementsToInsert.length, startingPos, columnCount)
                // console.log(`Create node at ${coords.x},${coords.y}`);

                component.x = coords.x
                component.y = coords.y

                let name

                name =
                    element.folder.join('/') + (element.folder.length > 0 ? '/' : '') + element.name

                if (element.dimensions[0] !== element.dimensions[1]) {
                    name = name + '_' + element.dimensions[0]
                }

                // if (element.status == "added") {
                //   createNewIconMarker(component)
                // }

                component.name = name
                pluginData.id = component.id

                carryDelta++

                component.setPluginData('importedIcon', JSON.stringify(pluginData))
                changeLog.added.push(element)
            } else {
                //if an icon wasn't added, it is either unchanged, changed or deleted

                let existingNode = figma.getNodeById(element.id)

                if (existingNode) {
                    let coords = getCoords(i, elementsToInsert.length, startingPos, columnCount)

                    // console.log(existingNode);
                    // console.log(`moveNode from ${existingNode.x},${existingNode.y} to ${coords.x},${coords.y}`);
                    // console.log(`moveNode by ${coords.x - existingNode.x}`);

                    existingNode.x = coords.x
                    existingNode.y = coords.y
                } else {
                    // console.log(element);
                    // console.log("Node didn't need to be moved");
                }
            }

            if (element.status === 'changed') {
                //TODO: Mark node that has changed its size to warn the user

                let changedNode = figma.getNodeById(element.id)

                const svg = figma.createNodeFromSvg(element.svg)
                svg.name = 'svg'

                const children = changedNode.children
                changedNode.resizeWithoutConstraints(svg.width, svg.height)

                children.forEach((element) => {
                    element.remove()
                })

                const pluginData = element
                changedNode.setPluginData('importedIcon', JSON.stringify(pluginData))

                changedNode.appendChild(svg)
                figma.ungroup(svg)
            }

            if (element.status === 'deleted') {
                // console.log('mark node as deleted')

                let changedNode = figma.getNodeById(element.id)
                const pluginData = element
                changedNode.setPluginData('importedIcon', JSON.stringify(pluginData))
            }

            // processedFiles++
            // if (processedFiles % 50 === 0) {
            //     progressUpdate(processedFiles)
            // }
        })

        for (const prop in changeLog) {
            console.log(`${changeLog[prop].length} item(s) ${prop}`)
        }

        // Set relaunch button if it is not already present
        const documentNode = figma.getNodeById('0:0')
        if (!Object.keys(documentNode.getRelaunchData()).includes('update')) {
            documentNode.setRelaunchData({
                update: 'Import SVGs to update icon components in this file',
            })
        }

        figma.ui.postMessage({ type: 'done-create-library' })
        figma.notify('Successfully updated icon components')
    }
}

function clone(val) {
    const type = typeof val
    if (val === null) {
        return null
    } else if (
        type === 'undefined' ||
        type === 'number' ||
        type === 'string' ||
        type === 'boolean'
    ) {
        return val
    } else if (type === 'object') {
        if (val instanceof Array) {
            return val.map((x) => clone(x))
        } else if (val instanceof Uint8Array) {
            return new Uint8Array(val)
        } else {
            let o = {}
            for (const key in val) {
                o[key] = clone(val[key])
            }
            return o
        }
    }
    throw 'unknown'
}

function createNewIconMarker(elem: ComponentNode) {
    // const stroke = clone(elem.strokes)

    const stroke = []

    const rectangle = figma.createRectangle()
    rectangle.x = elem.x - 2
    rectangle.y = elem.y - 2

    rectangle.resizeWithoutConstraints(elem.width + 4, elem.height + 4)

    rectangle.strokes = [{ type: 'SOLID', color: { r: 0, g: 0.5, b: 0 } }]
    rectangle.strokeWeight = 1
    rectangle.strokeAlign = 'OUTSIDE'
    rectangle.opacity = 0.5
    rectangle.fills = []
    rectangle.cornerRadius = 2
    rectangle.locked = true

    figma.currentPage.appendChild(rectangle)
}

function getCoords(i, itemCount, startingPos, columnCount) {
    const row = Math.floor((itemCount - 1 - i) / columnCount)
    const column = (itemCount - 1 - i) % columnCount

    // TODO: Make gap between icons flexible or relative to the biggest icon in the update
    const xPos = startingPos.x + 64 * column
    const yPos = startingPos.y + row * 80

    return {
        x: xPos,
        y: yPos,
    }
}
