// SegmentRotoPhotoZoomer.js - Rotating photo zoomer "Save the Date" animation segment
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Kt-Ao_SaveTheDateMain.js

function segmentRotoPhotoZoomer() {
}

/**
 * Initializes any data/resources required by the
 *  segment.
 */
segmentRotoPhotoZoomer.prototype.initialize = function() {
	
    // Create the offscreen canvas that will be used
    // for secondary drawing.
    this.offScreenCanvas = document.createElement("canvas");
	
	// Create a "scratch" canvas that will be used during the
	// initial transition between scenes.
	this.scratchCanvas = document.createElement("canvas");
	
	// Store a reference to the source image.
	this.sourceImage = getImageResource(resIdentifiers.img.imgKatieAndAyo);
	
	// Will point to the target image data.
	this.targetImageData = null;
    
    if (validateVar(this.offScreenCanvas)) {
        this.offScreenCanvas.width =  this.sourceImage.width;
        this.offScreenCanvas.height = this.sourceImage.height;		
    		
		// Retrieve the context from the offscreen canvas...
		this.offScreenContext = this.offScreenCanvas.getContext('2d');
		
		// Draw the source image into the context, and store the source
		// image data for later referencing.		
		if (this.offScreenContext !== null) {		
			this.offScreenContext.drawImage(this.sourceImage, 0, 0);
			this.sourceImageData = this.offScreenContext.getImageData(
				0, 0, this.offScreenContext.canvas.width,
				this.offScreenContext.canvas.height);
		}
		
		if (validateVar(this.scratchCanvas)) {
			this.scratchContext = this.scratchCanvas.getContext('2d');
		}
    }	
	
	// Source look-up Target area pixel block size along a
	// single axis (reduces total number of read operations
	// with higher values).
	this.pixBlockSize = 4;
	
	// Rotation rate multiplier constant
	this.rotationRateMultiplier = 1.0;
	
	// Rotation rate mantissa (exponent should be based on completion fraction)
	this.rotationMantissa = 100;
	
	// Maximum petrurbation amplitude (Y-axis)
	this.perturbationMaxY = 0.05;
	
	// Exponent used to determine perturbation change rate with respect
	// to time.
	this.perturbChangeRateExp = 2;
}

/**
 * Executes a single segment step, the appearance of which is
 *  directly related to the immediate segment completion fraction
 * @param targetContext The canvas context to which the segment data
 *                      will be written
 * @param completionFraction Segment completion fraction (will be
 *                           between 0.0 - 1.0, inclusive).
 */
