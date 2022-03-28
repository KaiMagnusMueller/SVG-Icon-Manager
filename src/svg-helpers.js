import { systemPresets, activePreset, rootFolder } from "./stores.js";

//parse document from string
export function parseDOM(_string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(_string, "image/svg+xml");
    return doc;
}

//get icon size from svg doc
export function getIconSize(_doc) {
    let dimensions = _doc.firstChild.viewBox.baseVal;
    return [dimensions.width, dimensions.height];
}

let _activePreset

activePreset.subscribe((value) => {
    _activePreset = value;
});

let _rootFolder

rootFolder.subscribe((value) => {
    _rootFolder = value;
});

//return folder array
export function getPathData(_file) {
    const reversedFullPathComponents = _file.webkitRelativePath
        .split("/")
        .reverse();
    //delete name of file
    reversedFullPathComponents.shift();

    const dirStructure = [];

    //move up to the root folder defined in the preset
    //if (element != systemPresets[_activePreset].preset.root_folder) {

    reversedFullPathComponents.forEach((element) => {
        if (element != _rootFolder) {
            dirStructure.push(element);
        }
    });

    return dirStructure;
}

export const cyrb53 = function (str, seed = 0) {
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