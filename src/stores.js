import { writable } from 'svelte/store';

export let fileList = writable([]);


// fileList.subscribe(value => {
//     console.log(value);
// }); // logs '0'



export let systemPresets = [
    {
        organization: "IBM",
        system_title: "Carbon Design System",
        system_subtitle: "Carbon Icons",
        preset: {
            root_folder: "svg",
        },
    },
];
export let activePreset = writable(0)


export let rootFolder = writable("")