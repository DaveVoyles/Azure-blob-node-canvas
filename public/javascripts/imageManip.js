// save img: https://stackoverflow.com/questions/923885/capture-html-canvas-as-gif-jpg-png-pdf

// var ctx = new fabric.Canvas("myCanvas");
// var img1     = loadImage('images/mj.jpg', main);
// var img2     = loadImage('images/cat.jpg',  main);
// var imgInst1 = new fabric.Image(img1, {});
// var imgInst2 = new fabric.Image(img2, {});


// var canvas     = document.getElementById('myCanvas');
// var ctx        = canvas.getContext('2d');

// function draw(cb){
//     var tileWidth  = 20;
//     var tileWCount = 6;
//     var multi      = 2;
//     var src        = [];
//         src.push('images/mj.jpg');
//         src.push('images/cat.jpg');

//     for(var i=0; i < tileWCount; i++){
//         var img        = new Image();
//             img.onload = (function(value){
//                 return function() {
//                     ctx.drawImage(this, (value * tileWidth * multi), 0, tileWidth * multi, tileWidth * multi);
//                 }
//             })(i);
//             img.src = src[i];
//     }     
//  }
// draw();

const getContext = () => document.getElementById('myCanvas').getContext('2d');

// It's better to use async image loading.
const loadImage = url => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`load ${url} fail`));
    img.src = url;
  });
};

// Here, I created a function to draw image.
const depict = options => {
  const ctx = getContext();
  // And this is the key to this solution
  // Always remember to make a copy of original object, then it just works :)
  const myOptions = Object.assign({}, options);
  return loadImage(myOptions.uri).then(img => {
    ctx.drawImage(img, myOptions.x, myOptions.y, myOptions.sw, myOptions.sh);
        var image =  document.getElementById('myCanvas').toDataURL();
    console.log(image);  
  });
};

// Must set coors on blobs to allow this to work.
// SEE: Tainted canvas - https://stackoverflow.com/questions/22710627/tainted-canvases-may-not-be-exported
const imgs = [
  { uri: 'images/mj.jpg', x: 15, y:  15, sw: 50, sh: 50 },
  { uri: 'images/cat.jpg', x: 15, y:  80, sw: 50, sh: 50 },
  { uri: 'images/mj.jpg', x: 15, y: 145, sw: 50, sh: 50 }
];

imgs.forEach(depict);




function saveCanvasToImg(){
    // var imgage  = canvas.toDataURL("image/png");
    // var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); //Convert image to 'octet-stream' (Just a download, really)
    var canvas     = document.getElementById('myCanvas');
    var image = canvas.toDataURL();
    console.log(image);
    // window.location.href = image;
}

// function setImg(){
//         var canvas     = document.getElementById('myCanvas');
//        var imgUrl  = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
//        document.write('<img src="'+imgUrl+'"/>');
//     //    var image   = document.getElementById("myImage");
//     //        image.src = imgUrl;

// }

function exportCanvasAsPNG(id, fileName) {

    var canvasElement              = document.getElementById('myCanvas');
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

// Converts canvas to an image
// function convertCanvasToImage(canvas) {
// 	var image = new Image();
// 	image.src = canvas.toDataURL("image/png");
// 	return image;
// }

// var canvas = document.getElementById("myCanvas");
// var ctx    = canvas.getContext("2d");
// var img1   = loadImage('images/mj.jpg', main);
// var img2   = loadImage('images/cat.jpg',  main);

// var imagesLoaded = 0;
// function main() {
//     imagesLoaded += 1;

//     // Skip 1st image, and occur on 2nd
//     if(imagesLoaded == 2) {
//         // composite now
//         ctx.add(imgInst1);
//         ctx.add(imgInst2);
//     }
// }

// function loadImage(src, onload) {
//     var img        = new Image();
//         img.onload = onload;
//         img.src    = src;
//         img.height = 200;
//         img.width  = 200;

//     return img;
// }