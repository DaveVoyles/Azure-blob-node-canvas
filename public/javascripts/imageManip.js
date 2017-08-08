// save img: https://stackoverflow.com/questions/923885/capture-html-canvas-as-gif-jpg-png-pdf

const getCanvas  = () => document.getElementById('canvas');
const getContext = ()  => getCanvas().getContext('2d'    );

// It's better to use async image loading.
const loadImage = url => {
  return new Promise((resolve, reject) => {
    const img         = new Image();
          img.onload  = () => resolve(img);
          img.onerror = () => reject(new Error(`load ${url} fail`));
          img.src     = url;
  });
};

/** Draw the image */
const depict = options => {
  const ctx  = getContext();

  // Make a copy of the original
  const myOptions = Object.assign({}, options);
  return loadImage(myOptions.uri).then(img => {
    ctx.drawImage(img, myOptions.x, myOptions.y, myOptions.w, myOptions.h);
    //  getCanvas().height  = window.innerheight;
    // var image =  getCanvas().toDataURL();
  });
};

let imgH = 50;
let imgW = 50;
let xPos = 15;
// Must set coors on blobs to allow this to work.
// Only increment Y value to offset images
// Accept images of 50x50
// SEE: Tainted canvas - https://stackoverflow.com/questions/22710627/tainted-canvases-may-not-be-exported
const imgs = [
  { uri: 'images/mj.jpg',  x: xPos, y:  15, w: imgW, h: imgH },
  { uri: 'images/cat.jpg', x: xPos, y:  80, w: imgW, h: imgH },
  { uri: 'images/mj.jpg',  x: xPos, y: 145, w: imgW, h: imgH },
  { uri: 'images/cat.jpg', x: xPos, y: 210, w: imgW, h: imgH },
  { uri: 'images/mj.jpg',  x: xPos, y: 275, w: imgW, h: imgH },
];

imgs.forEach(depict);



/** Saves image and redirects page to the image */
function saveCanvasToImg(){
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); //Convert image to 'octet-stream' (Just a download, really)
    console.log(image);
    window.location.href = image;
}

/** Saves image and downloads 
 * @param id - Canvas
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


