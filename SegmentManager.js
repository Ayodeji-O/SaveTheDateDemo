// SegmentManager.js - Handles execution of specified segments
// Author: Ayodeji Oshinnaiye

/**
 * Data that contains the segment to
 *  be executed, and its assigned duration
 */
var segmentData = {
    /**
     * Segment to be executed
     */
    segment : null,
    
    /**
     * Duration of the segment
     */
    maxDuration : 0
}

function segmentManager(segmentDataArray) {
    if (validateVar(segmentDataArray) &&
        (segmentDataArray instanceof Array) &&
        (segmentDataArray.length > 0))
    {
        // "Single-step" time quantum, in milliseconds
        // (the reciprocal of this value yields the
        // target frame rate).
        var singleStepQuantum = 33;

        /**
         * Executes a segment, invoking the segment
         *  execution routine repeatedly, until the
         *  specified maximum execution duration
         *  has been exhausted
         * @param [object] Segment to be executed
         * @param [integer] Maximum total duration of
         *                  the segment, in milliseconds
         * @param [integer] (Optional) startDuration -
         *                  starting time at which the
         *                  segment execution should
         *                  begin (segments use this
         *                  time in order to determine
         *                  the content to be displayed)
         */
        function runSegments(segmentDataArray) {
            // Index of the segment currently being executed.
            var currentSegmentIndex = 0;
            
            var bContinueExecution = true;
           
            // Total execution time of the current segment
            // (milliseconds).            
            var currentDuration =
                validateVar(segmentDataArray[currentSegmentIndex].startDuration) ?
                segmentDataArray[currentSegmentIndex].startDuration : 0;
                
            var bInitialized = false;
            
            /**
             * Executes a single segment step
             * @return True if the segment should continue execution,
             *         false otherwise
             */
            function runSegmentStep() {
                if (bContinueExecution &&
                (currentSegmentIndex < segmentDataArray.length) &&
                validateVar(segmentDataArray[currentSegmentIndex].segment) &&
                validateVar(segmentDataArray[currentSegmentIndex].maxDuration)) {
                    var segment = segmentDataArray[currentSegmentIndex].segment;                
                    if (currentDuration <
                        segmentDataArray[currentSegmentIndex].maxDuration) {
                        
                        if (!bInitialized) {
                            // Initialize the current segment.
                            segment.initialize();
                            bInitialized = true;
                        }

                        // Use the system clock to keep track of the
                        // execution period - the completion fraction
                        // can be used to ensure that the segment is
                        // synchronized with time, even if the target
                        // frameraate is not met.
                        var startClock = new Date();
                        
                        // Execute a segment step, computing
                        // the completion fraction, and providing
                        // it to the segment...
                        segment.executeStep(mainCanvasContext,
                            (currentDuration /
                            segmentDataArray[currentSegmentIndex].maxDuration));
                                
                        // Update the segment duration, and repeat
                        // the segment execution.
                        var endClock = new Date();
                        
                        if (validateVar(startClock) && validateVar(endClock)) {
                            // Current duration = immediate duration +
                            // single-step (frame) execution time +
                            // single-step (frame) interval
                            currentDuration += (endClock.getTime() -
                                startClock.getTime()) + singleStepQuantum;
                        }
                        else {
                            currentDuration += singleStepQuantum;
                        }
                    }
                    else {
                         // Current segment execution has been completed - proceed to the
                        // next segment in the array.
                        segment.conclude();

                        currentSegmentIndex++;
                        if (currentSegmentIndex < segmentDataArray.length) {                    
                            currentDuration =
                                validateVar(segmentDataArray[currentSegmentIndex].startDuration) ?
                                segmentDataArray[currentSegmentIndex].startDuration : 0;
                            bInitialized = false;
                        }
                        else {
                            bContinueExecution = false;
                        }
                    }
                    
                    if (bContinueExecution) {
                        window.setTimeout(runSegmentStep, singleStepQuantum);
                    }
                }
            }
            
            // Begin the segment execution loop.
            runSegmentStep();
        }

        // Commence the execution of the demo, running all segments within the
        // array.
        runSegments(segmentDataArray);
    }
}