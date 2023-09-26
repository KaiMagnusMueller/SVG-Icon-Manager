'use strict';

// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
console.clear();
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 480, themeColors: true });
const nodes = figma.currentPage.findAllWithCriteria({
    types: ['COMPONENT'],
});
let existingIcons = [];
if (nodes.length !== 0) {
    nodes.forEach((node) => {
        const data = node.getPluginData('importedIcon');
        if (!data) {
            return;
        }
        let obj = JSON.parse(data);
        //delete all changed status from elements
        obj.status = '';
        existingIcons.push(obj);
    });
}
if (existingIcons.length !== 0) {
    figma.ui.postMessage({ type: 'loaded-nodes', data: existingIcons });
}
else {
    figma.ui.postMessage({ type: 'loaded-nodes-empty' });
}
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-library') {
        // console.log(msg.doc);
        let row = 0;
        let column = 0;
        const columnCount = 50;
        let changeLog = {
            added: [],
            updated: [],
        };
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
        msg.doc.forEach((element, i) => {
            // if (carryDelta != 0) {
            row = Math.floor(i / columnCount);
            column = i % columnCount;
            // let currentCoords
            // if (existingNodes[i]) {
            // 	currentCoords = [existingNodes[i].x, existingNodes[i].y]
            // 	console.log(`Move ${element.status == "" ? "existing" : element.status} node ${existingNodes[i].name} by ${carryDelta} step(s) from ${currentCoords} to ${targetCoords}`);
            // }
            let currentHash = element.hash;
            existingIcons.findIndex((e) => e.hash == currentHash);
            // console.log(`Current index ${i} Found same Icon at ${foundIndex}`);
            if (element.status === 'added') {
                const pluginData = element;
                const svg = figma.createNodeFromSvg(element.svg);
                svg.name = 'svg';
                const component = figma.createComponent();
                component.resizeWithoutConstraints(svg.width, svg.height);
                // TODO: Create logic that determines the best course of action for any icon
                // Some filled icons are bugged, when used in icon components that use the union layer hack for color
                // const vectors = svg.children
                // const union = figma.union(vectors, svg)
                // const fills = clone(union.fills)
                // // FILL:
                // // blendMode: "NORMAL"
                // // color:
                // // b: 0.8509804010391235
                // // g: 0.8509804010391235
                // // r: 0.8509804010391235
                // // [[Prototype]]: Object
                // // opacity: 1
                // // type: "SOLID"
                // // visible: true
                // Set fill to black for the union node
                // if (fills[0].type === "SOLID") {
                // 	fills[0].color = { r: 0, g: 0, b: 0 }
                // }
                // union.fills = fills
                component.appendChild(svg);
                figma.ungroup(svg);
                // SET COORDINATES
                let coords = getCoords(row, column);
                // console.log(`Create node at ${coords.x},${coords.y}`);
                component.x = coords.x;
                component.y = coords.y;
                let name;
                if (element.dimensions[0] !== 32 || element.dimensions[1] !== 32) {
                    name = element.name + '_' + element.dimensions[0];
                }
                else {
                    name = element.name;
                }
                component.name = name;
                // if (element.status == "added") {
                //   createNewIconMarker(component)
                // }
                pluginData.id = component.id;
                component.setPluginData('importedIcon', JSON.stringify(pluginData));
                changeLog.added.push(element);
            }
            else {
                //if an icon wasn't added, it is either unchanged, changed or deleted
                let existingNode = figma.getNodeById(element.id);
                if (existingNode) {
                    let coords = getCoords(row, column);
                    // console.log(existingNode);
                    // console.log(`moveNode from ${existingNode.x},${existingNode.y} to ${coords.x},${coords.y}`);
                    // console.log(`moveNode by ${coords.x - existingNode.x}`);
                    existingNode.x = coords.x;
                    existingNode.y = coords.y;
                }
            }
            if (element.status === 'changed') {
                //TODO: Mark node that has changed its size to warn the user
                let changedNode = figma.getNodeById(element.id);
                const svg = figma.createNodeFromSvg(element.svg);
                svg.name = 'svg';
                const children = changedNode.children;
                changedNode.resizeWithoutConstraints(svg.width, svg.height);
                children.forEach((element) => {
                    element.remove();
                });
                const pluginData = element;
                changedNode.setPluginData('importedIcon', JSON.stringify(pluginData));
                changedNode.appendChild(svg);
                figma.ungroup(svg);
            }
            if (element.status === 'deleted') {
                // console.log('mark node as deleted')
                let changedNode = figma.getNodeById(element.id);
                const pluginData = element;
                changedNode.setPluginData('importedIcon', JSON.stringify(pluginData));
            }
            // processedFiles++
            // if (processedFiles % 50 === 0) {
            //     progressUpdate(processedFiles)
            // }
        });
        for (const prop in changeLog) {
            console.log(`${changeLog[prop].length} item(s) ${prop}`);
        }
        figma.ui.postMessage({ type: 'done-create-library' });
        figma.notify('Successfully updated icon components');
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
function getCoords(_row, _column) {
    let xPos = 0 + 64 * _column;
    let yPos = 0 + _row * 80;
    return {
        x: xPos,
        y: yPos,
    };
}
