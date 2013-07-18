// Utility.js - Utility routines used within the "Save the Date" demo
// Author: Ayodeji Oshinnaiye

/**
 * Validates a variable, ensuring that it
 *  is defined and non-null
 * @param [any] variable Variable to be validated
 * @return True if the variable is defined and
 *         non-null, false otherwise
 */
function validateVar(variable) {
    // Ensure that the variable is usable.
    return ((typeof(variable) !== 'undefined') &&
        (variable !== null));
}

/**
 * Returns a string value associated with a DOM
 *  element
 * @param domId DOM identifier of the element that
 *              contains the string to be retrieved
 * @return A string upon success, null otherwise
 */
function getStringFromDomId(domId) {
    var outString = null;

    if (validateVar(domId)) {
        // Retrieve the element that contains the target string.
        var targetElement = document.getElementById(domId);
        if (typeof(targetElement.value) !== 'undefined')
        {
            // Element value is valid - return the string.
            outString = targetElement.value;
        }
    }
    
    return outString;
}

/** 
 * Clears a context, using the specified fill style
 * @param targetContext The context that is to be cleared
 * @param fillStyleStr A string that specifies the type
 *                     of fill pattern/color that will be
 *                     used to clear the context
 */
function clearContext(targetContext, fillStyleStr) {
    if (validateVar(targetContext)) {
        targetContext.fillStyle = fillStyleStr;
        targetContext.fillRect(0, 0,
            targetContext.canvas.width,
            targetContext.canvas.height);
    }
}

/**
 * Retrieves an image resource that is associated with the
 *  specified image identifier
 * @param imageIdentifier Identifier associated with the
 *                        image to be retrieved
 * @return An image object upon success, null otherwise
 */
function getImageResource(imageIdentifier) {
	var imageResource = null;

	if (validateVar(mainImageList) && validateVar(imageIdentifier)) {
		// Iterate through the image list array, attempting to
		// find the image with the associated resource identifier.
		currentResArrayIndex = 0;
		while ((imageResource === null) &&
			(currentResArrayIndex < mainImageList.length)) {
			if (mainImageList[currentResArrayIndex].resId ===
				imageIdentifier) {
				
				// The image has been found - return the image object.
				imageResource = mainImageList[currentResArrayIndex].imageObj;
			}
			
			currentResArrayIndex++;			
		}
	}

	return imageResource;
}