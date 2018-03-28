/**
 * Created by admin on 2016/6/6.
 */
(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var toolType = 'probeUnSave';

    var tmpPoint = undefined;

    function clearTmpPoint(){
        tmpPoint = undefined;
    }
    function getTmpPoint(){
        return tmpPoint;
    }
    function createTmpPoint(mouseEventData){
        var measurementData = {
            visible: true,
            active: true,
            handles: {
                end: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };
        tmpPoint =  measurementData;

        var eventData = {
            mouseButtonMask: mouseEventData.which
        };

        var element = mouseEventData.element;

        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

        cornerstone.updateImage(element);


        var handleMover;
        if (Object.keys(measurementData.handles).length === 1) {
            handleMover = cornerstoneTools.moveHandle;
        } else {
            handleMover = cornerstoneTools.moveNewHandle;
        }

        var preventHandleOutsideImage;
        preventHandleOutsideImage = false;

        handleMover(mouseEventData, toolType, measurementData, measurementData.handles.end, function() {
            measurementData.active = false;
            measurementData.invalidated = true;
            if (cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                // delete the measurement
                clearTmpPoint();
            }

            $(element).on('CornerstoneToolsMouseMove', eventData,mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseDown', eventData,mouseDownCallback);
            $(element).on('CornerstoneToolsMouseDownActivate',eventData, mouseDownActivateCallback);

            cornerstone.updateImage(element);
        }, preventHandleOutsideImage);
    }

    function mouseDownCallback(e,eventData){console.log('%c mouseDownCallback','color:blue');
        var data;
        var element = eventData.element;

        function handleDoneMove(){
            data.active = false;
            data.invalidated = true;
            if (cornerstoneTools.anyHandlesOutsideImage(eventData, data.handles)) {
                // delete the measurement
                clearTmpPoint();
            }

            cornerstone.updateImage(element);
            $(element).on('CornerstoneToolsMouseMove', eventData,mouseMoveCallback);
        }

        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var coords = eventData.startPoints.canvas;
            var toolData = getTmpPoint();
            if(toolData){
                var preventHandleOutsideImage;
                preventHandleOutsideImage = false;
                //只有一个临时点
                data = toolData;
                var distanceSq = cornerstoneTools.distanceSqR||25;//zyy add cornerstoneTools.distanceSqR
                var handle = cornerstoneTools.getHandleNearImagePoint(element, data.handles, coords, distanceSq);
                if (handle) {
                    //形成一组事件开关
                    $(element).off('CornerstoneToolsMouseMove',mouseMoveCallback);
                    data.active = true;
                    cornerstoneTools.moveHandle(eventData, mouseToolInterface.toolType, data, handle, handleDoneMove, preventHandleOutsideImage);
                    e.stopImmediatePropagation();
                    return false;
                }
            }
        }
    }

    //active的设计是mousedown但是没遇到stopImmediatePropagation时的触发
    function mouseDownActivateCallback(e, eventData) {console.log('%c mouseDownActivateCallback','color:blue');
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            createTmpPoint(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseMoveCallback(e, eventData){console.log('%c mouseMoveCallback','color:blue');
        cornerstoneTools.toolCoordinates.setCoords(eventData);
        // if a mouse button is down, do nothing
        if (eventData.which !== 0) {
            return;
        }

        // if we have no tool data for this element, do nothing
        var toolData = getTmpPoint();
        if (!toolData) {
            return;
        }

        // We have tool data, search through all data
        // and see if we can activate a handle
        var imageNeedsUpdate = false;

        // get the cursor position in canvas coordinates
        var coords = eventData.currentPoints.canvas;

        var data = toolData;
        if (cornerstoneTools.handleActivator(eventData.element, data.handles, coords) === true) {
            imageNeedsUpdate = true;
        }

        // Handle activation status changed, redraw the image
        if (imageNeedsUpdate === true) {
            cornerstone.updateImage(eventData.element);
        }
    }

    function mouseUpCallback(e, eventData){console.log('%c mouseUpCallback','color:blue',eventData);//这个up是move之后的up    很短的一下，直接识别为click
        clearTmpPoint();
        var element = eventData.element;
        cornerstone.updateImage(element);
    }

    function onImageRendered(e, eventData) {
        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = getTmpPoint();
        if (!toolData) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var color;
        var font = cornerstoneTools.textStyle.getFont();
        var fontHeight = cornerstoneTools.textStyle.getFontSize();

        context.save();
        var data = toolData;

        if (data.active) {
            color = cornerstoneTools.toolColors.getActiveColor();
        } else {
            color = cornerstoneTools.toolColors.getToolColor();
        }

        // draw the handles
        cornerstoneTools.drawHandles(context, eventData, data.handles, color,undefined,{R:1.2});

        var x = Math.round(data.handles.end.x);
        var y = Math.round(data.handles.end.y);
        var storedPixels;

        var text,
            str;

        if (x < 0 || y < 0 || x >= eventData.image.columns || y >= eventData.image.rows) {
            return;
        }

        if (eventData.image.color) {
            text = '' + x + ', ' + y;
            storedPixels = cornerstoneTools.getRGBPixels(eventData.element, x, y, 1, 1);
            str = 'R: ' + storedPixels[0] + ' G: ' + storedPixels[1] + ' B: ' + storedPixels[2];
        } else {
            storedPixels = cornerstone.getStoredPixels(eventData.element, x, y, 1, 1);
            var sp = storedPixels[0];
            var mo = sp * eventData.image.slope + eventData.image.intercept;
            var suv = cornerstoneTools.calculateSUV(eventData.image, sp);

            // Draw text
            // text = '' + x + ', ' + y;
            // str = 'SP: ' + sp + ' MO: ' + parseFloat(mo.toFixed(1));
            // if (suv) {
            //     str += ' SUV: ' + parseFloat(suv.toFixed(1));
            // }
            //    sj change probeUnsave
            text ='X,Y: ' + x + ', ' + y;
            str='MO: '+parseFloat(mo.toFixed(1));
            var textwidth=  Math.max(context.measureText(text).width,context.measureText(str).width);
            //     sj change probeUnsave end
        }

        var coords = {
            // translate the x/y away from the cursor
            x: data.handles.end.x + 3,
            y: data.handles.end.y - 3
        };
        var textCoords = cornerstone.pixelToCanvas(eventData.element, coords);

        context.font = font;
        context.fillStyle = color;

        // cornerstoneTools.drawTextBox(context, str, textCoords.x, textCoords.y + fontHeight + 5, color);
        // cornerstoneTools.drawTextBox(context, text, textCoords.x, textCoords.y, color);

        //sj change
        cornerstoneTools.drawTextBox(context, text, textCoords.x+5, textCoords.y + fontHeight + 5, color,textwidth);
        cornerstoneTools.drawTextBox(context, str, textCoords.x+5, textCoords.y, color,textwidth);//传入 width 参数
        // sj change end
        context.restore();
    }

    // module exports
    cornerstoneTools.probeUnSave = cornerstoneTools.mouseButtonTool({
        mouseDownCallback: mouseDownCallback,
        mouseDownActivateCallback: mouseDownActivateCallback,
        onImageRendered: onImageRendered,
        mouseUpCallback: mouseUpCallback,
        mouseClickCallback: mouseUpCallback,
        toolType: toolType
    });

})($, cornerstone, cornerstoneTools);