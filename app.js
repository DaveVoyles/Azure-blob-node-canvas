var express      = require('express');
var app          = express();
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var index        = require('./routes/index');
var users        = require('./routes/users');
var fs           = require('fs');
var Readable     = require('stream').Readable;
var Writeable    = require('stream').Writeable;
var log          = console.log.bind(console);   
                   require('dotenv').config(); // account vars

// Socket.io requirements
var port = 8080;
var io   = require('socket.io').listen(port);
log("NODE: Server running on 127.0.0.1:" + port);


// --------------------------------------------------------
// App configuration

app.set('port', process.env.PORT || 8080);

// view engine setup - HTML works fine out of the box
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/'     , index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
      err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/**
 * @returns mm-dd-yy
 * @example: new Date().timeNow() */
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
};

/**
 * @returns hh-mm
 * @example: new Date().timeNow() */
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
};


/** 
 * @param   {string} filename - Name of file to have date pre-pended
 * @returns {string} new file name with date pre-pended
 */
function prependDateToFile(fileName){
    let newFileName = '';
    let today       = new Date().today  ();
    let now         = new Date().timeNow();
    let extension   = filenNme.split('.').pop();
    var output      = fileName.substr(0, fileName.lastIndexOf('.')) || fileName;
    newFileName     = today + now + output + extension;

    return newFileName;
};


// -----------------------------------------------------
// SOCKET.IO EVENT

io.on('connection', function (socket) { // <--- use SetupEvents here
    log('Socket.io connection etablished');
    socketEvents(socket);
}); 


/**
 * All events which socket.io server should be listening for
 * @param {object} socket - Current socket.io instance 
 */
function socketEvents(socket) {
    // ENTRY POINT -> Kick off main event to get blobs, send to client
    getBlobsFromAzure(socket);

        socket.on('error', function(e) {
            throw new error;
        });

        socket.on('disconnect', function(err) {
            log('Client disconnected: ' + err);
        });

        socket.on('createBlockBlob', (payload) => {
            log("Creating block blob");
            createBlockBlob(payload);// <-- Pass the socket in here
        });

        // Receives file from web app & copies locally
        var dir             = '';
        var sNormalizedPath =__dirname + path.normalize('/public/images/');  


        // -- B64 STRING
        socket.on('sendB64ToServer', function(b64String) {
            log('b64String received from client');
            const buffer   = new Buffer(b64String, 'base64')
            const readable = new Readable()
                readable._read = function () {} // _read is required but you can noop it
                readable.push(buffer);
                readable.pipe(
                        blobService.createWriteStreamToBlockBlob("dumpster","myNewImage.png", 
                            function (err, result, res) {
                                if (err) { log.error(err); } 
                                else {
                                    log(result);
                                    log(res);
                                }
                            })
                            .on("data", function (chunk) {
                                log("get data : " + chunk);
                            })
                )
        });


        // -- FILE
        /**
         * Receives file from client & converts to a readable stream. Then, pipes the stream to 
         * Blob Storage.
         */
        socket.on('sendFileToServer',  function (buf){
            log('File buffer received from client');
            // getBlobsFromAzure(socket);

            const readable = new Readable()
                readable.push(buf)
                readable.push(null);
                readable.pipe(blobService.createWriteStreamToBlockBlob("dumpster", "canvasImage.png"));
        });


        // -- BYTE ARRAY
        socket.on('sendByteArrToServer', function (buf){
            log('Buffer array received from client');

            var newfile  = writeFileLocally(sName, buf);
            var myName   = sName;

            fs.readFile(__dirname + '/public/images/' + sName, function(err,data){
                imgBuffData = data;
                dir         = sNormalizedPath + sName;
                if (err) {throw err;}
            });
        });

};



// -----------------------------------------------------
// Blob Storage vars

