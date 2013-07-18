// Kt-Ao_SaveTheDateMain.js - Save the Date demo entry point
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -SegmentManager.js
//  -SegmentLargeScroller.js

// Main canvas onto which the output will be produced, and
// its respective two-dimensional context.
var mainCanvas = null;
var mainCanvasContext = null;

// Default canvas width and height (4:3 aspect ratio).
var defaultCanvasWidth = 720;
var defaultCanvasHeight = 540;

// Resource identifier constants
var resIdentifiers = {
	
	img:{
		imgCylburnZoom00: 0,
		imgCylburnZoom03: 1,
		imgCylburnZoom05: 2,
		imgCylburnZoom07: 3,
		imgCylburnZoom09: 4,
		imgCylburnZoom11: 5,
		imgCylburnZoom13: 6,
		imgCylburnZoom15: 7,
		imgRotoZoomSource: 8,
		imgKatieAndAyo: 9
	}
}

// List of images used in demo - these images will be
// loaded upon initialization
var imageSourceList = [
	{
		source: "images/cylburn-zoom-00.jpg",
		resId: resIdentifiers.img.imgCylburnZoom00
	},
	{	
		source: "images/cylburn-zoom-03.jpg",
		resId: resIdentifiers.img.imgCylburnZoom03
	},
	{	
		source: "images/cylburn-zoom-05.jpg",
		resId: resIdentifiers.img.imgCylburnZoom05
	},
	{	
		source: "images/cylburn-zoom-07.jpg",
		resId: resIdentifiers.img.imgCylburnZoom07
	},	
	{	
		source: "images/cylburn-zoom-09.jpg",
		resId: resIdentifiers.img.imgCylburnZoom09
	},	
	{	
		source: "images/cylburn-zoom-11.jpg",
		resId: resIdentifiers.img.imgCylburnZoom11
	},
	{	
		source: "images/cylburn-zoom-13.jpg",
		resId: resIdentifiers.img.imgCylburnZoom13
	},
	{	
		source: "images/cylburn-zoom-15.jpg",
		resId: resIdentifiers.img.imgCylburnZoom15
	},
	{	
		source: "images/cylburn-zoom-00.jpg",
		resId: resIdentifiers.img.imgRotoZoomSource
	},
	{
		source: "images/Katie_and_Ayo.jpg",
		resId: resIdentifiers.img.imgKatieAndAyo
	}
];

// Will contain the list of images used within the demo,
// along with their assigned identifiers
var mainImageList = [];

// Surrogate image - if the host browser does not support the HTML 5 canvas
// element, this image will be shown instead.
var surrogateImageSrcStr = "images/SaveTheDate_eCard_(Viewing Resolution).jpg";

function imageLoader() {
}

imageLoader.prototype.loadImageResources = function(progressFunction, completionFunction,
	completionFunctionParam)
{
	// Assign the progress notification function, the completion
	// function, and store the length of the image list.
	this.progressFunction = progressFunction;
	this.completionFunction = completionFunction;
	this.completionFunctionParam = completionFunctionParam;
	this.totalImages = imageSourceList.length;
	
	// Will be referenced from with the locally-defined image
	// load handler.
	imageLoaderObj = this;
	
	/**
	 * Locally-defined image load handler - uses closure in order
	 *  to reference an instance of the image loader object, permitting
	 *  contained members to be used within the callback.
	 */
	onLoadHandler = function() {
		imageLoaderObj.onImgLoadHandler();
	}
	
	// Iterate through the image source list, attempting to
	// create image resources using the specified image sources.
	var imageLoop = 0;
	for (imageLoop = 0; imageLoop < imageSourceList.length;
		imageLoop++) {
		
		// Create the image object (the load completion handler
		// will invoke the appropriate image loading progress
		// management routines)...
		var currentImage = new Image();
		currentImage.onload = onLoadHandler;
		currentImage.src = imageSourceList[imageLoop].source;
			
		// Add the image to the image resource array.
		var newImageResData = {
			imageObj: currentImage,
			resId: imageSourceList[imageLoop].resId
		}
		
		mainImageList.push(newImageResData);
	}
}

/**
 * Default image loading completion handler
 */
imageLoader.prototype.onImgLoadHandler = function() {

	// An image has been loaded - advance the loaded image count.
	this.numImagesLoaded++;

	if (this.progressFunction !== null) {
		// Execute the progress advancement notification function.
		this.progressFunction(this.numImagesLoaded / this.totalImages);
	}

	// All image loading has been completed - execute the completion
	// routine if the routine has been provided.
	if ((this.numImagesLoaded >= this.totalImages) &&
		(this.completionFunction !== null) &&
		(this.completionFunctionParam !== null)) {
			this.completionFunction(this.completionFunctionParam);
	}
}

/**
 * Total number of images to be loaded
 */
imageLoader.prototype.totalImages = 0;

/**
 * Current number of images that have been loaded
 */
imageLoader.prototype.numImagesLoaded = 0;

/**
 * Image loading progress function placeholder
 */
imageLoader.prototype.progressFunction = null;

/**
 * Image loading completion function placeholder
 */
imageLoader.prototype.completionFunction = null;

/**
 * Image loading completion function parameter placeholder
 */
imageLoader.prototype.completionFunctionParam = null;

