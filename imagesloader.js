var Deferred = require('stupid-deferred')
var Imageloader = require('stupid-imageloader');

/**
 * Image collection loader
 * @constructor
 */
function Imagesloader(opts){
	/**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} Options for the constructor 
     */
    var opts = opts || {};

    /**
	 * @define {object} A image loader object
	 */
	var imageloader = Imageloader();

    /**
     * @define {array} A holder for when an image is loaded
     */
	var imgs = [];

	/**
	 * @define {array} A holder for the image src that should be loaded
	 */
	var srcs = [];

	/**
	 * @define {object} A promise container for promises
	 */
	var def;

	/**
	 * Load a collection of images
	 * @example imageloader.load(['img1.jpg', 'img2.jpg', 'img3.jpg']).success(function(){ // Do something });
	 * @param {array} images A collection of img object or img.src (paths)
	 * @config {object} def Create a promise object
	 * @return {object} Return the promise object
	 */
	function load(images){
		def = Deferred();
		
		/**
		 * Check if the images is img objects or image src
		 * return string of src
		 */
		srcs = convertImagesToSrc(images);

		/**
		 * Loop through src's and load image
		 */
		for (var i = 0; i < srcs.length; i++) {
			imageloader.load(srcs[i])
			.success(function(img){

				/** call imageloaded a pass the img that is loaded */
				imageLoaded(img);
			})
			.error(function(msg){
				def.reject(msg + ' couldn\'t be loaded');
			});
		};
		return def.promise;
	}

	/**
	 * Image loaded checker
	 * @param {img} img The loaded image
	 */
	function imageLoaded(img){

		/** Notify the promise */
		def.notify("notify");

		/** Add the image to the imgs array */
		imgs.push(img);

		/** If the imgs array size is the same as the src's */
		if(imgs.length == srcs.length){

			/** First sort images, to have the same order as src's */
			sortImages();

			/** Resolve the promise with the images */
			def.resolve(imgs);
		}
	}

	/**
	 * Convert img to src
	 * @param {array} imgs A collection og img/img paths
	 * @config {array} src A temporally array for storing img path/src
	 * @return {array} Return an array of img src's
	 */
	function convertImagesToSrc(imgs){
		var src = [];
		for (var i = 0; i < imgs.length; i++) {

			/** If the img is an object (img) get the src  */
			if(typeof imgs[i]  == 'object'){
				src.push(imgs[i].src);
			}
		};

		/** If the src array is null return the original imgs array */
		return src.length ? src : imgs;
	}

	/**
	 * Sort images after the originally order
	 * @config {array} arr A temporally array for sorting images
	 */
	function sortImages(){
		var arr = [];
		/**
		 * Create a double loop
		 * And match the order of the srcs array
		 */
		for (var i = 0; i < srcs.length; i++) {
			for (var j = 0; j < imgs.length; j++) {
				var str = imgs[j].src.toString();
				var reg = new RegExp(srcs[i])
				/** If srcs matches the imgs add it the the new array */
				if(str.match(reg)) arr.push(imgs[j]);
			};
		};

		/** Override imgs array with the new sorted arr */
		imgs = arr;
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.load = load;

	/**
	 * @return {object} Public methods
	 */
	return self;
}

/** @export */
module.exports = Imagesloader;