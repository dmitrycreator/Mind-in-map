//export { createGuid, isIntersected };

/*** генерация GUID
 * @returns {string}
 ***/
function createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
}

function download(text, name, type) {
    let lnk = document.createElement('a');
    let file = new Blob([text], { type: type });
    lnk.href = URL.createObjectURL(file);
    lnk.download = name;
    lnk.click();
}

function isIntersected(path1, path2) {
    return ((path1.getIntersections(path2).length > 0) || path1.contains(path2.bounds));
}