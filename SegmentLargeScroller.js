// SegmentLargeScroller.js - Large scroller "Save the Date" animation segment
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Kt-Ao_SaveTheDateMain.js

function segmentLargeScroller() {
}

/**
 * Initializes any data/resources required by the
 *  segment.
 */
segmentLargeScroller.prototype.initialize =
    function() {
    
    // Create the offscreen canvas that will be used
    // for secondary drawing.
    this.offScreenCanvas = document.createElement("canvas");
    
    if (validateVar(this.offScreenCanvas)) {
        this.offScreenCanvas.width = defaultCanvasWidth;
        this.offScreenCanvas.height = defaultCanvasHeight;
    
        // Retrieve the offscreen context, and initialize the background
        // color to black.    
        this.offScreenContext = this.offScreenCanvas.getContext('2d');
        clearContext(this.offScreenContext, "rgb(0, 0, 0)");
    }
        
    // Displacement lookup tables - base table and modulation
    // table.    
    this.dispArrayBase = new Array();
    this.dispArrayMod = new Array();
    
    // Dictates the table size - table dimensions will be determined
    // from the width and height of the target canvas.
    var tableDimDivisor = 8;
    
    this.dispArrayRowSize = defaultCanvasWidth / tableDimDivisor;
    this.dispArrayNumRows = defaultCanvasHeight / tableDimDivisor;
    
    // Offset of the modulation table - will be used to
    // dynamically alter the position of modulation table
    // indices relative to the base table.
    this.modXOffset = 0;
    this.modYOffset = 0;
    
    // Maximum amplitude for a displacement.
    var maxDispAmplitude = 3;
    
    var arraySize = this.dispArrayRowSize *
        this.dispArrayNumRows;
        
    // Sine/cosine period, in pixels.
    var funcPeriod = this.dispArrayRowSize / 10;
    
    // Initialize the displacement lookup tables.
    var arrayInitLoop = 0;
    for (arrayInitLoop = 0; arrayInitLoop < arraySize; arrayInitLoop++) {
         this.dispArrayBase[arrayInitLoop] =
            Math.round(maxDispAmplitude *
            Math.sin((arrayInitLoop % this.dispArrayRowSize) / funcPeriod * 2 *
            Math.PI));
         this.dispArrayMod[arrayInitLoop] =
            Math.round(maxDispAmplitude *
            Math.cos((arrayInitLoop % this.dispArrayRowSize) / funcPeriod * 2 *
            Math.PI));
    }
}

/**
 * Executes a single segment step, the appearance of which is
 *  directly related to the immediate segment completion fraction
 * @param targetContext The canvas context to which the segment data
 *                      will be written
 * @param completionFraction Segment completion fraction (will be
 *                           between 0.0 - 1.0, inclusive).
 */
