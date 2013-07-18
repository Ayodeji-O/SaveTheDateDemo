// SegmentLocationZoomer.js - Zooming "Save the Date" animation segment (map)
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Kt-Ao_SaveTheDateMain.js

function segmentLocationZoomer () {
}

/**
 * Initializes any data/resources required by the
 *  segment.
 */
segmentLocationZoomer.prototype.initialize = function() {

	// List of the source identifiers, and their associated zoom
	// levels (zoom levels are arbitrary - of primary
	// importance is the accurate relation between the
	// zoom levels and the relative zoom amounts of
	// each image). Lower levels indicate higher
	// zoom factors (more detail). Zoom levels must
	// be listed in ascending order within this array.
	// Also, all zoom levels must be greater than zero.
	var zoomImageList = [
		{
			sourceResId: resIdentifiers.img.imgCylburnZoom00,
			level: 1
		},
		{
			sourceResId: resIdentifiers.img.imgCylburnZoom03,
			level: 8
		},		
		{
			sourceResId: resIdentifiers.img.imgCylburnZoom05,
			level: 32
		},		
		{
			sourceResId: resIdentifiers.img.imgCylburnZoom07,
			level: 128
		},
		{
			sourceResId: resIdentifiers.img.imgCylburnZoom09,
			level: 512
		},			
		{
			sourceResId: resIdentifiers.img.imgCylburnZoom11,
			level: 2048
		},
		{
			sourceResId: resIdentifiers.img.imgCylburnZoom13,
			level: 8192
		},		
		{
			sourceResId: resIdentifiers.img.imgCylburnZoom15,
			level: 32768
		},
	]
	
	// Create the zoom levels array (this array will store
	// the actual image data).
	this.zoomLevels = new Array();
	
	// Add the images to the zoom level array, along with
	// the relative zoom level of each image
	var zoomInitLoop = 0;
	var lowestZoomLevel = 0;
	for (zoomInitLoop = 0; zoomInitLoop < zoomImageList.length;
		zoomInitLoop++) {
		
		// Store the lowest zoom level (should be the first-encountered
		// zoom level.
		if ((lowestZoomLevel === 0) &&
			(zoomImageList[zoomInitLoop].level > 0))
		{
			lowestZoomLevel = zoomImageList[zoomInitLoop].level;
		}
		
		// ...Store the current image in the array, along with its
		// zoom level, normalizing the zoom levels to a base level of
		// one.
		this.zoomLevels.push( 
			{
				levelImage: getImageResource(zoomImageList[zoomInitLoop].sourceResId),
				zoomLevel: (zoomImageList[zoomInitLoop].level / lowestZoomLevel),
				correctionY: zoomImageList[zoomInitLoop].correctionY
			} );
	}
	
	// Store the maximum zoom level.
	this.maxZoomLevel = this.zoomLevels[this.zoomLevels.length - 1].zoomLevel;
}

/**
 * Executes a single segment step, the appearance of which is
 *  directly related to the immediate segment completion fraction
 * @param targetContext The canvas context to which the segment data
 *                      will be written
 * @param completionFraction Segment completion fraction (will be
 *                           between 0.0 - 1.0, inclusive).
 */
