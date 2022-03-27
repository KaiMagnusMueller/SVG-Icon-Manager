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
let existingNodes = [];
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
        existingNodes.push(node);
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
        msg.doc.forEach((element, i) => {
            if (element.status == "added" && existingNodes.length > 0) {
                console.log(element);
                let node = figma.getNodeById(existingNodes[i].id);
                console.log(node);
            }
            const svg = figma.createNodeFromSvg(element.svg);
            svg.name = "svg";
            // svg.x = 0 + 64 * column
            // svg.y = 400 + row * 80
            const pluginData = element;
            const component = figma.createComponent();
            component.resizeWithoutConstraints(svg.width, svg.height);
            component.x = 0 + 64 * column;
            component.y = 400 + row * 80;
            let name;
            if (element.folder.length != 0) {
                name = element.name + " / " + element.folder[0];
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
            component.setPluginData("importedIcon", JSON.stringify(pluginData));
            component.appendChild(svg);
            if (i % columnCount == columnCount - 1) {
                row++;
            }
            column = (i + 1) % columnCount;
        });
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
