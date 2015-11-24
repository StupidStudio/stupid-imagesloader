# Stupid Images Loader
A simple image collection loader

```javascript

var Imagesloader = require('stupid-imagesloader');
var imagesloader = Imagesloader();

imagesloader
.load(['image1.jpg','image2.jpg','image3.jpg','image4.jpg','image5.jpg'])
.success(function(images){
	console.log('images loaded', images);
})
.error(function(msg){
	console.log(msg);
})
.notify(function(msg){
	console.log(msg); // Notifies everytime one image is loaded
});

```