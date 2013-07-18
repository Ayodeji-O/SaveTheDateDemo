// SegmentFinal.js - "Save the Date" final animation segment
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Kt-Ao_SaveTheDateMain.js

function segmentFinal() {
}

/**
 * Initializes any data/resources required by the
 *  segment.
 */
 segmentFinal.prototype.initialize = function() {
	// Font height is determined by dividing the canvas
	// height by this value.
	this.fontHeightDivisor = 7;
 }
 
 segmentFinal.prototype.executeStep =
      function(targetContext, completionFraction) {
	  
	if (validateVar(targetContext) && validateVar(completionFraction)) {
	
		// Fade-in transition start/end fractions
		var fadeInTransitionStartFract = 0.0;
		var fadeInTransitionEndFract = 0.3;	
			
		var clearFillColorStr = "rgba(0,0,0,1.0)";	
		clearContext(targetContext, clearFillColorStr);	
	
		// Compute the font height.
		var fontHeight = targetContext.canvas.height / this.fontHeightDivisor;
	
		// ...Assign the canvas font.
		targetContext.font = "italic bold " + fontHeight + "px sans-serif";
			targetContext.textBaseline = "middle";	
	
		saveTheDateStr = new String();
		dateStr = new String();
		if (validateVar(saveTheDateStr) && validateVar(dateStr)) {
			// Compute string width for positioning purposes...
			saveTheDateStr = getStringFromDomId("string_savethedatefinal");
			var saveTheDateStrWidth = targetContext.measureText(saveTheDateStr);
			
			dateStr = getStringFromDomId("string_eventdatefinal");
			var dateStrWidth = targetContext.measureText(dateStr);
			
			// Relative position multipliers used to determine the staring Y-coordinate
			// of the text lines.
			var firstLineRelY = 2.5;
			var secondLineRelY = 4.0;
			
			// Compute the text line positions...
			var firstLineX = (targetContext.canvas.width - saveTheDateStrWidth.width) / 2;
			var firstLineY = (targetContext.canvas.height / this.fontHeightDivisor) *
				firstLineRelY;
			
			var secondLineX = (targetContext.canvas.width - dateStrWidth.width) / 2;
			var secondLineY = (targetContext.canvas.height / this.fontHeightDivisor) *
				secondLineRelY;
			
			// Draw the "Save the Date" (first line) and date (second line) text.
			targetContext.fillStyle = "rgb(255, 255, 255)";
			targetContext.fillText(saveTheDateStr, firstLineX, firstLineY);			
			targetContext.fillText(dateStr, secondLineX, secondLineY);

			// Determine if a fade-in should be performed, and compute
			// the appropriate alpha value for the fade occlusion.
			if ((completionFraction >= fadeInTransitionStartFract) &&
				(completionFraction <= fadeInTransitionEndFract)) {
				
				var fadeAlpha = 1.0 - ((completionFraction - fadeInTransitionStartFract) /
					(fadeInTransitionEndFract - fadeInTransitionStartFract));
					
				var fillColorStr = "rgba(0,0,0," + fadeAlpha + ")";
				clearContext(targetContext, fillColorStr);					
			}
		}
	}
}
 
 /**
  * Performs any actions required to conclude/release
  *  segment resources
  */
 segmentFinal.prototype.conclude = function () {
 }