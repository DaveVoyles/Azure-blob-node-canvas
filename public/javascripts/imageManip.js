
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

    const getCanvas          = () => document.getElementById('canvas');
          getCanvas().height = 350;
          getCanvas().width  =  80;
    const getContext         = () => getCanvas().getContext ('2d'    );

    let imgH = 50;
    let imgW = 50;
    let xPos = 15;
    /**
     * Stores image properties, which will be used when it is drawn on canvas.
     * {string} 'uri' property is set when we loop through blobs that are returned from blob.
     */    
    var aImgs = [
        { x: xPos, y:  15, w: imgW, h: imgH },
        { x: xPos, y:  80, w: imgW, h: imgH },
        { x: xPos, y: 145, w: imgW, h: imgH },
        { x: xPos, y: 210, w: imgW, h: imgH },
        { x: xPos, y: 275, w: imgW, h: imgH }
    ];

    
    /** 
     * Receives images from blob storage -> node server.
     * Set uri property in images array with "name" from blob storage item.
     * BUG: res.length grows each time I call this. Weird?
     * Have to hardcode length of array so that it only returns 5.
     */
    socket.on('sendImgArrToClient', function (res){
        for (var index = 0; index < 5; index++) {
            aImgs[index].uri = res[index].name;
        }
        aImgs.forEach(drawToCanvasFromBlob)
    });

  
    function loadImgFromBlob(url) {
        var containerUrl = "https://functionsstorageacct.blob.core.windows.net/dumpster/";

        return new Promise((resolve, reject) => {
            const img         = new Image();
                  // Allows for images obtained from blob to be merged from canvas and exported.
                  // SEE: https://stackoverflow.com/questions/20424279/canvas-todataurl-securityerror
                  img.setAttribute('crossOrigin', 'anonymous');
                  img.onload  = () => resolve(img);   
                  img.onerror = () => reject(new Error(`load ${url} fail`));
                  img.src     = containerUrl + url;
        });
    };

    
    /** Keeps track of how many times we've drawn an image to the canvas */
    var iterator = 0;
    /**When when the iterator matches this #, we can convert to dataURL */
    let nMaxImgInArr  = 5;
    
    function drawToCanvasFromBlob (currentValue, index, array) {
        return loadImgFromBlob (currentValue.uri).then(img => {
            getContext().drawImage(img, currentValue.x, currentValue.y, currentValue.w, currentValue.h);
            iterator++; 
            // # of images receives from server. If not hard-coded, this func gets called out of order, 
            // sent to server before canvas has completed loading images.
            if (iterator === nMaxImgInArr) { 
                log('sending file to server');
                let canvasImgUrl =  getCanvas().toDataURL(); 
                urltoFile(canvasImgUrl, "myImage.png", 'image/png') 
                    .then(function(file){ 
                        socket.emit('sendFileToServer', file);
                })       
            }
        });
    };


    /**
     * Loads images from a url.
     * @param {string} url - Addresss image is located at. 
     */
    function loadImg(url) {
        return new Promise((resolve, reject) => {
            const img         = new Image();
                  img.onload  = () => resolve(img);
                  img.onerror = () => reject(new Error(`load ${url} fail`));
                  img.src     = url;
        });
    };

    /** new Date().today() */
    Date.prototype.today = function () { 
        return new Date().toISOString().replace(/T.*/,'').split('-').reverse().join('-')       
    };

    /** new Date().timeNow() */
    Date.prototype.timeNow = function () {
        return ((this.getHours() < 10)?"0":"") + this.getHours() +"-"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    };

    /** Rename file by appending today's date. Probably not needed anymore */
    function renameFile(fileName){
        let newFileName = '';
        let today       = new Date().today  ();
        let now         = new Date().timeNow();
        let extension   = fileName.split('.').pop();
        var output      = fileName.substr(0, fileName.lastIndexOf('.')) || fileName;

        newFileName = output + '-' + today  + '.' + extension;
        log(newFileName);

        // return newFileName;
    };


    /** 
     * Return a promise that resolves with a File instance
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
            .then(function(res){return res.arrayBuffer();})
            .then(function(buf){return new File([buf], filename, {type:mimeType});})
        );
    };


// -----------------------------------------------------
// UN-USED FUNCTIONS

    /** Saves image and redirects page to the image */
    function saveCanvasToImgAndRedirect(){
        var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); //Convert image to 'octet-stream' (Just a download, really)
        log(image);
        window.location.href = image;
    }


    /**
     * Converts a canvas URL to a base64 string and emits to node server
     * @param {string} canvasImgUrl - canvas.toDataURL 
     */
    function sendAsB64String (canvasImgUrl) {
        let base64String = canvasImgUrl.split(',')[1];
        socket.emit('sendB64ToServer', base64String);
   };


   /**
    * Converts canvas URL to a byte array and emits to node server
    * @param {string} canvasImgUrl - canvas.toDataURL 
    */
   function sendAsByteArr(canvasImgUrl){ 
       let buf = convertB64ToByteArr(canvasImgUrl);
       socket.emit('sendByteArrToServer', buf);
   };


   /**
    * Converts a base64 string to a byte array.
    * @param {string} sCanvasB64 - Base64 string representation of the current Canvas element.
    * @returns {Uint8Array} A byte array. 
    */
   function convertB64ToByteArr(sCanvasB64) {
       var base64String   = sCanvasB64.split(',')[1];
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


    /** 
     * Saves image and downloads 
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

};