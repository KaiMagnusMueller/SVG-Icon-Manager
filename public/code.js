'use strict';

// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
console.clear();
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 400 });
const nodes = figma.currentPage.findAllWithCriteria({
    types: ['COMPONENT']
});
let existingIcons = [];
if (nodes.length !== 0) {
    nodes.forEach(node => {
        const data = node.getPluginData("importedIcon");
        if (!data) {
            return;
        }
        let obj = JSON.parse(data);
        //delete all changed status from elements
        obj.status = "";
        existingIcons.push(obj);
    });
}
if (existingIcons.length !== 0) {
    figma.ui.postMessage({ type: "loaded-nodes", data: existingIcons });
}
else {
    figma.ui.postMessage({ type: "loaded-nodes-empty" });
}
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-library') {
        // console.log(msg.doc);
        let row = 0;
        let column = 0;
        const columnCount = 50;
        let carryDelta = 0;
        let changeLog = {
            added: [],
            updated: []
        };
        msg.doc.forEach((element, i) => {
            // if (carryDelta != 0) {
            row = Math.floor((i) / columnCount);
            column = (i) % columnCount;
            // let currentCoords
            // if (existingNodes[i]) {
            // 	currentCoords = [existingNodes[i].x, existingNodes[i].y]
            // 	console.log(`Move ${element.status == "" ? "existing" : element.status} node ${existingNodes[i].name} by ${carryDelta} step(s) from ${currentCoords} to ${targetCoords}`);
            // }
            let currentHash = element.hash;
            existingIcons.findIndex((e) => e.hash == currentHash);
            // console.log(`Current index ${i} Found same Icon at ${foundIndex}`);
            // let currentFigmaNode = 
            if (element.status === "added") {
                const pluginData = element;
                const svg = figma.createNodeFromSvg(element.svg);
                svg.name = "svg";
                const component = figma.createComponent();
                component.resizeWithoutConstraints(svg.width, svg.height);
                svg.outlineStroke;
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
                // if (element.folder.length > 1) {
                // 	name = element.name + " / " + element.folder.join(" / ")
                // } else {
                // name = element.name
                // }
                if (element.dimensions[0] !== 32 || element.dimensions[1] !== 32) {
                    name = element.name + "_" + element.dimensions[0];
                }
                else {
                    name = element.name;
                }
                // if (element.status == "added") {
                //   createNewIconMarker(component)
                // }
                // "#008000"
                component.name = name;
                pluginData.id = component.id;
                carryDelta++;
                // console.log("add one");
                component.setPluginData("importedIcon", JSON.stringify(pluginData));
                changeLog.added.push(element);
            }
            else {
                //if an icon wasn't added, it is either unchanged, changed or deleted
                // console.log(element);
                let changedNode = figma.getNodeById(element.id);
                if (carryDelta != 0 && changedNode) {
                    // console.log("--------------");
                    // console.log(`Current index ${i} Found same Icon at ${foundIndex}`);
                    // console.log(`Current offset: ${carryDelta}`);
                    // console.log(`Row: ${row} => ${targetRow}, Column: ${column} => ${targetColumn}`);
                    let coords = getCoords(row, column);
                    // console.log(changedNode);
                    // console.log(`moveNode from ${changedNode.x},${changedNode.y} to ${coords.x},${coords.y}`);
                    // console.log(`moveNode by ${coords.x - changedNode.x}`);
                    changedNode.x = coords.x;
                    changedNode.y = coords.y;
                }
                // console.log(changedNode);
                // console.log("update pluginData");
            }
            if (element.status === "changed") {
                //TODO: Mark node that has changed its size to warn the user
                let changedNode = figma.getNodeById(element.id);
                console.log(element);
                console.log(changedNode);
                const svg = figma.createNodeFromSvg(element.svg);
                svg.name = "svg";
                const children = changedNode.children;
                changedNode.resizeWithoutConstraints(svg.width, svg.height);
                console.log("Changed Node");
                console.log(children);
                children.forEach(element => {
                    element.remove();
                });
                const vectors = svg.children;
                const union = figma.union(vectors, svg);
                const fills = clone(union.fills);
                if (fills[0].type === "SOLID") {
                    fills[0].color = { r: 0, g: 0, b: 0 };
                }
                union.fills = fills;
                const pluginData = element;
                changedNode.setPluginData("importedIcon", JSON.stringify(pluginData));
                changedNode.appendChild(svg);
                figma.ungroup(svg);
                // const svg = figma.createNodeFromSvg(element.svg)
                // svg.name = "svg"
                // const component = figma.createComponent()
                // component.resizeWithoutConstraints(svg.width, svg.height)
                // const vectors = svg.children
                // const union = figma.union(vectors, svg)
                // component.setPluginData("importedIcon", JSON.stringify(pluginData))
                // component.appendChild(svg)
                // figma.ungroup(svg)
            }
            if (element.status === "deleted") {
                console.log("mark node as deleted");
                let changedNode = figma.getNodeById(element.id);
                const pluginData = element;
                changedNode.setPluginData("importedIcon", JSON.stringify(pluginData));
            }
            // console.log(element);
            // console.log(existingNodes[i]);
            // console.log(`Place element at ${targetCoords}`);
            // }
            // if (element.status === "added") {
            // 	carryDelta++
            // 	console.log("add one");
            // } else if (element.status === "removed") {
            // 	carryDelta--
            // 	console.log("remove one");
            // }
            element.hash;
            // if (element.status == "added" && existingNodes.length > 0) {
            // 	console.log(element);
            // 	let node = figma.getNodeById(existingNodes[i].id)
            // 	console.log(node);
            // }
            // const svg = figma.createNodeFromSvg(element.svg)
            // svg.name = "svg"
            // // svg.x = 0 + 64 * column
            // // svg.y = 400 + row * 80
            // const pluginData = element
            // const component = figma.createComponent()
            // component.resizeWithoutConstraints(svg.width, svg.height)
            // component.x = 0 + 64 * column
            // component.y = 400 + row * 80
            // let name
            // if (element.folder.length != 0) {
            // 	name = element.name + " / " + element.folder[0]
            // } else {
            // 	name = element.name
            // }
            // // if (element.status == "added") {
            // //   createNewIconMarker(component)
            // // }
            // // "#008000"
            // component.name = name
            // pluginData.id = component.id
            // component.setPluginData("importedIcon", JSON.stringify(pluginData))
            // component.appendChild(svg)
            // if (i % columnCount == columnCount - 1) {
            // 	row++
            // }
            // row = Math.floor(i / columnCount)
            // column = (i + 1) % columnCount
        });
        for (const prop in changeLog) {
            console.log(`${changeLog[prop].length} item(s) ${prop}`);
        }
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
function clone(val) {
    const type = typeof val;
    if (val === null) {
        return null;
    }
    else if (type === 'undefined' || type === 'number' ||
        type === 'string' || type === 'boolean') {
        return val;
    }
    else if (type === 'object') {
        if (val instanceof Array) {
            return val.map(x => clone(x));
        }
        else if (val instanceof Uint8Array) {
            return new Uint8Array(val);
        }
        else {
            let o = {};
            for (const key in val) {
                o[key] = clone(val[key]);
            }
            return o;
        }
    }
    throw 'unknown';
}
function getCoords(_row, _column) {
    let xPos = 0 + 64 * _column;
    let yPos = 400 + _row * 80;
    return {
        x: xPos,
        y: yPos
    };
}
