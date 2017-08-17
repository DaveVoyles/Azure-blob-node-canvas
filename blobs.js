// exports.blobs = function() {

// // -----------------------------------------------------
// // Blob Storage vars

// /** new Date().today() */
// Date.prototype.today = function () { 
//     return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
// };

// /** new Date().timeNow() */
// Date.prototype.timeNow = function () {
//     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
// };

// var log          = console.log.bind(console);  

// // Defined in .env file, using dotenv
// var azure              = require('azure-storage')                   ;
// var storageAccountName = process.env.AZURE_STORAGE_ACCOUNT          ;
// var connString         = process.env.AZURE_STORAGE_CONNECTION_STRING;
// var accessKey          = process.env.AZURE_STORAGE_ACCESS_KEY       ;
// var blobService        = azure.createBlobService()                  ;

// // Temp vars
// var sContainer = "dumpster";
// var sBlob      = "cat.jpg" ;

// // NOTE: Functions past here do not get called when app.js is loaded


// /** Return blobs with the prefix of today's date. */
// function getBlobs(){
//     log('getting blobs');
//     blobService.listBlobsSegmentedWithPrefix(sContainer, new Date().today(), null, {delimiter: "", maxResults : 5},
//         function(err, result) {
//         if (err) {
//             log("Couldn't list blobs for container %s", sContainer);
//             error(err);
//         } else {
//             log('Successfully listed blobs for container %s', sContainer);
//             log(result.entries);  
//             // Loop through each entry in the blob and save it locally to server under "images" folder
//             result.entries.forEach(function(element) {
//                 var sNormalizedPath =__dirname + path.normalize('/public/images/');                  
//                 var loc             = sNormalizedPath + element.name;
//                 aImgs.push(element);
//                 blobService.getBlobToLocalFile(sContainer, element.name, loc, null,
//                         function(result, err){
                          
//                             // TODO: 1. Store images in an array
//                             //       2. Call func to have client read images 
//                 })
//                 log('got images');
//             }, this);
//             log(aImgs[0]);
//             var app = require('app.js');

//             app.socket.emit('sendImgArrToClient', aImgs);           
//         }
//     });
// };

// // -----------------------------------------------------
// // Storage

// /** Writes a file to the /public/images folder
//  * @param {string} sImgName - Name of file to be saved. Needs to end in .png | .jpg
//  * @param {array}  buf      - Byte array buffer w/ image data   */
// function writeFileLocally(sImgName, buf){
//         fs.writeFile(__dirname + '/public/images/' + sImgName, buf,  function(err){
//         if (err) {throw err;}
//     })
// };


// /** Returns a result segment containing a collection of blob items in the container.*/
// function listBlobs () {
//     blobService.listBlobsSegmented(sContainer, null, function(err, result) {
//          if (err) {
//             log("Couldn't list containers");
//             log.error(err);
//         } else {
//             log('Successfully listed containers');
//             log(result.entries);
//             log(result.continuationToken);
//         }
//     });
// };



// /** Downloads a blob into a file. */
// function getBlobToLocalFile () {
//     blobService.getBlobToLocalFile(sContainer, sBlob,sNewName, function(error, result, response) {
//         if (!error) {
//             log("blob retrieved. NAME: " + result.name);
//         }
//     });    
// };


// function createBlobFromStream(sName, stream) {
//     blobService.createBlockBlobFromStream(sContainer, "myName.png", stream, stream.length, function(error) {
//         if (error){
//             log(error);}
//         }
//     );
// };

//     /** new Date().today() */
//     Date.prototype.today = function () { 
//         return new Date().toISOString().replace(/T.*/,'').split('-').reverse().join('-')       
//     };

//     log(new Date().today());
//     /** new Date().timeNow() */
//     Date.prototype.timeNow = function () {
//         return ((this.getHours() < 10)?"0":"") + this.getHours() +"-"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
//     };



// function createBlockBlob(sName, dir) {
//     //File exists - check here to be sure 
//     fs.readFile(__dirname + '/public/images/' + sName, function(err, data) {
//         log('sName: '+ sName);
//         log('dir:   '+ dir  );
//         log('data:  '+ data );
//     });

//     blobService.createBlockBlobFromLocalFile(sContainer, sName, dir, function(error, result, response) {
//         if (!error) {
//             // log(result  );
//             // log(response);
//             // log("UPLOADING: " + result.name + " \n from: " + dir);
//             // URL containing the image works, but file is empty?
//             var url =  blobService.getUrl(sContainer, sName)
//             log (url);
//         } if (error) {
//             log("ERROR: " + error);
//         }
//     });

// };


// };