segmentLargeScroller.prototype.executeStep =
    function(targetContext, completionFraction) {
    
    if (validateVar(targetContext) && validateVar(completionFraction) &&
        validateVar(this.offScreenContext)) {

        this.offScreenContext.globalAlpha = "1.0";
        
        // Starting and ending completion fraction of the text
        // scrolling.
        var startScrollFract = 0.0;
        var endScrollFract = 0.97;
        
        // Displacement modulation table maximum offset magnitude
        // with respect to base displacement table.
        var modTabOffMagX = 1;//this.dispArrayRowSize / 10; 
        var modTabOffMagY = 1;//this.dispArrayNumRows / 10;
        
        // Number of modulation table offset cycles per full-width
        // scroll.
        var modOffsetXCycles = 37;
        var modOffsetYCycles = 13;
        
        // The amount, in pixels by which the horizontal margins
        // of the target area will be outset when scaling
        // residual frames for "smoke" effect (each side).
        var scaleTargetOutsetX = 40;
        
        // Maximum magnitude that will be applied to horizontal
        // positioning when scaling residual frames for "smoke"
        // effect.
        var jitterMaxMagnitude = 3;
        
        // Alpha blending amount that will be applied to residual
        // frame blending.
        var blendAlpha = 0.90;
        
        // The amount, in pixels, by which the target area will be
        // shifted upwards.
        var scaleOffsetV = 5;
                
        // Height of the font is related to the height of the
        // canvas - the canvas height is a multiple of the font 
        // height (specifies multiple)
        var fontHeightDivisor = 3;
        
        var fontHeight = this.offScreenContext.canvas.height /
            fontHeightDivisor;

        if ((completionFraction >= startScrollFract) &&
            (completionFraction <= endScrollFract)) {
            var saveDateStr = new String;
            saveDateStr = getStringFromDomId("string_savethedate");                        

            if ((saveDateStr !== null) && (endScrollFract !== 0.0) &&
                (endScrollFract > startScrollFract)) {
                // Scroll the text across the screen.
                
                // Establish the font height, and determine the width of the
                // text...
                this.offScreenContext.font = "italic bold " + fontHeight + "px sans-serif";
                this.offScreenContext.textBaseline = "middle";
                var textWidth = this.offScreenContext.measureText(saveDateStr);
                var scrollExtent = textWidth.width + this.offScreenContext.canvas.width;
                
                // Compute the ["sub-"]completion fraction for the scrolling
                // portion of the segment, and use this completion fraction to
                // determine the text position within the off-screen context
                // (text is scrolling right-to-left).
                var scrollFract = (completionFraction - startScrollFract) /
                    (endScrollFract - startScrollFract);
                var scrollPosX = (scrollExtent * (1.0 - scrollFract)) -
                    textWidth.width;
                
                // Copy the target context over the source, scaling the output
                // upward in order to create an upward dissipating/fading effect, and
                // draw the text.
                clearContext(this.offScreenContext, "rgb(0, 0, 0)");
                this.offScreenContext.globalAlpha = new String(blendAlpha);
                var jitterX = Math.round(2 * jitterMaxMagnitude * Math.random());
                jitterX -= jitterMaxMagnitude;
                this.offScreenContext.drawImage(targetContext.canvas,
                    -scaleTargetOutsetX + jitterX, -scaleOffsetV,
                    this.offScreenContext.canvas.width + 2 * scaleTargetOutsetX,
                    this.offScreenContext.canvas.height);
                    
                this.offScreenContext.globalAlpha = "1.0";                
                this.offScreenContext.fillStyle = "rgb(255, 255, 255)";
                this.offScreenContext.fillText(saveDateStr, scrollPosX,
                    (this.offScreenContext.canvas.height / 2));
            }
        
        
			if ((this.dispArrayRowSize > 0) && (this.dispArrayNumRows > 0)) {
				var stepSizeX = this.offScreenContext.canvas.width /
					this.dispArrayRowSize;
				var stepSizeY = this.offScreenContext.canvas.height /
					this.dispArrayNumRows;
				var xDispLoop = 0;            
				var yDispLoop = 0;

				// Retrieve the offscreen buffer image data for fast buffer
				// access...
				var imageData = this.offScreenContext.getImageData(0, 0,
					this.offScreenContext.canvas.width,
					this.offScreenContext.canvas.height);
				var newImageData = this.offScreenContext.createImageData(
					this.offScreenContext.canvas.width,
					this.offScreenContext.canvas.height);
					
				// Pixel stride, in terms of color components...
				var componentsPerColor = 4;

				for (yDispLoop = 0; yDispLoop < this.dispArrayNumRows;
					yDispLoop++) {
					for (xDispLoop = 0; xDispLoop < this.dispArrayRowSize;
						xDispLoop++) {                    
						
						// Compute the source image data retrieval displacements,
						// using the displacement tables...
						var baseOffsetX = xDispLoop + (this.dispArrayRowSize * yDispLoop);
						var modulateOffsetX = xDispLoop + this.modXOffset +
							(this.dispArrayRowSize * (yDispLoop + this.modYOffset));
						var displacementX = ((baseOffsetX < this.dispArrayBase.length) &&
							(modulateOffsetX < this.dispArrayBase.length)) ?
							(this.dispArrayBase[baseOffsetX] +
							this.dispArrayMod[modulateOffsetX]) : 0;
						var baseOffsetY = xDispLoop + (this.dispArrayRowSize * yDispLoop);
						var modulateOffsetY = xDispLoop + this.modXOffset +
							(this.dispArrayRowSize * (yDispLoop + this.modYOffset));
						var displacementY = ((baseOffsetY < this.dispArrayBase.length) &&
							(modulateOffsetY < this.dispArrayBase.length)) ?
							(this.dispArrayBase[baseOffsetY] +
							this.dispArrayMod[modulateOffsetY]) : 0;
							
						// Compute the intermediate source and destination offset (used for
						// creating the distortion effect).
						var sourceDataOffset = ((xDispLoop * stepSizeX + displacementX) +
							((yDispLoop * stepSizeY + displacementY) * imageData.width)) *
							componentsPerColor;
						var targetDataOffset = ((xDispLoop * stepSizeX) +
							(yDispLoop * stepSizeY * newImageData.width)) *
							componentsPerColor;
						
						// Plot the group of pixels involved in the distortion effect.
						var plotLoopX = 0;
						var plotLoopY = 0;
						for (plotLoopY = 0; plotLoopY < stepSizeY * imageData.width;
							plotLoopY += imageData.width) {
							for (plotLoopX = 0; plotLoopX < stepSizeX; plotLoopX++) {
								pixelOffset = (plotLoopX + plotLoopY) * componentsPerColor;
							
								var finalSourceOffset = sourceDataOffset + pixelOffset;
								if (((finalSourceOffset + componentsPerColor) < imageData.data.length) &&
									(sourceDataOffset >= 0)) {
									// Perform the reverse transformation, retrieving an offset
									// pixel in order to create a warping effect.
									newImageData.data[targetDataOffset + pixelOffset] =
										imageData.data[finalSourceOffset];
									newImageData.data[targetDataOffset + pixelOffset + 1] =
										imageData.data[finalSourceOffset + 1];
									newImageData.data[targetDataOffset + pixelOffset + 2] =
										imageData.data[finalSourceOffset + 2];
									newImageData.data[targetDataOffset + pixelOffset + 3] =
										imageData.data[finalSourceOffset + 3];
								}
								else
								{
									// Offset is out-of-range - return a black pixel.
									newImageData.data[targetDataOffset + pixelOffset] = 0;
									newImageData.data[targetDataOffset + pixelOffset + 1] = 0;
									newImageData.data[targetDataOffset + pixelOffset + 2] = 0;
									newImageData.data[targetDataOffset + pixelOffset + 3] = 255;     
								}
							}
						}
						
						this.modXOffset = Math.round(modTabOffMagX + (modTabOffMagX *
							Math.sin(modOffsetXCycles * 2 * Math.PI * scrollFract)) / 2);
						this.modYOffset = Math.round(modTabOffMagY + (modTabOffMagY *
							Math.sin(modOffsetYCycles * 2 * Math.PI * scrollFract)) / 2);
					}
				}

				// Copy the off-screen context to the display context.            
				targetContext.putImageData(newImageData, 0, 0);
			}
		}
		else if (completionFraction > endScrollFract) {
			// Change the screen to a blank white state in order to provide
			// a method of transitioning to the next segment - the transition
			// will appear to be a quick "flash".
			
			// Determine the completion fraction of the flash...
			var flashCompletionFract = (completionFraction - endScrollFract) /
				(1.0 - endScrollFract);
				
			// Set immediate flash intensity, based upon the completion fraction
			// (higher completion fraction value results in higher intensity) -
			// construct a fill-style string, using the determined flash
			// intensity.
			var maxFlashColorComp = 255;
			var currentFlashColorComp = Math.round(maxFlashColorComp *
				flashCompletionFract);				
			var fillColorStr = "rgba(" + currentFlashColorComp + "," +
				currentFlashColorComp + "," + currentFlashColorComp + ", 255)";
				
			// Draw the "flash".
			clearContext(targetContext, fillColorStr);		
		}
    }    
}

/**
 * Performs any actions required to conclude/release
 *  segment resources
 */
segmentLargeScroller.prototype.conclude =
    function() {
}