segmentRotoPhotoZoomer.prototype.executeStep =
    function(targetContext, completionFraction) {
	
	if (validateVar(targetContext) && validateVar(completionFraction) &&
		validateVar(this.sourceImage) && validateVar(this.rotationRateMultiplier) &&
		validateVar(this.pixBlockSize)) {
		
		// Zoom transition start/end fractions
		var zoomTransitionStartFract = 0.0;
		var zoomTransitionEndFract = 0.25;
		
		// Fade [out] transition start/end fractions
		var fadeTransitionStartFract = 0.8;
		var fadeTransitionEndFract = 1.0;
		
		// Create and cache the image data buffer into which the rotated/scaled image
		// will be drawn.
		if ((this.targetImageData === null) ||
			(this.targetImageData.width !== targetContext.canvas.width) ||
			(this.targetImageData.height !== targetContext.canvas.height))
		{
			this.targetImageData = this.offScreenContext.createImageData(targetContext.canvas.width,
			targetContext.canvas.height);
		}

		// Pixel stride, in terms of color components...
		var componentsPerColor = 4;

		// Reverse the angle, since the rotation will be done through the use of a
		// reverse transformation.
		var angle = Math.pow(this.rotationMantissa, completionFraction * completionFraction) * (2 * Math.PI) *
			this.rotationRateMultiplier;
		var sourceAngle = -angle;			

		var cosTheta = Math.cos(sourceAngle);
		var sinTheta = Math.sin(sourceAngle);
		
		var zoomFactor = Math.sin(completionFraction * (2 * Math.PI));
		
		// Optimization - make a local copy of data that may exist in the
		// DOM (source image data).
		var targetDataLocal = this.targetImageData.data;
		var sourceDataLocal = this.sourceImageData.data;
		
		var currentScanLine = 0;
		for (currentScanLine = 0; currentScanLine < targetContext.canvas.height;
			currentScanLine += this.pixBlockSize ) {

			// Compute the offset within the target canvas.
			var targetBaseOffset = currentScanLine * targetContext.canvas.width * componentsPerColor;			

			var pixelStep = 1.0 / zoomFactor;
		
			var xPosLoop = 0;
			for (xPosLoop = 0; xPosLoop < targetContext.canvas.width;
				xPosLoop += this.pixBlockSize ) {
			
				// Compute the degree of perturbation along
				var perturbY = 1.0 + (this.perturbationMaxY * Math.pow(completionFraction, this.perturbChangeRateExp) *
					Math.cos(xPosLoop * pixelStep * 2 * Math.PI * 10));
			
				// Rotate the source points around the origin, using the
				// origin-based two-dimensional rotation formula:
				// x' = x � cos(a) - y � sin(a)
				// y' = y � cos(a) + x � sin(a)
				var sourceX = (xPosLoop * pixelStep * cosTheta) - (currentScanLine * pixelStep * perturbY * sinTheta);
				var sourceY = (currentScanLine * pixelStep * perturbY * cosTheta) + (xPosLoop * pixelStep * sinTheta);

				// Clamp the source coordinates to valid coordinates within the source image.
				var clampedSourceX = Math.floor(sourceX - Math.floor(sourceX / this.sourceImage.width) *
					this.sourceImage.width);
				var clampedSourceY = Math.floor(sourceY - Math.floor(sourceY / this.sourceImage.height) *
					this.sourceImage.height);
			
				// Compute the pixel offset within the source buffer (will be used to perform a direct
				// copy of the source pixel).
				var sourceBufferOffset = ((clampedSourceY * this.sourceImage.width) + clampedSourceX) *
					componentsPerColor;
			
				// Copy the current source pixel to the target area, replicating the source pixel to the
				// target area based on the specified target area pixel block size.
				var pixelXLoop = 0;
				var pixelYLoop = 0;
				for (pixelYLoop = 0; pixelYLoop < this.pixBlockSize; pixelYLoop++) {
					var pixelSpanOffsetY = pixelYLoop * targetContext.canvas.width * componentsPerColor;
					for (pixelXLoop = 0; pixelXLoop < this.pixBlockSize; pixelXLoop++) {
						var pixelSpanOffsetX = pixelXLoop * componentsPerColor;
						targetDataLocal[targetBaseOffset + (xPosLoop * componentsPerColor) +
							pixelSpanOffsetX + pixelSpanOffsetY] = sourceDataLocal[sourceBufferOffset];
						targetDataLocal[targetBaseOffset + (xPosLoop * componentsPerColor) + 1 +
							pixelSpanOffsetX + pixelSpanOffsetY] = sourceDataLocal[sourceBufferOffset + 1];
						targetDataLocal[targetBaseOffset + (xPosLoop * componentsPerColor) + 2 +
							pixelSpanOffsetX + pixelSpanOffsetY] = sourceDataLocal[sourceBufferOffset + 2];
						targetDataLocal[targetBaseOffset + (xPosLoop * componentsPerColor) + 3 +
							pixelSpanOffsetX + pixelSpanOffsetY] = sourceDataLocal[sourceBufferOffset + 3];
					}
				}
			}
		}
		
		this.targetImageData.data = targetDataLocal;
		this.sourceImageData.data = sourceDataLocal;
		
		if ((completionFraction >= zoomTransitionStartFract) &&
			(completionFraction <= zoomTransitionEndFract) &&
			validateVar(this.scratchCanvas) &&
			validateVar(this.scratchContext)) {

			// Ensure that the dimensions of the "scratch" canvas are the same
			// as the dimensions of the target canvas.
			if ((targetContext.canvas.width != this.scratchCanvas.width) ||
				(targetContext.canvas.height != this.scratchCanvas.height)) {
				this.scratchCanvas.width = targetContext.canvas.width;
				this.scratchCanvas.height = targetContext.canvas.height;
			}

			zoomCompletionFract = (completionFraction - zoomTransitionStartFract) /
				(zoomTransitionEndFract - zoomTransitionStartFract);
				
			zoomCompletionFract *= zoomCompletionFract;
				
			var tempImage = new Image();
			var targetWidth = zoomCompletionFract * this.targetImageData.width;
			var targetHeight = zoomCompletionFract * this.targetImageData.height;
			var targetX = (this.targetImageData.width - targetWidth) / 2
			var targetY = (this.targetImageData.height - targetHeight) / 2
						
			this.scratchContext.putImageData(this.targetImageData, 0, 0);
			
			targetContext.drawImage(this.scratchCanvas, targetX, targetY,
				targetWidth, targetHeight);
		}
		else {
			targetContext.putImageData(this.targetImageData, 0, 0);
			
			if ((completionFraction >= fadeTransitionStartFract) &&
				(completionFraction <= fadeTransitionEndFract)) {

				// Fade-out transition - "occlude" the scene with a black rectangle,
				// progressively increasing the alpha value of the rectangle.
				var fadeOcclusionAlpha = (completionFraction - fadeTransitionStartFract) /
					(fadeTransitionEndFract - fadeTransitionStartFract);

				var fillColorStr = "rgba(0,0,0," + fadeOcclusionAlpha + ")";
				clearContext(targetContext, fillColorStr);	
			}
		}
	}
}

/**
 * Performs any actions required to conclude/release
 *  segment resources
 */
segmentRotoPhotoZoomer.prototype.conclude = function () {

}