segmentLocationZoomer.prototype.executeStep =
	function(targetContext, completionFraction) {

    if (validateVar(targetContext) && validateVar(completionFraction) &&
		(this.maxZoomLevel > 0)) {

		var finalFrameZoomLevel = 1.0;		
		
		if (completionFraction < 1) {			
			var currentLevelIndex = 0;
			
			var panStartFraction = 0.0;
			var zoomStartFraction = 0.05;
			var zoomEndFraction = 0.8;
			
			if ((completionFraction < zoomStartFraction) &&
				(completionFraction >= panStartFraction)) {
				// Transition - pan the initial frame to be zoomed across the screen
				var panCompletionFraction = (completionFraction - panStartFraction) /
					(zoomStartFraction - panStartFraction);

				// Determine the position of the initial frame that is being panned.
				panPosX = (1.0 - panCompletionFraction) * targetContext.canvas.width;
				panPosY = 0;
				
				// Draw the current frame of the panning sequence.
				targetContext.globalAlpha = "1.0";
				targetContext.globalCompositeOperation = "source-over";	
				targetContext.drawImage(
					this.zoomLevels[this.zoomLevels.length - 1].levelImage, panPosX,
					panPosY, targetContext.canvas.width, targetContext.canvas.height);
			}			
			if ((completionFraction >= zoomStartFraction) &&
				(completionFraction <= zoomEndFraction) &&
				(zoomStartFraction <= zoomEndFraction)) {
				// Determine the current zoom level, normalizing the
				// zoom levels to a maximum of one, and matching the
				// normalized zoom levels to the remaining execution
				// fraction (1 - completion fraction). Also, square the 
				// completion fraction in order to shift the distribution
				// of completion fraction sampling values towards zero
				// (otherwise, values are skipped due to lack of
				// frame rate precision).
				var zoomCompletionFraction = (completionFraction - zoomStartFraction) /
					(zoomEndFraction - zoomStartFraction)
					
				var remainingFraction = Math.pow(1 - zoomCompletionFraction, 3.0);
				
				if ((remainingFraction * this.maxZoomLevel) < finalFrameZoomLevel) {
					// Clamp the zoom degree of the final zoom level.
					remainingFraction = finalFrameZoomLevel / this.maxZoomLevel;
				}
				
				var levelSearchLoop = this.zoomLevels.length - 1;
				var bZoomLevelFound = false;
				var interLevelRemainingFract = 0;
				while ((levelSearchLoop >= 1) && !bZoomLevelFound) {
					
					// Attempt to determine the level index - the level
					// index is determined as the level that has a higher
					// index between two levels that bound the completion
					// fraction (when the levels are normalized to a
					// maximum value of one).
					var currentUpperLevel =
						this.zoomLevels[levelSearchLoop].zoomLevel /
						this.maxZoomLevel;
					var currentLowerLevel =
						this.zoomLevels[levelSearchLoop - 1].zoomLevel /
						this.maxZoomLevel;
					
					if ((currentUpperLevel >= remainingFraction) &&
						(currentLowerLevel < remainingFraction)) {

						// Zoom level has been determined - store the
						// level, and determine the inter-level
						// completion fraction that will be used to
						// determine individual zoom factors for each level.
						currentLevelIndex = levelSearchLoop;
						interLevelRemainingFract =
							(remainingFraction - currentLowerLevel) /
							(currentUpperLevel - currentLowerLevel);
						bZoomLevelFound = true;
					}
					
					levelSearchLoop--;
				}

				var primaryScaleFactor =
					(this.zoomLevels[currentLevelIndex].zoomLevel /
					this.maxZoomLevel) / remainingFraction;

				// Determine the size of the image, and the associated coordinates required to
				// orient the center of the image with the screen center.
				var primarySizeX = targetContext.canvas.width * primaryScaleFactor;
				var primarySizeY = targetContext.canvas.height * primaryScaleFactor;			
				var primaryPosX = (targetContext.canvas.width - primarySizeX) / 2;
				var primaryPosY = (targetContext.canvas.height - primarySizeY) / 2;
				
				clearContext(targetContext, "rgb(0, 0, 0)");			
				
				// Draw the image.
				targetContext.globalAlpha = "1.0";
				targetContext.globalCompositeOperation = "source-over";		
				targetContext.drawImage(
					this.zoomLevels[currentLevelIndex].levelImage, primaryPosX,
					primaryPosY, primarySizeX, primarySizeY);
				
				if (currentLevelIndex > 0)
				{
					var secondaryScaleFactor = (this.zoomLevels[currentLevelIndex - 1].zoomLevel /
						this.maxZoomLevel) / remainingFraction;
					
					var secondarySizeX = targetContext.canvas.width * secondaryScaleFactor;
					var secondarySizeY = targetContext.canvas.height * secondaryScaleFactor;
					var secondaryPosX = (targetContext.canvas.width - secondarySizeX) / 2;
					var secondaryPosY = (targetContext.canvas.height - secondarySizeY) / 2;
					
					targetContext.globalAlpha = String(1.0 - interLevelRemainingFract);
					targetContext.drawImage(
						this.zoomLevels[currentLevelIndex - 1].levelImage, secondaryPosX,
						secondaryPosY, secondarySizeX, secondarySizeY);
				}
			}
			else if (completionFraction > zoomEndFraction) {
				// Determine the size of the image, and the associated coordinates required to
				// orient the center of the image with the screen center.
				var finalFrameSizeX = targetContext.canvas.width * finalFrameZoomLevel;
				var finalFrameSizeY = targetContext.canvas.height * finalFrameZoomLevel;			
				var finalFramePosX = (targetContext.canvas.width - finalFrameSizeX) / 2;
				var finalFramePosY = (targetContext.canvas.height - finalFrameSizeY) / 2;	
				
				// Draw the image.
				targetContext.globalAlpha = "1.0";
				targetContext.globalCompositeOperation = "source-over";		
				targetContext.drawImage(
					this.zoomLevels[0].levelImage, finalFramePosX,
					finalFramePosY, finalFrameSizeX, finalFrameSizeY);			
						
			    // Height of the font is related to the height of the
				// canvas - the canvas height is a multiple of the font 
				// height (specifies multiple)
				var fontHeightDivisor = 8;
        
				var fontHeight = targetContext.canvas.height /
					fontHeightDivisor;
					var locationStr = new String;
					locationStr = getStringFromDomId("string_eventlocation");
					
					targetContext.font = "italic bold " + fontHeight + "px sans-serif";
					targetContext.textBaseline = "middle";
					
					var shakeMaxMagX = 20;
					var shakeMaxMagY = 15;

					var textWidth = targetContext.measureText(locationStr);
					var baseTextPosX = (targetContext.canvas.width - textWidth.width) / 2;
					var baseTextPosY = (Math.round(targetContext.canvas.height * 3 / 4));
				
					targetContext.globalAlpha = "1.0";
					targetContext.fillStyle = "rgb(255, 255, 255)";
					targetContext.fillText(locationStr,
						Math.round(baseTextPosX + Math.random() * shakeMaxMagX),
						Math.round(baseTextPosY + Math.random() * shakeMaxMagY));
			}
		}
	
	}
}

/**
 * Performs any actions required to conclude/release
 *  segment resources
 */
segmentLocationZoomer.prototype.conclude = function() {
}