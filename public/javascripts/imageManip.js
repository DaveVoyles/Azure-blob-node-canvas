// save img: https://stackoverflow.com/questions/923885/capture-html-canvas-as-gif-jpg-png-pdf
document.addEventListener("DOMContentLoaded", function() {
    "use strict";

    const log              = console.log.bind(console);   
    const getCanvas        = () => document.getElementById('canvas');
        getCanvas().height = 350;
        getCanvas().width  = 80;
    const getContext       = () => getCanvas().getContext('2d'     );

    // Namespace to send / receive socket messages
    var serverUrl = 'http://localhost:8080';
    var socket    = io.connect(serverUrl, {reconnect: true});
        socket.on('connect', function(socket) {
            log('CONNECTED to node server at: ' + serverUrl);
        });
   

    const loadImage = url => {
        return new Promise((resolve, reject) => {
            const img       = new Image();
                img.onload  = () => resolve(img);
                img.onerror = () => reject(new Error(`load ${url} fail`));
                img.src     = url;
        });
    };

    /** Makes a copy of the original image, draws the images to the canvas, 
     *  merges them & converts canvas to .png,  then sends to server.*/
    const depict = options => {
        const ctx       = getContext();
        const myOptions = Object.assign({}, options);

        return loadImage(myOptions.uri).then(img => {
            ctx.drawImage(img, myOptions.x, myOptions.y, myOptions.w, myOptions.h);
            let image    =  getCanvas().toDataURL();
            urltoFile(image, "myImage.png", 'image/png')
                .then(function(file){
                    // TODO: Add a date generator here to name the file
                   socket.emit('sendFileToServer', file, "myImage.png");
            }) 
        });
    };

    /** Return a promise that resolves with a File instance
     * @param {string}   url
     * @param {string}   filename
     * @param {mimeType} mimeType - 'image/png'
     * @example
     * urltoFile('data:image/png;base64,....', 'a.png', 'image/png')
     * .then(function(file){
     *     console.log(file);
     * })
     */ 
    function urltoFile(url, filename, mimeType){
        return (fetch(url)
            .then( log('converting img Url to buffer'))
            .then(function(res){return res.arrayBuffer();})
            .then(function(buf){return new File([buf], filename, {type:mimeType});})
        );
    };

    let imgH = 50;
    let imgW = 50;
    let xPos = 15;
    /** Must set coors on blobs to allow this to work.
     * Only increment Y value to offset images.
     * NOTE: Accepts images of 50x50
     * SEE: Tainted canvas - https://stackoverflow.com/questions/22710627/tainted-canvases-may-not-be-exported
     */    
     const aImgs = [
    { uri: 'images/mj.jpg',  x: xPos, y:  15, w: imgW, h: imgH },
    { uri: 'images/cat.jpg', x: xPos, y:  80, w: imgW, h: imgH },
    { uri: 'images/mj.jpg',  x: xPos, y: 145, w: imgW, h: imgH },
    { uri: 'images/cat.jpg', x: xPos, y: 210, w: imgW, h: imgH },
    { uri: 'images/mj.jpg',  x: xPos, y: 275, w: imgW, h: imgH },
    ];

    aImgs.forEach(depict);

// -----------------------------------------------------
// UN-USED FUNCTIONS

    /** Saves image and redirects page to the image */
    function saveCanvasToImg(){
        var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); //Convert image to 'octet-stream' (Just a download, really)
        log(image);
        window.location.href = image;
    }

    /** Saves image and downloads 
     * @param id       - Canvas
     * @param fileName - What should you name this saved file?
     */
    function exportCanvasAsPNG(id, fileName) {

        var canvasElement              = document.getElementById('canvas');
        var MIME_TYPE                  = "image/png";
        var imgURL                     = canvasElement.toDataURL(MIME_TYPE);
        var dlLink                     = document.createElement('a');
            dlLink.download            = "myNewImg.png";
            dlLink.href                = imgURL;
            dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    }

});
