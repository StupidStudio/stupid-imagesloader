(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"stupid-deferred":2,"stupid-imageloader":4}],2:[function(require,module,exports){
/**
 * @fileoverview Simple deferred lib.
 * @author david@stupid-studio.com (David Adalberth Andersen)
 */

/** Import the Event system */
var Event = require('stupid-event');

/**
 * Deferred
 * @constructor
 */
function Deferred(opts){
 	/**
	 * @define {object} Collection of public methods.
	 */
	var self = {};

	/**
	 * @define {object} options for the constructor 
	 */
	var opts = opts || {};

	/**
	 * @define {object} A promise object that will be returned
	 */
	var promise = {};

	/**
	 * @define {object} Event system for controlling events
	 */
	var event = Event();
	
	/**
	 * Promise then method
	 * This is for chaining promis callbacks
	 * @example promiseFunction().then(
	 * function(){ // success }, 
	 * function(){ // rejected }, 
	 * function(){ // notify } 
	 * ).then( ... );
	 * @param {function} sucess Success callback
	 * @param {function} reject Reject callback
	 * @param {function} notify notify callback
	 * @return {object} Returns the promise object
	 */
	function promiseThen(success, reject, notify){
		/**
		 * @define {object} Return a new promise
		 */
		var def = Deferred();

		/**
		 * Resolved promise
		 * @example example
		 * @param {string} A string key for the event system
		 * @param {function} A callback when event is triggered
		 * @return {object} Returns promise object
		 */
		event.on('resolve', function(){ 
			/**
			 * If the success callback returns a promise
			 * then resolve/reject/notify that returned promise
			 */
			var promise = success();
			if(!promise) return;
			promise.success(function(){
				/** handle the returned deferred object */
				def.resolve();
			});
			promise.error(function(){
				def.reject();
			});
			promise.notify(function(){
				def.notify();
			});
		});

		/**
		 * If promise is rejected/notify trigger the callback
		 */
		event.on('reject', function(){ 
			if(reject) reject();
		});

		event.on('notify', function(){ 
			if(notify) notify();
		});

		/**
		 * @return {object} Returns a promise object
		 */
		return def.promise; 
	}

	/**
	 * Promise methods
	 * @example promise.then( //new promise ).then(...)
	 * @example promise.success(...).error(...).notify(...)
	 * @param {function} callback A callback for the promise
	 * @return {object} Return the promise
	 */
	function promiseSuccess(callback){
		event.on('resolve', callback);
		return promise;
	}

	function promiseError(callback){
		event.on('reject', callback);
		return promise;
	}

	function promiseNotified(callback){
		event.on('notify', callback);
		return promise;
	}

	/**
	 * Deferred methods to trigger the promise
	 * @example def.resolve(args)
	 * @example def.reject(args)
	 * @example def.notify(args)
	 */
	function resolve(){
		var args = Array.prototype.slice.call(arguments);
		event.trigger('resolve', args);
	}

	function reject(){
		var args = Array.prototype.slice.call(arguments);
		event.trigger('reject', args);	
	}

	function notify(){
		var args = Array.prototype.slice.call(arguments);
		event.trigger('notify', args);		
	}

	/**
	 * Add the promise methods to the promise object
	 */
	promise.then = promiseThen;
	promise.success = promiseSuccess;
	promise.error = promiseError;
	promise.notify = promiseNotified;

	/**
	 * The promise object
	 * @public {object}
	 */
	self.promise = promise;

	/**
	 * Deferred public methods	
	 * @public {function}
	 */
	self.resolve = resolve;
	self.reject = reject;
	self.notify = notify;

	/**
	 * @return {object} return public methos
	 */
	return self;
}

/** @export */
module.exports = Deferred;
},{"stupid-event":3}],3:[function(require,module,exports){
/**
 * @fileoverview Simple event system.
 * @author david@stupid-studio.com (David Adalberth Andersen)
 */

/**
 * Event
 * @constructor
 */
function Event(opts){
	/**
	 * @define {object} Collection of public methods.
	 */
	var self = {};

	/**
	 * @define {object} options for the constructor 
	 */
	var opts = opts || {};

	/**
	 * @define {object} collection the event names as
	 * an identifyer for later calls
	 */
	var event = {};

	/**
	 * @define {object} collection of precalled events
	 */
	var queue = {};

	/**
	 * On method for collection the event calls
	 * @example event.on('custom-event', function(){ //do something });
	 * @param {string} key A string identifyer
	 * @param {function} call A callback for the identifyer
	 * @config {object} event[key] Set object[key] to array if not set
	 */
	function on(key, call){
		if(!event[key]) event[key] = [];

		/** add event */
		addEvent(key, call);
		
		/** if the event has been triggered before created, then trigger it now */
		if(queue[key]) call.apply(null, queue[key]);
	}

	/**
	 * Add event to events and override if it is the same
	 * @param {string} key A string identifyer
	 * @param {function} call A callback for the identifyer
	 */
	function addEvent(key, call){
		/**
		 * @define {boolean} if the function is the same,
		 * boolean will be set to true
		 */
		var same = false;
		/**
		 * Loop through the events on key
		 * This is for comparing two anonymous
		 */
		for (var i = 0; i < event[key].length; i++) {
			/** If anonymous function is the same set boolean to true */
			if(call.toString() === event[key][i].toString()){
				same = true;
				/** override the current callback */
				event[key][i] = call;
				break;
			}
		};
		/** If the functions isnt the same, push to call stack */
		if(!same) event[key].push(call);
	}

	/**
	 * Trigger the event
	 * @example event.trigger(key, params)
	 * @param {string} key The key for event objet
	 */
	function trigger(key){
		var events = event[key];
		/**
		 * @define {array} takes the arguments and removes the first param
		 */
		var args = Array.prototype.slice.call(arguments).slice(1);

		/** If first argument is an array, pass it as argument */
		if(arguments.length === 2 && arguments[1].constructor == Array) args = arguments[1];
		
		if(events){
			/** Trigger the events by the current key */
			for (var i = 0; i < events.length; i++) {
				events[i].apply(null, args);
			};
		}else{
			/**
			 * If the trigger method is call before any key is added
			 * save the key and params for to be called later
			 */
			queue[key] = args;
		}
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.on = on;
	self.trigger = trigger;

	/**
	 * @return {object} return public methods
	 */
	return self;
}

/** @export */
module.exports = Event;
},{}],4:[function(require,module,exports){
var Deferred = require('stupid-deferred');

/**
 * Image loader
 * @constructor
 */
function Imageloader(opts){
	/**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} Options for the constructor 
     */
    var opts = opts || {};

    /**
     * @define {object} Cache for loaded images
     */
	var cache = {};

	/**
	 * Loading image
	 * @example imageload.load(src).success( // Do Something ).error( //Do something );
	 * @param {string} src Source of the image that should be loaded
	 * @config {object} def Deferred object to handle callbacks
	 * @return {object} Returns a promise
	 */
	function load(src){
		var def = Deferred();

		/**
		 * If image if cache returns the loaded image.
		 */
		if(cache[src]){
			/** resolve promise with cache image */
			def.resolve(cache[src], 'cached image');
		}else{
			/**
			 * Create new image
			 * Setup listeners for the image,
			 * and then set source.
			 */
			var img = new Image();
		    img.onload = function() {
		    	/** Cache image */
		        cache[src] = img;
		        /** Resolve promise */
		        def.resolve(img);
		    }
		    img.onerror = function(){
		    	def.reject('ERROR: ' + src);
		    }
		    img.src = src;
		}
		/**
		 * @return {object} Return promise
		 */
	    return def.promise;
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.load = load;

	/**
	 * @return {object} Public object
	 */
	return self; 
}

/** @export */
module.exports = Imageloader; 
},{"stupid-deferred":2}],5:[function(require,module,exports){
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


},{"../../imagesloader":1}]},{},[5]);
