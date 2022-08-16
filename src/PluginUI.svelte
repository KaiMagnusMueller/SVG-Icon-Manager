<script>
	import FileInput from './components/FileInput.svelte';

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from 'figma-plugin-ds-svelte';

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
	} from 'figma-plugin-ds-svelte';

	import { Icon, IconVisible, IconSpinner, IconStyles, IconBlend } from 'figma-plugin-ds-svelte';
	import FileList from './components/FileList.svelte';

	//menu items, this is an array of objects to populate to our select menus
	let menuItems = [
		{
			value: 'rectangle',
			label: 'Rectangle',
			group: null,
			selected: false,
		},
		{ value: 'triangle', label: 'Triangle ', group: null, selected: false },
		{ value: 'circle', label: 'Circle', group: null, selected: false },
	];

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
	];

	var selectedItem;

	import { differenceStore, fileList } from './stores.js';
	import { debug } from 'svelte/internal';

	let _files;
	fileList.subscribe((value) => {
		_files = value;
	});
	var disabled = true;
	var selectedShape;
	var count = 5;

	let _differences;
	differenceStore.subscribe((value) => {
		_differences = value;
	});
	let categories = [];

	$: {
		for (const prop in _differences) {
			console.log(`${_differences[prop].length} item(s) ${prop}`);
			categories.push(`${_differences[prop].length} item(s) ${prop}`);
		}
		console.log(categories);
	}

	//this is a reactive variable that will return false when a value is selected from
	//the select menu, its value is bound to the primary buttons disabled prop
	$: disabled = selectedShape === null;

	function createShapes() {
		parent.postMessage(
			{
				pluginMessage: {
					type: 'create-shapes',
					count: count,
				},
			},
			'*'
		);
	}

	function cancel() {
		parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
	}

	var switchValue;

	//Submit button for webkit dir
	function handleSubmit() {
		// console.log(filesArray);
		parent.postMessage({ pluginMessage: { type: 'create-library', doc: _files } }, '*');
	}
</script>

<div class="wrapper" class:height-full={_files.length === 0}>
	{#if _files.length === 0}
		<div class="placeholder">
			<FileInput />
			<div class="placeholder-label mt-xxsmall">
				<Label class="">No existing icons found. Import icons into this file by selecting a source folder</Label
				>
			</div>
		</div>
	{:else if _files.length > 0}
		<div class="top-section p-xxsmall">
			<FileInput />
			<!-- <p>${_differences} icons found</p> -->

			{#if _differences != null}
				<div class="summary-section">
					<p>Added:</p>
					<p>{_differences.added.length}</p>
					<p>Removed:</p>
					<p>{_differences.deleted.length}</p>
					<p>Changed:</p>
					<p>{_differences.changed.length}</p>
				</div>
			{/if}
			{#each categories as category}
				<p>{category}</p>
			{/each}
		</div>
		<div class="content-section p-xxsmall">
			<Section>File List</Section>
			<FileList {_files} />
			<Button on:click={handleSubmit} class="mt-small">Apply Changes</Button>
		</div>
	{/if}
</div>

<style>
	.custom-menu button {
		height: 40px !important;
	}

	.custom-menu * .label,
	.custom-menu * .placeholder {
		font-size: var(--font-size-small) !important;
	}

	.top-section {
		background-color: #f1f1f1;
		border-bottom: 1px solid #d6d6d6;
		display: flex;
		flex-direction: row;
		gap: 20px;
	}

	.summary-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px 10px;
	}

	.summary-section p {
		font-size: var(--font-size-xsmall);
		margin: 0;
	}

	.content-section {
		display: flex;
		flex-direction: column;
		align-items: baseline;
	}

	.wrapper {
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
