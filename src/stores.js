import { writable } from 'svelte/store';

export let fileList = writable();


// fileList.subscribe(value => {
//     console.log(value);
// }); // logs '0'