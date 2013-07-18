// SegmentMoire.js - Moire "Save the Date" animation segment
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Kt-Ao_SaveTheDateMain.js

function segmentMoire() {
}

/**
 * Initializes any data/resources required by the
 *  segment.
 */
segmentMoire.prototype.initialize  = function() {
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
    
    // Number of "spokes" to be used in the radial moiré pattern.
    this.numSpokes = 300.0;
    
    // Interval, in radians, of the moire spokes (derived from the
    // number of spokes) for the radial moiré pattern.
    this.spokeIntervalRad = 2 * Math.PI / this.numSpokes;
    
    // Number of moiré rotations for the radial spokes.
    this.numRotations = 0.1;
    
    // Total number of radians of rotations for the radial spokes
    // (derived from total number of rotations).
    this.totalRotationDegrees = this.numRotations * 2 * Math.PI;
}

/**
 * Executes a single segment step, the appearance of which is
 *  directly related to the immediate segment completion fraction
 * @param targetContext The canvas context to which the segment data
 *                      will be written
 * @param completionFraction Segment completion fraction (will be
 *                           between 0.0 - 1.0, inclusive).
 */
segmentMoire.prototype.executeStep =
    function(targetContext, completionFraction) {
    
    if (validateVar(targetContext) && validateVar(completionFraction) &&
        (this.numSpokes > 0)) {
        
		// Completion fraction dedicated to fade-in
		var fadeInFract = 0.03;
		
        // Height of the font is related to the height of the
        // canvas - the canvas height is a multiple of the font 
        // height (specifies multiple)
        var fontHeightDivisor = 5;
        
        var fontHeight = targetContext.canvas.height /
            fontHeightDivisor;        
        
        // Maximum horizontal and vertical shaking magnitudes for date
        // text.
        var shakeMaxMagX = 20;
        var shakeMaxMagY = 15;
        
        // Determine the center of the canvas (spokes will extend radially
        // from the center).
        var centerX = Math.round(targetContext.canvas.width / 2);
        var centerY = Math.round(targetContext.canvas.height / 2);
        
        // Determine the required length of the ray (ray must be
        // long enough to extend offscreen at all angular orientations -
        // use the diagonal of the canvas as the length, as this is the
        // longest distance from the ray center).
        var spokeLength = 
            Math.sqrt(
            Math.pow(targetContext.canvas.width / 2.0, 2) +
            Math.pow(targetContext.canvas.height / 2.0, 2.0));

        // Determine the width of the spoke at the end that extends
        // from the center.
        //
        //      ________ Half-width
        //     V
        //   ____
        //   \   |
        //    \  | <- spoke length
        //     \ |
        //      \|
        //
        var spokeHalfWidth = spokeLength * Math.tan(this.spokeIntervalRad);
    
        // Compute the end points for a spoke oriented at 90°.
        var firstPointX = centerX - spokeHalfWidth;
        var firstPointY = centerY - spokeLength;
        var secondPointX = centerX + spokeHalfWidth;
        var secondPointY = firstPointY;
        
        // Clear the target context before drawing.
        targetContext.globalAlpha = "1.0";
		targetContext.globalCompositeOperation = "source-over";
        clearContext(targetContext, "rgb(0, 0, 0)");

        // Rotate the points around the center point, creating the
        // required number of spokes, using the two-dimensional
        // rotation formula:
        // x' = (x - x.pivot) · cos(a) - (y - y.pivot) · sin(a) + x.pivot
        // y' = (y - y.pivot) · cos(a) + (x - x.pivot) · sin(a) + y.pivot
        
        var currentSpoke = 0;
        var numLayers = 2;
        
        for (layerLoop = 0; layerLoop < numLayers; layerLoop++)
        {
            var currentAngle = completionFraction * this.totalRotationDegrees /*/
                (layerLoop + 1)*/ * Math.pow(-1, (layerLoop + 1));		
		
			// Add random colors that change for each rotation increment.
			var maxColorComp = 127
			var colorComp1 = Math.round(maxColorComp* Math.cos(currentAngle * 13));
			var colorComp2 = Math.round(maxColorComp* Math.cos(currentAngle * 23));
			var colorComp3 = Math.round(maxColorComp * Math.cos(currentAngle * 31));
            if (layerLoop == 0) {
                targetContext.fillStyle = "rgba(" + colorComp1 + "," + colorComp2 + "," + colorComp3 + ", 255)";
                targetContext.globalAlpha = 1.0;
                targetContext.globalCompositeOperation = "source-over";
            }
            else {
				targetContext.fillStyle = "rgba(" + colorComp1 + "," + colorComp2 + "," + colorComp3 + ", 255)";
                targetContext.globalAlpha = 0.8;
                targetContext.globalCompositeOperation = "lighter";            
            }
            
            for (currentSpoke = 0; currentSpoke < this.numSpokes;
                currentSpoke++)
            {
                if ((currentSpoke % 3) == 0) {
                    var cosTheta = Math.cos(currentAngle +
                        (this.spokeIntervalRad * currentSpoke));
                    var sinTheta = Math.sin(currentAngle +
                        (this.spokeIntervalRad * currentSpoke));
                    
                    var newFirstX = Math.round(
                        ((firstPointX - centerX) * cosTheta) -
                        ((firstPointY - centerY) * sinTheta) + centerX);
                    var newFirstY = Math.round(
                        ((firstPointY - centerY) * cosTheta) +        
                        ((firstPointX - centerX) * sinTheta) + centerY);
                        
                    var newSecondX = Math.round(
                        ((secondPointX - centerX) * cosTheta) -
                        ((secondPointY - centerY) * sinTheta) + centerX);
                    var newSecondY = Math.round(
                        ((secondPointY - centerY) * cosTheta) +
                        ((secondPointX - centerX) * sinTheta) + centerY);

                    // Draw the spoke.                        
                    targetContext.beginPath();
                    targetContext.moveTo(centerX, centerY);
                    targetContext.lineTo(newFirstX, newFirstY);
                    targetContext.lineTo(newSecondX, newSecondY);
                    targetContext.lineTo(centerX, centerY);
                    targetContext.closePath();
                    targetContext.fill();
               }
            }
        }
        
        // Establish the font height, and determine the width of the
        // text...
        
        targetContext.font = "italic bold " + fontHeight + "px sans-serif";
        targetContext.textBaseline = "middle";
        var dateStr = new String;
        dateStr = getStringFromDomId("string_eventdate");                     
        var textWidth = targetContext.measureText(dateStr);
        
        var textPosX = Math.round((Math.random() * shakeMaxMagX) + 
            (targetContext.canvas.width - textWidth.width) / 2);
        var textPosY = Math.round((Math.random() * shakeMaxMagY) +
            (targetContext.canvas.height / 2));
			
		// Draw the text.
        targetContext.globalAlpha = "1.0";
        targetContext.fillStyle = "rgb(255,255,255)";
        targetContext.fillText(dateStr, textPosX, textPosY);
		
		if ((completionFraction <= fadeInFract) && (fadeInFract > 0.0))
		{
			// Change the screen to white state, fading into the  in order to provide
			// a method of transitioning to the next segment - the transition
			// will appear to be a quick "flash".
			
			// Determine the completion fraction of the flash...
			var fadeInCompletionFract = completionFraction /
				fadeInFract;
				
			// Set immediate flash intensity, based upon the completion fraction
			// (higher completion fraction value results in higher intensity) - alpha
			// blend the flash using the completion fraction.
			var fillColorStr = "rgba(255, 255, 255, 255)";			
			targetContext.globalAlpha = String(1.0 - fadeInCompletionFract);
				
			// Draw the "flash".
			clearContext(targetContext, fillColorStr);			
		}
    }
}

/**
 * Performs any actions required to conclude/release
 *  segment resources
 */
segmentMoire.prototype.conclude = function () {

}