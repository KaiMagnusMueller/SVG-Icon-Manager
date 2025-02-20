import { writable, readable } from 'svelte/store'

export let differenceStore = writable()

export let systemPresets = [
    {
        organization: 'IBM',
        system_title: 'Carbon Design System',
        system_subtitle: 'Carbon Icons',
        preset: {
            root_folder: 'svg',
        },
    },
]
export let activePreset = writable(0)

export let rootFolder = writable('')

export const appVersion = readable('0.1.0')

export let importLog = writable([])