var zipWriter;
function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/jpg");

    return dataURL //.replace(/^data:image\/(png|jpg);base64,/, "");
}

function addFiles(files) {
    writer = new zip.BlobWriter();
    zip.createWriter(writer, function(writer) {
        zipWriter = writer;
        for (var f = 0; f < files.length; f++) {
            zipWriter.add(files[f].name,
            new zip.Data64URIReader(getBase64Image(files[f].path)), function() {});
        }
    });
}

function saveZip() {
    zipWriter.close(function(blob) {
        saveAs(blob, "Example.zip"); // uses FileSaver.js
       
        zipWriter = null;
    });
}