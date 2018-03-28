/**
 * Created by admin on 2016/4/8.
 */
console.log(cornerstone);

//一个窗的播放，主要就是保证各个element直接的顺序是同步的，而不是一个跑风快，另一个还等到起
(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var winArr = [];

    function getWinState(win){
        return _.find(winArr,function(o){
            return o.wid == win.winId&&o.suid == win.suid;
        });
    }
    function removeState(win){
        for(var i=0;i<winArr.length;i++){
            if(winArr[i].wid == win.winId&&winArr[i].suid == win.suid){
                winArr.splice(i, 1);
            }
        }
    }
    function addWinState(win,data){
        winArr.push({
            wid:win.winId,
            suid:win.suid,
            data:[data]
        });
    }
    function incrementTimePoint(wrap, timePoints){
        var newStackIndex = wrap.stack.currentImageIdIndex + timePoints;
        if(newStackIndex>=wrap.stack.imageIds.length){
            newStackIndex=0;
        }else if(newStackIndex<0){
            newStackIndex=wrap.stack.imageIds.length-1;
        }

        //就没有考虑啥子preventCache
        var loader = cornerstone.loadImage(wrap.stack.imageIds[newStackIndex]);

        var element = wrap.element;
        var viewport = cornerstone.getViewport(element);

        loader.then(function(image) {
            if (wrap.stack.currentImageIdIndex !==newStackIndex) {
                wrap.stack.currentImageIdIndex =newStackIndex;
                cornerstone.displayImage(element, image, viewport);
            }
        }, function(error) {
            console.error(error);
        });
    }
    function play(win,framesPerSecond){
        if (win === undefined) {
            throw 'play: win must not be undefined';
        }
        if (framesPerSecond === undefined) {
            framesPerSecond = 100;
        }

        var playClipToolData = getWinState(win);
        var playClipData;
        if (playClipToolData === undefined || playClipToolData.data.length === 0 ||playClipToolData.data.length!=win.wrappers.length) {
            if(playClipToolData === undefined || playClipToolData.data.length === 0 ){

            }else{
                stop(win);
                removeState(win);
            }
            var wrapperArr = [];
            for(var i=0;i<win.wrappers.length;i++){
                if(win.wrappers[i].stack.imageIds.length>0){
                    wrapperArr.push(win.wrappers[i]);
                }
            }
            playClipData = {
                intervalId: undefined,
                framesPerSecond: framesPerSecond,
                lastFrameTimeStamp: undefined,
                frameRate: 0,
                wraps:wrapperArr
            };
            addWinState(win, playClipData);
        } else {
            playClipData = playClipToolData.data[0];
            playClipData.framesPerSecond = framesPerSecond;
        }

        // if already playing, do not set a new interval
        if (playClipData.intervalId !== undefined) {
            return;
        }
        playClipData.intervalId = setInterval(function() {
            if (playClipData.framesPerSecond > 0) {
                for(var i=0;i<playClipData.wraps.length;i++){
                    incrementTimePoint(playClipData.wraps[i], 1);
                }
            } else {
                for(var i=0;i<playClipData.wraps.length;i++){
                   incrementTimePoint(playClipData.wraps[i], -1);
                }
            }
        }, 1000 / Math.abs(playClipData.framesPerSecond));
    }
    function stop(win){
        var playClipToolData = getWinState(win);console.log(winArr);
        var playClipData;
        if (playClipToolData === undefined || playClipToolData.data.length === 0) {
            return;
        } else {
            playClipData = playClipToolData.data[0];
        }

        clearInterval(playClipData.intervalId);
        playClipData.intervalId = undefined;
    }

    // module/private exports
    cornerstoneTools.diy = {
        winPlayClip: play,
        winStopClip: stop
    };

})($, cornerstone, cornerstoneTools);
