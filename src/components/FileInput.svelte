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

	let files;
	function updateFileList(_files) {
		fileList.update((__files) => _files);
	}
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
