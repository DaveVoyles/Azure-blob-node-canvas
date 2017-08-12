    /* Namespace to send / receive socket messages.
     * Call this first to establish connection. When completed, calls the rest of the scripts to execute. */
    const log     = console.log.bind(console);  
    var serverUrl = 'http://localhost:8080';
    var socket    = io.connect(serverUrl, {reconnect: true});
        socket.on('connect', function(socket) {
            log('CONNECTED to node server at: ' + serverUrl);
            runScript();
        });

// save img: https://stackoverflow.com/questions/923885/capture-html-canvas-as-gif-jpg-png-pdf
function runScript() {
    "use strict";

    const getCanvas        = () => document.getElementById('canvas');
          getCanvas().height = 350;
          getCanvas().width  =  80;
    const getContext       = () => getCanvas().getContext('2d'     );

    const loadImage = url => {
        return new Promise((resolve, reject) => {
            const img         = new Image();
                  img.onload  = () => resolve(img);
                  img.onerror = () => reject(new Error(`load ${url} fail`));
                  img.src     = url;
        });
    };

    let iterator      = 0;
    let nMaxImgInArr  = 5;

    /** Draw all images to canvas. 
     * @param {array} currentValue - The value of the current element being processed in the array.
     * @param {int}   index        - The index of the current element being processed in the array.
     * @param {array} array        - The array that forEach() is being applied to.
    */
    function drawToCanvas (currentValue, index, array) {
        return loadImage(currentValue.uri).then(img => {
            getContext().drawImage(img, currentValue.x, currentValue.y, currentValue.w, currentValue.h);
            iterator++; 
            // # of images receives from server. If not hard-coded, this func gets called out of order, 
            // sent to server before canvas has completed loading images.
            if (iterator === nMaxImgInArr) { 
              let scanvasB64  = getCanvas().toDataURL()
              let buf         =  convertB64ToByteArr(canvasImage);
              socket.emit('sendFBufToServer', buf);
            }
        });
    };
    drawToCanvas()

    /** Converts a base64 string to a byte array.
     * @param {string} sCanvasB64 - Base64 string representation of the current Canvas element.
     * @returns {Uint8Array} A byte array. 
     */
    function convertB64ToByteArr(sCanvasB64) {
        var base64String   = canvasImage.split(',')[1];
        // decode a base64-encoded string into a new string with a character for each byte of the binary data
        var byteCharacters = atob(base64String);
        // Each character's code point (charCode) will be the value of the byte. We can create an array of byte values
        var byteNumbers    = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        // convert this array of byte values into a real typed byte array
        var byteArray = new Uint8Array(byteNumbers);
        
        return byteArray;
    };


    function sendFileToServer(file) {
        socket.emit('sendFileToServer', file);
    }


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

    aImgs.forEach(drawToCanvas);

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

};