// Defined in .env file, using dotenv
var azure              = require('azure-storage')                   ;
var storageAccountName = process.env.AZURE_STORAGE_ACCOUNT          ;
var connString         = process.env.AZURE_STORAGE_CONNECTION_STRING;
var accessKey          = process.env.AZURE_STORAGE_ACCESS_KEY       ;
var blobService        = azure.createBlobService()                  ;

// Temp vars
var sContainer = "dumpster";

 module.exports = app; 


// OPTIONS:
// 1. Closure to capture the scope of the socket instance
// 2. Dependency injection w/ the socket

// -----------------------------------------------------
// STORAGE

/** Writes a file to the /public/images folder
 * @param {string} sImgName - Name of file to be saved. Needs to end in .png | .jpg
 * @param {array}  buf      - Byte array buffer w/ image data   */
function writeFileLocally(sImgName, buf){
        fs.writeFile(__dirname + '/public/images/' + sImgName, buf,  function(err){
        if (err) {throw err;}
    })
};


/**
 * Grabs blobs with the prefix of today's date, then sends the array of images to client for processing.
 * NOTE: Only works if there are files in blob prefixed with today's date in format: dd-mm-yy
 * EXAMPLE: 19-8-17-cat.jpg
 * @param {object} socket - socket.io connection 
 */
function getBlobsFromAzure(socket){
    // Images returned from blob are stored in array, sent to client 
    var aImgs           = [];
    var sNormalizedPath =__dirname + path.normalize('/public/images/'); 
    blobService.listBlobsSegmentedWithPrefix(sContainer, new Date().today(), null, {delimiter: "", maxResults : 5},
        function(err, result) {
        if (err) {
            log("Couldn't list blobs for container %s", sContainer);
            log.error(err);
        } else {
            log('Successfully listed blobs for container %s', sContainer);
            // Loop through each entry in the blob and save it locally to server under "images" folder
            result.entries.forEach(function(element) {   
                // Store element in images folder and copy the name of the file from the blob storage       
                var loc = sNormalizedPath + element.name;
                aImgs.push(element);              
                blobService.getBlobToLocalFile(sContainer, element.name, loc, null,
                    function(result, err){}) 
            }, this);
            // Send array of images to client for processing             
            socket.emit('sendImgArrToClient', aImgs);   
        }
    });
};


/** Returns a list containing a collection of blob items in the container.*/
function listBlobsInContainer() {
    blobService.listBlobsSegmented(sContainer, null, function(err, result) {
         if (err) {
            log("Couldn't list containers");
            log.error(err);
        } else {
            log('Successfully listed containers');
            log(result.entries);
            log(result.continuationToken);
        }
    });
};


/** Downloads a blob into a file. */
function getBlobToLocalFile () {
    blobService.getBlobToLocalFile(sContainer, sBlob,sNewName, function(error, result, response) {
        if (!error) {
            log("blob retrieved. NAME: " + result.name);
        }
    });    
};


function createBlobFromStream(sName, stream) {
    blobService.createBlockBlobFromStream(sContainer, "myName.png", stream, stream.length, function(error) {
        if (error){ log.error(error); }
    });
};

/**
 *  Creates a blockblob from local file
 * @param {string} sName - What is the file's name?
 * @param {string} dir   - Where should the file be retrieved from?
 */
function createBlockBlob(sName, dir) {
    //File exists - check here to be sure 
    fs.readFile(__dirname + '/public/images/' + sName, function(err, data) {
        log('sName: '+ sName);
        log('dir:   '+ dir  );
        log('data:  '+ data );
    });

    // BUG: This does not work. No idea why. Submitted report on GitHub
    blobService.createBlockBlobFromLocalFile(sContainer, sName, dir, function(error, result, response) {
        if (!error) {
            // log(result  );
            // log(response);
            // log("UPLOADING: " + result.name + " \n from: " + dir);
            // URL containing the image works, but file is empty?
            var url =  blobService.getUrl(sContainer, sName)
            log (url);
        } if (error) {
            log("ERROR: " + error);
        }
    });

};