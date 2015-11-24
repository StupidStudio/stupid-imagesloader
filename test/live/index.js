var Imagesloader = require('../../imagesloader');
var imagesloader = Imagesloader();

var img1 = "http://www.google.com/logos/doodles/2015/teachers-day-2015-turkey-4703287659986944.2-hp2x.gif";
var img2 = "http://www.google.com/logos/doodles/2015/argentina-elections-2015-second-round-5641816198086656-hp2x.png";
var img3 = "http://www.google.com/logos/doodles/2015/fathers-day-2015-se-is-no-fi-ee-4876427472142336-hp2x.gif";
var img4 = "http://www.google.com/logos/doodles/2015/childrens-day-2015-south-africa-4835971950444544.2-hp2x.jpg";
var img5 = "http://www.google.com/logos/doodles/2015/german-reunification-day-2015-5400661768273920-hp2x.jpg";

// - - - - - - - - - - - - - - - - - - - - - - - - - - 

imagesloader
.load([img1,img2,img3,img4,img5])
.success(function(images){
	console.log(images);
	for (var i = 0; i < images.length; i++) {
		console.log(images[i].src);
	};
})
.error(function(msg){
	console.log(msg);
})
.notify(function(msg){
	console.log(msg);
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - 

imagesloader
.load([img1,img2,img3,img4,'fakeimage.jpg'])
.success(function(images){
	console.log(images);
})
.error(function(msg){
	console.error(msg);
})
.notify(function(msg){
	console.log(msg);
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - 

