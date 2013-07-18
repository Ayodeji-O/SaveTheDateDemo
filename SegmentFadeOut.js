// SegmentFadeOut.js - General fade-out (fade to black) animation segment
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Kt-Ao_SaveTheDateMain.js

function segmentFadeOut() {
}				
				
/**
 * Initializes any data/resources required by the
 *  segment.
 */
segmentFadeOut.prototype.initialize = function() {
}

segmentFadeOut.prototype.executeStep =
	function(targetContext, completionFraction) {
	
	if (validateVar(targetContext) && validateVar(completionFraction)) {

		// Exponent used to control the compounding effect of fading
		// a previously-faded image. Higher exponents extend the overall
		// fading time, but result in a more fade transition.
		var fadeExponent = 3.0;
	
		fadeAlpha = Math.pow(completionFraction, fadeExponent);
	
		var fillColorStr = "rgba(0,0,0," + fadeAlpha + ")";
		clearContext(targetContext, fillColorStr);					
	}
}
					
 /**
  * Performs any actions required to conclude/release
  *  segment resources
  */
segmentFadeOut.prototype.conclude = function() {
}  