function DrawProgressBar(targetContext, barWidth, barHeight, progressFraction) {
	if (validateVar(targetContext) && validateVar(barWidth) &&
		validateVar(barHeight) && validateVar(progressFraction)) {
		
		clearContext(targetContext, "rgba(0, 0, 0, 255)");
		
		var borderWidth = 3;
		var innerMargin = 2;
		
		// The progress bar must be able to accommodate the border width and the width
		// of the inner margin along either axis.
		minBarSizeOnAxis = (borderWidth + innerMargin * 2);
		
		if ((barWidth > minBarSizeOnAxis) && (barHeight > minBarSizeOnAxis)) {
			// Draw progress bar border...
			var startX = (targetContext.canvas.width - barWidth) / 2;
			var startY = (targetContext.canvas.height - barHeight) / 2;
		
			targetContext.fillStyle = "rgba(255, 255, 255, 255)"
			targetContext.fillRect(startX, startY, barWidth,
				barHeight);
			
			// Draw progress bar inner margin (overwriting interior of border).
			var innerMarginX = startX + borderWidth;
			var innerMarginY = startY + borderWidth;
			targetContext.fillStyle = "rgba(0, 0, 0, 255)"
			targetContext.fillRect(innerMarginX, innerMarginY,
				(barWidth - 2 * borderWidth),
				(barHeight - 2 * borderWidth));
			
			// Draw progress bar (overwriting interior or inner margin).
			var innerBarX = innerMarginX + innerMargin;
			var innerBarY = innerMarginY + innerMargin;
			
			var progressLength = ((barWidth - (2 * (borderWidth + innerMargin))) *
				progressFraction);
			targetContext.fillStyle = "rgba(255, 255, 255, 255)"			;
			targetContext.fillRect(innerBarX, innerBarY, progressLength,
				(barHeight - 2 * (borderWidth + innerMargin)));
				
            var loadingStr = new String;
            loadingStr = getStringFromDomId("string_loading");				
			
			var fontHeight = barHeight / 2;
			var loadingTextMargin = 3;
			
			targetContext.font = "italic " + fontHeight + "px sans-serif";
			targetContext.textBaseline = "bottom";
			targetContext.fillText(loadingStr, startX, (startY - loadingTextMargin));

		}
	}
}

function imageLoadProgressFunction(completionFract) {

	if (validateVar(mainCanvas) && validateVar(mainCanvasContext)) {	
		var progressBarWidth = mainCanvas.width / 2;
		var progressBarHeight = mainCanvas.height / 20;
	
		// Draw the progress bar.
		DrawProgressBar(mainCanvasContext, progressBarWidth,
			progressBarHeight, completionFract);
	}
}

/**
 * Initializes any required DOM resources
 *  (creates objects, etc.)
 * @param completionFunction Function to be invoked after the
 *                           DOM resource initialization has
 *                           been completed.
 * @param functionParam Completion function parameter
 */
function initDomResources(completionFunction, functionParam) {
	// Create the main canvas on which output
	// will be displayed..
	mainDiv = document.createElement("div");
	
	// Center the div within the window (the height centering will
	// not be retained if the window size has been altered).
	mainDiv.setAttribute("style", "text-align:center; margin-top: " +
		Math.round((window.innerHeight - defaultCanvasHeight) / 2) + "px");
	
	// Add the DIV to the DOM.
	document.body.appendChild(mainDiv);		
	mainCanvas = document.createElement("canvas");

	var bCanvasSupported = false;
    if (validateVar(mainCanvas) && typeof mainCanvas.getContext === 'function') {
		mainCanvas.width = defaultCanvasWidth;
		mainCanvas.height = defaultCanvasHeight;
	
        // Store the two-dimensional context that is
        // required to write data to the canvas.
        mainCanvasContext = mainCanvas.getContext('2d');
    
		if (validateVar(mainCanvasContext)) {
			// Add the canvas object to the DOM (within the DIV).
			mainDiv.appendChild(mainCanvas);

			// Load images that will be used within the demo.
			initImageLoader = new imageLoader();		
			initImageLoader.loadImageResources (imageLoadProgressFunction,
				completionFunction, functionParam);
		}
    }
	else {
		// HTML 5 canvas object is not supported (e.g. Internet Explorer 8 and earlier).
		// Simply display the "Save the Date" eCard.
		var surrogateImageSaveTheDate = new Image();
		if (validateVar(surrogateImageSaveTheDate)) {
			surrogateImageSaveTheDate.src = surrogateImageSrcStr;
			mainDiv.appendChild(surrogateImageSaveTheDate);
		}
	}
}

/**
 * Main routine - function that is
 *  executed when page loading has
 *  completed
 */
function onLoadHandler() {

    // Demo segments - listed in order of execution, and paired
    // with their assigned execution durations.
	var saveTheDateSegments = [
		{
			segment: new segmentFadeOut(),
			maxDuration: 3000,
			startDuration: 0
		},	
		{
			segment: new segmentLargeScroller(),
			maxDuration: 10000,
            startDuration: 0
		},
        {
            segment: new segmentMoire(),
            maxDuration: 7000,
            startDuration: 0
        },
		{
			segment: new segmentLocationZoomer(),
			maxDuration: 10000,
			startDuration: 0		
		},
		{
			segment: new segmentRotoPhotoZoomer(),
			maxDuration: 15000,
			startDuration: 0
		},		
		{
			segment: new segmentFinal(),
			maxDuration: 6000,
			startDuration: 0
		},
		{
			segment: new segmentFadeOut(),
			maxDuration: 7000,
			startDuration: 0
		},			
    ]
	
    // Initialize any DOM objects that will be required
    // by the demo, and commence the demo execution upon completion...
    initDomResources(segmentManager, saveTheDateSegments);
}