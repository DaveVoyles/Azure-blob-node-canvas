var express      = require('express');
var app          = express();
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var index        = require('./routes/index');
var users        = require('./routes/users');
                   require('dotenv').config(); // account vars

// Socket.io requirements
var http     = require('http');
var server   = http.createServer(app);
var socketIo = require('socket.io');
var io       = socketIo.listen(server);
    server.listen(8080); 
var log      = console.log.bind(console);   
    log("NODE: Server running on 127.0.0.1:8080");


// view engine setup - HTML works fine out of the box
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
  log('Socket connection etablished');

  socket.on('error', function(e) {
    log("Client connected: " + e);
  });

  socket.on('disconnect', function(e) {
    log('Client disconnected: ' + e);
  });

  socket.on('divimg', (payload) => {
    log("socket.broadcast.emit('divimg', payload);");
    socket.broadcast.emit('divimg', payload);
  });

}); 


//-----------------------------------------------------------
// Azure blob storage

// Defined in .env file, using dotenv
var azure              = require('azure-storage');
var storageAccountName = process.env.AZURE_STORAGE_ACCOUNT;
var connString         = process.env.AZURE_STORAGE_CONNECTION_STRING;
var accessKey          = process.env.AZURE_STORAGE_ACCESS_KEY;
var blobService        = azure.createBlobService();
var sContainer         = "dumpster";

function listBlobs () {
    blobService.listBlobsSegmented("dumpster", null, function(err, result) {
         if (err) {
            console.log("Couldn't list containers");
            console.error(err);
        } else {
            console.log('Successfully listed containers');
            console.log(result.entries);
            console.log(result.continuationToken);
        }
    });
}
listBlobs();

module.exports = app;
