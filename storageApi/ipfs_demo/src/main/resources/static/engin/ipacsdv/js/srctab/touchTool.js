/**
 * Created by admin on 2016/5/11.
 */
// Begin Source: src/imageTools/panMultiTouch.js
(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function touchPanCallback(e, eventData) {
        e.stopImmediatePropagation();
        var config = cornerstoneTools.panMultiTouch.getConfiguration();
        //if (config && config.testPointers(eventData)) {
            var scale =  eventData.viewport.scale * cornerstone.diy.iniScaleCal(eventData);
            eventData.viewport.translation.x += (eventData.deltaPoints.page.x / scale);
            eventData.viewport.translation.y += (eventData.deltaPoints.page.y / scale);//eventData.viewport.scale
            cornerstone.setViewport(eventData.element, eventData.viewport);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        //}
    }

    //var configuration = {
    //    testPointers: function(eventData) {
    //        return (eventData.numPointers >= 2);
    //    }
    //};

    cornerstoneTools.touchDragTool = cornerstoneTools.touchDragTool(touchPanCallback);
    //cornerstoneTools.panMultiTouch.setConfiguration(configuration);

})($, cornerstone, cornerstoneTools);