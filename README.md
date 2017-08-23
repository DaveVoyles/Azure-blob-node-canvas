### Author(s): Dave Voyles | [@DaveVoyles](http://www.twitter.com/DaveVoyles)
### URL: [www.DaveVoyles.com][1]

Express application with socket.io for sending image byte data between Azure Blob Storage <-> Node Server <-> HTML client. 
----------
### About

The end goal is to retrieve images from blob storage, merge them into a single vertical strip image and upload to blob storage. 

The HTML Canvas API is required for this to work, as JavaScript does not have a built-in *Image* type, and I have never been able to get *Cairo* working in Node to support Canvas functionality on the back-end. 

## Instructions

### Installation

```
npm install
nodemon app
```

This will install all NPM depdencies and also begin running the application locally. Any changes you make to the .js files will be applied to the app in real time. 


### Configuring .env settings for Azure Blob Storage

You'll also need to set your connection strings in the .env file. All of these can be found in your Azure Blob Storage account info:

```
AZURE_STORAGE_ACCOUNT 
AZURE_STORAGE_ACCESS_KEY
AZURE_STORAGE_CONNECTION_STRING
CONTAINER_NAME
```


## Running the app
Once the node application is running, navigate to *http://localhost:8080* in the browser to create a connection between the client (browser) and node server.

When a socket connection is established with the client, the socket.io event *getBlobsFromAzure* will fire off. 

**Description**

```
/**
 * Grabs blobs with the prefix of today's date, then sends the array of images * to client for processing.
 * NOTE: Only works if there are files in blob prefixed with today's date in    * format: dd-mm-yy
 * EXAMPLE: 19-8-17-cat.jpg
 * @param {object} socket - socket.io connection 
 */
 ```


 **NOTE** 

 If you do not have any files with the date prefixed, the blob storage function will not return any images. Example: *9-8-17-*

 It occurs in this function:

 ```javascript
 blobService.listBlobsSegmentedWithPrefix(sContainer, new Date().today(), null, {delimiter: "", maxResults : 5},
 ```

 where I am returning items with today's date from the container defined in the .env file. It is also limiting the number of results to 5. 


## Merging the images
The Canvas API is used to automatically stack the images below one-another (no overlap!) then export the canvas as a .png file.

If you know of a way to do this **WITHOUT** relying on the canvas, I'd love to know.


## Shortcomings
This will not merge images unless you navigate to the webpage, as the canvas API is required. If you simply do a *get* request in a tool such as **Postman** it will return a page, but it lacks the canvas API, so no image will return. 


## Questions?
The code is well documented, but feel free to ping me on Twitter ([@DaveVoyles](http://www.twitter.com/DaveVoyles)) and I'd be glad to answer any questions. 