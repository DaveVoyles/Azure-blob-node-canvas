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
var stream       = require('stream');

var log          = console.log.bind(console);   
                   require('dotenv').config(); // account vars

// Socket.io requirements
var port  = 8080;
var io    = require('socket.io').listen(8080);
log("NODE: Server running on 127.0.0.1:" + port);


// --------------------------------------------------------
// App configuration

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


//-------------------------------------------------------------
// Socket.io connections
io.on('connection', function (socket) {
  log('Socket.io connection etablished');

  socket.on('error', function(e) {
    log("Client connected: " + e);
  });

  socket.on('disconnect', function(e) {
    log('Client disconnected: ' + e);
  });

  socket.on('createBlockBlob', (payload) => {
    log("Creating block blob");
    createBlockBlob(payload);
  });

  // Receives file from web app & copies locally
  var imgBuffData     = {};
  var myName          = "";
  var dir             = '';
  var sNormalizedPath =__dirname + path.normalize('/public/images/');  
  var sName = "myImage.png";

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
                    if (err) {
                        console.error(err);
                    } else {
                    console.log(result);
                    console.log(res);
                }
                })
                .on("data", function (chunk){
                    console.log("get data : " + chunk);
                })
            )
    });


    // -- FILE
    socket.on('sendFileToServer',  function (buf){
        log('File received from client');

        sName = "myImage.png";
        const readable = new Readable()
        readable._read = function () {} // _read is required but you can noop it
        readable.push(buf)
        readable.push(null);
        readable.pipe(blobService.createWriteStreamToBlockBlob("dumpster", "myImage.png"));

        // blobService.createWriteStreamToBlockBlob("dumpster", "myImage.png");
        // blobService.createBlockBlobFromStream("dumpster", "myImage.png", readable, buf.length, null);

        // Save locally
        // writeFileLocally(sName, buf);
        // var myName   = sName;
        // var dir      = sNormalizedPath + sName;
     
        // // Read back
        //  fs.readFile(__dirname + '/public/images/' + sName, function(err,data){
        //      imgBuffData = data;         
        //      //    log(myName);
        //      //    log(imgBuffData);
        //      if (err) {throw err;}
        //  });
            //   createBlockBlob(myName, dir);
    });


    // -- BYTE ARRAY
    socket.on('sendByteArrToServer', function (buf){
        log('Buffer array received from client');

    var newfile  = writeFileLocally(sName, buf);
    var myName   = sName;

    fs.readFile(__dirname + '/public/images/' + sName, function(err,data){
        imgBuffData = data;
        dir         = sNormalizedPath + sName;
        //    log(dir);          
        //    log(myName);
        //    log(imgBuffData);
        if (err) {throw err;}
    });
        // createBlockBlob(myName, dir);
        // createBlobFromStream(myName, buf, buf.length);
    });

}); 



// -----------------------------------------------------
// Blob Storage vars

// Defined in .env file, using dotenv
var azure              = require('azure-storage');
var storageAccountName = process.env.AZURE_STORAGE_ACCOUNT;
var connString         = process.env.AZURE_STORAGE_CONNECTION_STRING;
var accessKey          = process.env.AZURE_STORAGE_ACCESS_KEY;
var blobService        = azure.createBlobService();

// Temp vars
var sContainer = "dumpster";
var sBlob      = "cat.jpg";


module.exports = app;
// NOTE: Functions past here do not get called when app.js is loaded


// -----------------------------------------------------
// Storage

/** Writes a file to the /public/images folder
 * @param {string} sImgName - Name of file to be saved. Needs to end in .png | .jpg
 * @param {array}  buf      - Byte array buffer w/ image data   */
function writeFileLocally(sImgName, buf){
        fs.writeFile(__dirname + '/public/images/' + sImgName, buf,  function(err){
        if (err) {throw err;}
    })
};


/** Returns a result segment containing a collection of blob items in the container.*/
function listBlobs () {
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
            
            // blobService.createBlockBlobFromLocalFile(sContainer, sNewName, sNewName, function(error, result, response) {
            //     if (!error) {
            //             context.log("UpLOADING:: " + result.name);
            //         // Upload worked
            //     }
            // });node
        }
    });    
};

function createBlobFromStream(sName, stream){
    blobService.createBlockBlobFromStream(sContainer, "myName.png", stream, stream.length, function(error) {
        if (error){
            log(error);}
        }
    );
};


function createBlockBlob(sName, dir){
    log("sName: "+ sName);
    log('dir: '  + dir  );
    //File exists - check here to be sure 
    fs.readFile(__dirname + '/public/images/' + sName, function(err,data){
          log("data: " + data);
    });
    blobService.createBlockBlobFromLocalFile(sContainer, sName, dir, function(error, result, response) {
        if (!error) {
            // log(result);
            // log(response);
            // log("UPLOADING: " + result.name + " \n from: " + dir);
            // URL containing the image works, but file is empty?
            var url =  blobService.getUrl(sContainer, sName)
            log (url);
        } if (error) {
            log("ERROR:      " + error      );
        }
    });
};