<script>
	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from "figma-plugin-ds-svelte";

	import { Button } from "figma-plugin-ds-svelte";
	import { onMount } from "svelte";
	import { fileList } from "../stores.js";

	let filePicker;
	onMount(() => {
		filePicker = document.getElementById("fileInput");
	});

	let systemPresets = [
		{
			organization: "IBM",
			system_title: "Carbon Design System",
			system_subtitle: "Carbon Icons",
			preset: {
				root_folder: "svg",
			},
		},
	];
	let activePreset = 0;

	let figmaNodes;
	let _filesArray = [];
	let files;

	let differences;

	onmessage = (event) => {
		console.log("got this from the plugin code", event.data.pluginMessage);

		if (event.data.pluginMessage.type == "loaded-nodes") {
			figmaNodes = event.data.pluginMessage.data;
			// console.log("got existing icons from Figma");
			console.log(figmaNodes);

			// handeLoadedNodes(event.data.pluginMessage.data)
		} else if (event.data.pluginMessage.type == "loaded-nodes-empty") {
			//handleEmptyNodes()
		}
	};

	function updateFileList(e) {
		let _files = [];

		Object.keys(e).forEach((i) => {
			const file = e[i];
			if (!validFileType(file)) {
				// console.log(`skipped: ${file.name} in ${file.webkitRelativePath} with file type: ${file.type} .`);
				return;
			}
			_files.push(file);
		});

		Object.keys(_files).forEach((i) => {
			const file = _files[i];

			// console.log(svgSize);
			// console.log(getIconSize(file));

			getSvgString(file).then((result) => {
				const name = file.name.split(".")[0];

				let svgString = result;
				// console.log(result)
				// console.log(filesArray[i]);

				const svgDoc = parseDOM(svgString);
				const svgSize = getIconSize(svgDoc);

				const svgHash = cyrb53(svgString);

				const fileDirectory = getPathData(file);

				_filesArray.push({
					name: name,
					svg: svgString,
					dimensions: svgSize,
					hash: svgHash,
					folder: fileDirectory,
					status: "",
				});

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

				if (i == _files.length - 1) {
					// console.log("loaded svg files");
					// console.log(_filesArray);
					// console.log(figmaNodes[0]);

					console.log("figma nodes");
					console.log(figmaNodes);
					console.log("selected files");
					console.log(_filesArray);

					differences = detectDifferences(figmaNodes, _filesArray);
					console.log(differences);

					//TODO: add status in detectDifferences function instead of here
					if (differences) {
						Object.keys(differences).forEach((keyName) => {
							const diffType = differences[keyName];
							// console.log(keyName);

							diffType.forEach((element) => {
								if (keyName == "deleted") {
									//add element from difference array to flesArray if it was deleted (to restore it)
									_filesArray.push(element);

									figmaNodes2;
								}

								//handle changed element
								let modifiedItem = _filesArray.find(
									(i) => i.hash === element.hash
								);

								//change status of element, modifiedItem is the element in files array
								modifiedItem.status = keyName;

								// console.log(_filesArray);

								// console.log(keyName);
							});
						});
					} else {
						//if there are no figma nodes, differences is null, mark all as added
						_filesArray.forEach((element) => {
							element.status = "added";
						});
					}

					_filesArray.sort(function (a, b) {
						return a.name
							.toLowerCase()
							.localeCompare(b.name.toLowerCase());
					});

					fileList.update((__files) => _filesArray);
				}
			});
		});
	}

	let fileContent = [];

	// let promise = getSvgString();

	async function getSvgString(file) {
		const svgPromise = await file.text();
		return svgPromise;
	}

	const fileTypes = ["image/svg+xml"];

	function validFileType(file) {
		return fileTypes.includes(file.type);
	}

	//parse document from string
	function parseDOM(_string) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(_string, "image/svg+xml");
		return doc;
	}

	//get icon size from svg doc
	function getIconSize(_doc) {
		let dimensions = _doc.firstChild.viewBox.baseVal;
		return [dimensions.width, dimensions.height];
	}

	//return folder array
	function getPathData(_file) {
		const reversedFullPathComponents = _file.webkitRelativePath
			.split("/")
			.reverse();
		//delete name of file
		reversedFullPathComponents.shift();

		const dirStructure = [];

		//move up to the root folder defined in the preset
		reversedFullPathComponents.forEach((element) => {
			if (element != systemPresets[activePreset].preset.root_folder) {
				dirStructure.push(element);
			}
		});

		return dirStructure;
	}

	function detectDifferences(_figmaNodes, _selectedFiles) {
		if (!_figmaNodes) {
			console.info("no imported icons exist in Figma");
			return null;
		}

		console.log("figma nodes");
		console.log(_figmaNodes);
		console.log("selected files");
		console.log(_selectedfiles);

		const figmaHash = _figmaNodes.map((a) => a.hash);
		const filesHash = _selectedFiles.map((a) => a.hash);

		let figmaHashSet = new Set([...figmaHash]);
		let filesHashSet = new Set([...filesHash]);

		//check if there are less files selected than there are in figma
		//returns icons, that appear in Figma, but not in the selected files
		//relative complement of selected files in Figma
		var hashesOnlyInFigma = new Set(
			[...figmaHashSet].filter((x) => !filesHashSet.has(x))
		);

		//check if there are more files selected than there are in figma
		//returns icons, that appear in the selected files, but not in Figma
		//relative complement of Figma in selected files
		var hashesOnlyInFiles = new Set(
			[...filesHashSet].filter((x) => !figmaHashSet.has(x))
		);

		console.log(hashesOnlyInFigma);
		console.log(hashesOnlyInFiles);

		let changedItems = {
			added: [],
			changed: [],
			deleted: [],
		};

		//changed
		//same name with same properties exists in figma & selected files, but hash changed

		const figmaNames = _figmaNodes.map((a) => a.name);
		const filesNames = _selectedFiles.map((a) => a.name);

		let figmaNameSet = new Set([...figmaNames]);
		let filesNameSet = new Set([...filesNames]);

		var intersectingNames = new Set(
			[...figmaNameSet].filter((x) => filesNameSet.has(x))
		);
		// console.log(intersectingNames);

		hashesOnlyInFigma.forEach((hash) => {
			let objInFigma = _figmaNodes.find((o) => o.hash === hash);

			let changedName = objInFigma.name;
			let changedFolder = objInFigma.folder;

			//folder [0] hardcoded, seems to be somehow different when coming from o.folder and objInFigma.folder
			//needs to be updated, if icons are in a folder structure deeper than one level
			let objInFiles = _selectedFiles.find(
				(o) =>
					o.name === objInFigma.name &&
					o.folder[0] === changedFolder[0]
			);

			// console.log(objInFigma.folder);
			// console.log(objInFiles.folder);

			if (objInFiles) {
				console.log(
					`Found changed item in files with name ${changedName} in folder ${changedFolder}`
				);

				//add existing id to object
				console.log(objInFigma);
				objInFiles.id = objInFigma.id;

				changedItems.changed.push(objInFiles);

				hashesOnlyInFigma.delete(hash);
				hashesOnlyInFiles.delete(objInFiles.hash);
				//double check if the next entry is not getting deleted here
			}
		});

		//TODO: reference obj in figma in files

		//deleted
		//hash & name don't exist in selected files
		//hash & name exist only in Figma
		hashesOnlyInFigma.forEach((hash) => {
			let objInFigma = _figmaNodes.find((o) => o.hash === hash);

			//find objects with same name in files
			let objInFiles = _selectedFiles.find(
				(o) => o.name === objInFigma.name && o.hash === objInFigma.hash
			);

			// console.log("objInFigma: ");
			// console.log(objInFigma);

			if (!objInFiles) {
				changedItems.deleted.push(objInFigma);
			}
		});

		//added
		//hash & name don't exist in figma
		//hash & name only exist in selected files

		hashesOnlyInFiles.forEach((hash) => {
			let objInFiles = _selectedFiles.find((o) => o.hash === hash);

			//find objects with same name in Figma
			let objInFigma = _figmaNodes.find(
				(o) => o.name === objInFiles.name && o.hash === objInFiles.hash
			);

			if (!objInFigma) {
				changedItems.added.push(objInFiles);
			}
		});

		for (prop in changedItems) {
			console.log(`${changedItems[prop].length} item(s) ${prop}`);
		}

		// console.log(changedItems);

		return changedItems;

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

	const cyrb53 = function (str, seed = 0) {
		let h1 = 0xdeadbeef ^ seed,
			h2 = 0x41c6ce57 ^ seed;
		for (let i = 0, ch; i < str.length; i++) {
			ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		h1 =
			Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
			Math.imul(h2 ^ (h2 >>> 13), 3266489909);
		h2 =
			Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
			Math.imul(h1 ^ (h1 >>> 13), 3266489909);
		return 4294967296 * (2097151 & h2) + (h1 >>> 0);
	};
</script>

<input
	class="hidden"
	type="file"
	id="fileInput"
	bind:files
	on:change={updateFileList(files)}
	webkitdirectory
/>

<Button on:click={filePicker.click()} variant="primary">Select Folder</Button>

<style>
	/* Add additional global or scoped styles here */
</style>
