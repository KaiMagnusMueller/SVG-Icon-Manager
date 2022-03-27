<script>
	import FileInput from "./components/FileInput.svelte";

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from "figma-plugin-ds-svelte";

	//import some Svelte Figma UI components
	import {
		Button,
		Input,
		Label,
		SelectMenu,
		IconButton,
		Checkbox,
		Disclosure,
		DisclosureItem,
		OnboardingTip,
		Switch,
		Section,
	} from "figma-plugin-ds-svelte";

	import {
		Icon,
		IconVisible,
		IconSpinner,
		IconStyles,
		IconBlend,
	} from "figma-plugin-ds-svelte";
	import FileList from "./components/FileList.svelte";

	//menu items, this is an array of objects to populate to our select menus
	let menuItems = [
		{
			value: "rectangle",
			label: "Rectangle",
			group: null,
			selected: false,
		},
		{ value: "triangle", label: "Triangle ", group: null, selected: false },
		{ value: "circle", label: "Circle", group: null, selected: false },
	];

	let menuItemArray = [
		{
			value: "item1",
			label: "Carbon Design System",
			group: null,
			selected: false,
		},
		{
			value: "item2",
			label: "Add Configuration ",
			group: null,
			selected: false,
		},
	];

	var selectedItem;

	import { fileList } from "./stores.js";
	import { debug } from "svelte/internal";

	let _files;
	fileList.subscribe((value) => {
		_files = value;
	});
	var disabled = true;
	var selectedShape;
	var count = 5;

	//this is a reactive variable that will return false when a value is selected from
	//the select menu, its value is bound to the primary buttons disabled prop
	$: disabled = selectedShape === null;

	function createShapes() {
		parent.postMessage(
			{
				pluginMessage: {
					type: "create-shapes",
					count: count,
				},
			},
			"*"
		);
	}

	function cancel() {
		parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
	}

	var switchValue;

	//Submit button for webkit dir
	function handleSubmit() {
		// console.log(filesArray);
		parent.postMessage(
			{ pluginMessage: { type: "create-library", doc: _files } },
			"*"
		);
	}
</script>

<div class="wrapper p-xxsmall">
	<FileInput class="p-huge" />
	<Section class="mt-huge">File List</Section>
	<FileList />
	<Button on:click={handleSubmit} class="mt-small">Submit</Button>

	<Switch value="value" bind:checked={switchValue}>Label</Switch>
	<!-- 
	<SelectMenu
		class="custom-menu"
		bind:menuItems={menuItemArray}
		bind:value={selectedItem}
		showGroupLabels
	/> -->

	<!-- 
	<IconButton on:click={createShapes} iconName={IconVisible} />

	<Label>Shape</Label>
	<SelectMenu bind:menuItems bind:value={selectedShape} class="mb-xxsmall" />

	<Label>Count</Label>
	<Input iconText="#" bind:value={count} class="mb-xxsmall" />

	<div class="flex p-xxsmall mb-xsmall">
		<Button on:click={cancel} variant="secondary" class="mr-xsmall"
			>Cancel</Button
		>
		<Button on:click={createShapes} class="mb-huge" bind:disabled
			>Create shapes</Button
		>
	</div> -->
</div>

<style>
	.custom-menu button {
		height: 40px !important;
	}

	.custom-menu * .label,
	.custom-menu * .placeholder {
		font-size: var(--font-size-small) !important;
	}

	/* Add additional global or scoped styles here */
</style>
