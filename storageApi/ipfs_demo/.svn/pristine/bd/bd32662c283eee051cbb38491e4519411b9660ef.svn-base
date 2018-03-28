/**
 * Created by admin on 2016/4/11.
 */
(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // This function synchronizes the target zoom and pan to match the source
    function rotateSynchronizer(synchronizer, sourceElement, targetElement) {

        // ignore the case where the source and target are the same enabled element
        if (targetElement === sourceElement) {
            return;
        }
        // get the source and target viewports
        var sourceViewport = cornerstone.getViewport(sourceElement);
        var targetViewport = cornerstone.getViewport(targetElement);

        // do nothing if the rotation is the same
        if (targetViewport.rotation === sourceViewport.rotation) {
            return;
        }

        targetViewport.rotation = sourceViewport.rotation;

        synchronizer.setViewport(targetElement, targetViewport);
    }

    // module/private exports
    cornerstoneTools.rotateSynchronizer = rotateSynchronizer;

})($, cornerstone, cornerstoneTools);
