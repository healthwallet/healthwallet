/**
 * Created by admin on 2016/5/25.
 */
(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    var toolType = 'twolines';

    function createNewMeasurement(mouseEventData) {
        // create the measurement data for this tool with the end handle activated
        var lineData = {
            visible: true,
            active: true,
            handles: {
                start: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: false
                },
                end: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };
        return lineData;
    }

    function pointNearTool(element, data, coords) {
        var R = 5;
        if(!(cornerstoneTools.recognizeR === undefined)){
            R = cornerstoneTools.recognizeR;    // jshint ignore:line
        }
        var lineSegment = {
            start: cornerstone.pixelToCanvas(element, data.handles.start),
            end: cornerstone.pixelToCanvas(element, data.handles.end)
        };

        var distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
        return (distanceToPoint < R);
    }

    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if (toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        //activation color
        var color;
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var font = cornerstoneTools.textStyle.getFont();
        var config = cornerstoneTools.angle.getConfiguration();

        for (var i = 0; i < toolData.data.length; i++) {
            context.save();

            // configurable shadow
            if (config && config.shadow) {
                context.shadowColor = config.shadowColor || '#000000';
                context.shadowOffsetX = config.shadowOffsetX || 1;
                context.shadowOffsetY = config.shadowOffsetY || 1;
            }

            var data = toolData.data[i];

            //differentiate the color of activation tool
            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
            }

            // draw the line
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;


            var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
            var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            context.moveTo(handleStartCanvas.x, handleStartCanvas.y);
            context.lineTo(handleEndCanvas.x, handleEndCanvas.y);
            context.stroke();

            // draw the handles
            cornerstoneTools.drawHandles(context, eventData, data.handles);

            // Draw the text
            context.fillStyle = color;

            // Need to work on correct angle to measure.  This is a cobb angle and we need to determine
            // where lines cross to measure angle. For now it will show smallest angle.
            var dx1 = (Math.ceil(data.handles.start.x) - Math.ceil(data.handles.end.x)) * eventData.image.columnPixelSpacing;
            var dy1 = (Math.ceil(data.handles.start.y) - Math.ceil(data.handles.end.y)) * eventData.image.rowPixelSpacing;

            // Set the length text suffix depending on whether or not pixelSpacing is available
            var suffix = ' mm';
            if (!eventData.image.rowPixelSpacing || !eventData.image.columnPixelSpacing) {
                suffix = ' pixels';
            }

            var length1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

            // Place the length measurement text next to the right-most handle
            var fontSize = cornerstoneTools.textStyle.getFontSize();
            var textCoords = {
                x: Math.max(handleStartCanvas.x, handleEndCanvas.x),
            };

            // Depending on which handle has the largest x-value,
            // set the y-value for the text box
            if (textCoords.x === handleStartCanvas.x) {
                textCoords.y = handleStartCanvas.y;
            } else {
                textCoords.y = handleEndCanvas.y;
            }

            // Move the textbox slightly to the right and upwards
            // so that it sits beside the length tool handle
            textCoords.x += 10;
            textCoords.y -= fontSize / 2 + 7;

            //第二条线时的文字 ----- 最后长度数据取整或保留一位就行了，临床意义不大，减少遮挡
            if((i+1)%2==0){
                var prevData = toolData.data[i-1];
                var handlePrevStartCanvas = cornerstone.pixelToCanvas(eventData.element, prevData.handles.start);
                var handlePrevEndCanvas = cornerstone.pixelToCanvas(eventData.element, prevData.handles.end);
                var dx0 = (Math.ceil(prevData.handles.start.x) - Math.ceil(prevData.handles.end.x)) * eventData.image.columnPixelSpacing;
                var dy0 = (Math.ceil(prevData.handles.start.y) - Math.ceil(prevData.handles.end.y)) * eventData.image.rowPixelSpacing;
                var length0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
                var text1 = '' + length1.toFixed(1) + suffix;
                var text =  length0.toFixed(1) + '/' +text1+ ' (' + (length0/length1).toFixed(2) + ')';
            }else{
                var text = '' + length1.toFixed(1) + suffix;
            }

            // Draw the textbox
            cornerstoneTools.drawTextBox(context, text, textCoords.x, textCoords.y, color);
            context.restore();
        }
    }

    // module exports
    cornerstoneTools.twolines = cornerstoneTools.mouseButtonTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });

})($, cornerstone, cornerstoneMath, cornerstoneTools);