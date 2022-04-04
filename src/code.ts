// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
console.clear()

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 400 });


const nodes = figma.currentPage.findAllWithCriteria({
	types: ['COMPONENT']
})

let existingIcons = []
let existingNodes = []

if (nodes.length !== 0) {
	nodes.forEach(node => {
		const data = node.getPluginData("importedIcon")
		if (!data) {
			return
		}

		let obj = JSON.parse(data)

		//delete all changed status from elements
		obj.status = ""


		existingIcons.push(obj)
		existingNodes.push(node)
	});
}

if (existingIcons.length !== 0) {
	figma.ui.postMessage({ type: "loaded-nodes", data: existingIcons })
} else {
	figma.ui.postMessage({ type: "loaded-nodes-empty" })
}



// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
	// One way of distinguishing between different types of messages sent from
	// your HTML page is to use an object with a "type" property like this.

	if (msg.type === 'create-library') {
		const nodes: SceneNode[] = [];
		// console.log(msg.doc);


		let row = 0
		let column = 0

		const columnCount = 50


		let carryDelta = 0

		let changeLog = {
			added: [],
			updated: []
		}


		msg.doc.forEach((element, i) => {



			// if (carryDelta != 0) {


			row = Math.floor((i) / columnCount)
			column = (i) % columnCount

			let targetRow = Math.floor((i + carryDelta) / columnCount)
			let targetColumn = (i + carryDelta) % columnCount

			// console.log("--------------");
			// // console.log(`Current offset: ${carryDelta}`);

			// console.log(`Row: ${row}, Column: ${column}`);

			let targetCoords = getCoords(targetRow, targetColumn)

			// let currentCoords
			// if (existingNodes[i]) {
			// 	currentCoords = [existingNodes[i].x, existingNodes[i].y]

			// 	console.log(`Move ${element.status == "" ? "existing" : element.status} node ${existingNodes[i].name} by ${carryDelta} step(s) from ${currentCoords} to ${targetCoords}`);

			// }

			let currentHash = element.hash

			let foundIndex = existingIcons.findIndex((e) => e.hash == currentHash)

			// console.log(`Current index ${i} Found same Icon at ${foundIndex}`);



			// let currentFigmaNode = 

			if (element.status === "added") {


				const svg = figma.createNodeFromSvg(element.svg)
				svg.name = "svg"

				const pluginData = element


				const component = figma.createComponent()
				component.resizeWithoutConstraints(svg.width, svg.height)

				let coords = getCoords(row, column)
				// console.log(`Create node at ${coords.x},${coords.y}`);

				component.x = coords.x
				component.y = coords.y

				let name
				if (element.folder.length != 0) {
					name = element.name + " / " + element.folder[0]
				} else {
					name = element.name
				}

				// if (element.status == "added") {
				//   createNewIconMarker(component)
				// }

				// "#008000"

				component.name = name

				pluginData.id = component.id

				component.setPluginData("importedIcon", JSON.stringify(pluginData))
				component.appendChild(svg)

				carryDelta++
				// console.log("add one");

				changeLog.added.push(element)
			} else {

				//if an icon wasn't added, it is either unchanged, changed or deleted

				// console.log(element);


				let changedNode = figma.getNodeById(element.id)


				if (carryDelta != 0 && changedNode) {
					// console.log("--------------");
					// console.log(`Current index ${i} Found same Icon at ${foundIndex}`);

					// console.log(`Current offset: ${carryDelta}`);

					// console.log(`Row: ${row} => ${targetRow}, Column: ${column} => ${targetColumn}`);
					let coords = getCoords(row, column)

					// console.log(changedNode);
					// console.log(`moveNode from ${changedNode.x},${changedNode.y} to ${coords.x},${coords.y}`);
					// console.log(`moveNode by ${coords.x - changedNode.x}`);

					changedNode.x = coords.x
					changedNode.y = coords.y


				} else {
					// console.log(element);

					// console.log("Node didn't need to be moved");
				}

				// console.log(changedNode);
				// console.log("update pluginData");

			}


			if (element.status === "changed") {

				//TODO: Mark node that has changed its size to warn the user


				let changedNode = figma.getNodeById(element.id)

				const svg = figma.createNodeFromSvg(element.svg)
				svg.name = "svg"

				const children = changedNode.children


				console.log("Changed Node");
				console.log(children);


				children.forEach(element => {
					element.remove()
				});

				changedNode.resizeWithoutConstraints(svg.width, svg.height)


				const pluginData = element
				changedNode.setPluginData("importedIcon", JSON.stringify(pluginData))
				changedNode.appendChild(svg)


			}

			if (element.status === "deleted") {

				console.log("mark node as deleted");

				let changedNode = figma.getNodeById(element.id)
				const pluginData = element
				changedNode.setPluginData("importedIcon", JSON.stringify(pluginData))

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






			let currentElementHash = element.hash




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
	return JSON.parse(JSON.stringify(val))
}
function createNewIconMarker(elem: ComponentNode) {
	// const stroke = clone(elem.strokes)

	const stroke = []


	const rectangle = figma.createRectangle()
	rectangle.x = elem.x - 2
	rectangle.y = elem.y - 2

	rectangle.resizeWithoutConstraints(elem.width + 4, elem.height + 4)

	rectangle.strokes = [{ type: 'SOLID', color: { r: 0, g: 0.5, b: 0 } }];
	rectangle.strokeWeight = 1
	rectangle.strokeAlign = "OUTSIDE"
	rectangle.opacity = 0.5
	rectangle.fills = []
	rectangle.cornerRadius = 2
	rectangle.locked = true

	figma.currentPage.appendChild(rectangle)

}

function getCoords(_row, _column) {

	let xPos = 0 + 64 * _column
	let yPos = 400 + _row * 80


	return {
		x: xPos,
		y: yPos
	}
}